import mongoose, { Document, Schema } from 'mongoose';

export interface IDiary extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const diarySchema = new Schema<IDiary>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true
    },
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create index for searching
diarySchema.index({ title: 'text', content: 'text' });

// Create index for userId for faster queries
diarySchema.index({ userId: 1 });

// Create compound index for public diaries
diarySchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.model<IDiary>('Diary', diarySchema);
