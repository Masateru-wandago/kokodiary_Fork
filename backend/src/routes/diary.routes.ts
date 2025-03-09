import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Diary from '../models/diary.model';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Helper function to process content and handle secret spoilers
const processContent = (content: string, includeSecrets: boolean): string => {
  if (includeSecrets) {
    return content;
  }
  
  // Remove content between :::secret and ::: tags
  return content.replace(/:::secret[\s\S]*?:::/g, '[Secret content]');
};

// @route   GET /api/diaries
// @desc    Get all diaries for the current user
// @access  Private
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const diaries = await Diary.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('title isPublic createdAt updatedAt');

    res.json(diaries);
  } catch (error) {
    console.error('Get diaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/diaries/public
// @desc    Get all public diaries
// @access  Public
router.get('/public', async (req: Request, res: Response) => {
  try {
    const diaries = await Diary.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'username')
      .select('title userId createdAt updatedAt');

    res.json(diaries);
  } catch (error) {
    console.error('Get public diaries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/diaries/share/:id
// @desc    Get a shared diary by ID without authentication
// @access  Public
router.get(
  '/share/:id',
  [param('id').isMongoId().withMessage('Invalid diary ID')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const diary = await Diary.findById(req.params.id).populate(
        'userId',
        'username'
      );

      if (!diary) {
        return res.status(404).json({ message: 'Diary not found' });
      }

      // Only allow access to public diaries
      if (!diary.isPublic) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Process content to handle secret spoilers (never show secrets in shared view)
      const processedContent = processContent(diary.content, false);
      
      const result = {
        ...diary.toObject(),
        content: processedContent
      };

      res.json(result);
    } catch (error) {
      console.error('Get shared diary error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/diaries/search
// @desc    Search user's diaries
// @access  Private
router.get(
  '/search',
  authenticate,
  [query('q').notEmpty().withMessage('Search query is required')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const searchQuery = req.query.q as string;

    try {
      const diaries = await Diary.find({
        userId: req.user._id,
        $text: { $search: searchQuery }
      })
        .sort({ score: { $meta: 'textScore' } })
        .select('title isPublic createdAt updatedAt');

      res.json(diaries);
    } catch (error) {
      console.error('Search diaries error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/diaries/:id
// @desc    Get a diary by ID
// @access  Private/Public (depending on diary's isPublic setting)
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid diary ID')],
  authenticate,
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const diary = await Diary.findById(req.params.id).populate(
        'userId',
        'username'
      );

      if (!diary) {
        return res.status(404).json({ message: 'Diary not found' });
      }

      // Check if diary is public or belongs to the authenticated user
      console.log("User data:", req.user);
      console.log("Diary userId:", diary.userId);
      console.log("User _id:", req.user?._id);
      
      // Check if diary.userId is an object with _id property or a direct ObjectId
      const diaryUserId = diary.userId._id ? diary.userId._id : diary.userId;
      
      // Ensure both IDs are converted to strings for comparison
      const isOwner = req.user && diaryUserId.toString() === req.user._id.toString();
      console.log("Diary userId for comparison:", diaryUserId);
      console.log("Is owner:", isOwner);
      
      if (!diary.isPublic && !isOwner) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Process content to handle secret spoilers
      console.log("Processing content with includeSecrets:", isOwner);
      const processedContent = processContent(diary.content, isOwner);
      
      const result = {
        ...diary.toObject(),
        content: processedContent
      };

      res.json(result);
    } catch (error) {
      console.error('Get diary error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   POST /api/diaries
// @desc    Create a new diary
// @access  Private
router.post(
  '/',
  authenticate,
  [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content').notEmpty().withMessage('Content is required'),
    body('isPublic').isBoolean().withMessage('isPublic must be a boolean value')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, isPublic } = req.body;

      const newDiary = new Diary({
        userId: req.user._id,
        title,
        content,
        isPublic: isPublic || false
      });

      await newDiary.save();

      res.status(201).json({
        message: 'Diary created successfully',
        diary: {
          id: newDiary._id,
          title: newDiary.title,
          isPublic: newDiary.isPublic,
          createdAt: newDiary.createdAt
        }
      });
    } catch (error) {
      console.error('Create diary error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/diaries/:id
// @desc    Update a diary
// @access  Private
router.put(
  '/:id',
  authenticate,
  [
    param('id').isMongoId().withMessage('Invalid diary ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('content').optional(),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean value')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Find diary and check ownership
      const diary = await Diary.findById(req.params.id);

      if (!diary) {
        return res.status(404).json({ message: 'Diary not found' });
      }

      // Check if diary.userId is an object with _id property or a direct ObjectId
      const diaryUserId = diary.userId._id ? diary.userId._id : diary.userId;
      
      if (diaryUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this diary' });
      }

      // Update fields
      const { title, content, isPublic } = req.body;
      
      if (title !== undefined) diary.title = title;
      if (content !== undefined) diary.content = content;
      if (isPublic !== undefined) diary.isPublic = isPublic;

      await diary.save();

      res.json({
        message: 'Diary updated successfully',
        diary: {
          id: diary._id,
          title: diary.title,
          isPublic: diary.isPublic,
          updatedAt: diary.updatedAt
        }
      });
    } catch (error) {
      console.error('Update diary error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/diaries/:id
// @desc    Delete a diary
// @access  Private
router.delete(
  '/:id',
  authenticate,
  [param('id').isMongoId().withMessage('Invalid diary ID')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Find diary and check ownership
      const diary = await Diary.findById(req.params.id);

      if (!diary) {
        return res.status(404).json({ message: 'Diary not found' });
      }

      // Check if diary.userId is an object with _id property or a direct ObjectId
      const diaryUserId = diary.userId._id ? diary.userId._id : diary.userId;
      
      if (diaryUserId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this diary' });
      }

      await diary.deleteOne();

      res.json({ message: 'Diary deleted successfully' });
    } catch (error) {
      console.error('Delete diary error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
