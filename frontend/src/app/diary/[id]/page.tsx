'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FiEdit, FiTrash2, FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MarkdownPreview from '@/components/diary/MarkdownPreview';

interface Diary {
  _id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    username: string;
  };
}

export default function DiaryView() {
  const [diary, setDiary] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const diaryId = params?.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push(`/login?redirect=/diary/${diaryId}`);
    }
  }, [isAuthenticated, isLoading, router, diaryId]);

  // Fetch diary data
  useEffect(() => {
    const fetchDiary = async () => {
      if (!diaryId) return;
      
      // Don't fetch if not authenticated yet
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        console.log('Fetching diary with ID:', diaryId);
        
        const response = await axios.get(`/api/diaries/${diaryId}`);
        console.log('Diary response:', response.data);
        
        setDiary(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch diary details:', err);
        console.error('Error response:', err.response);
        console.error('Error message:', err.message);
        
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Authentication or authorization error
          setError('この日記を閲覧する権限がありません。');
        } else {
          setError(
            err.response?.data?.message || '日記の取得に失敗しました。もう一度お試しください。'
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiary();
  }, [diaryId, isAuthenticated]);

  // Check if user is the owner of the diary
  console.log("User data:", user);
  console.log("Diary data:", diary);
  console.log("User ID:", user?._id);
  console.log("Diary userId:", diary?.userId?._id);
  
  // Get the diary user ID, handling both object and string cases
  const diaryUserId = diary?.userId?._id || diary?.userId;
  
  // Convert both IDs to strings for comparison with additional null checks
  const isOwner = !!user && !!user._id && !!diaryUserId && 
    diaryUserId.toString() === user._id.toString();
  console.log("Diary userId for comparison:", diaryUserId);
  console.log("Is owner:", isOwner);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    router.push(`/diary/edit/${diaryId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('この日記を削除してもよろしいですか？')) {
      return;
    }

    try {
      console.log('Deleting diary with ID:', diaryId);
      
      await axios.delete(`/api/diaries/${diaryId}`);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Failed to delete diary:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      alert('日記の削除に失敗しました。もう一度お試しください。');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    if (!diary || !diary.isPublic) return;
    
    const shareLink = `${window.location.origin}/share/${diaryId}`;
    setShareUrl(shareLink);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy share link:', err);
      });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 md:p-8 flex justify-center items-center h-64">
          <p>読み込み中...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !diary) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error || '日記が見つかりませんでした。'}
          </div>
          <button
            onClick={handleBack}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            戻る
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            戻る
          </button>
          <div className="flex space-x-2">
            {diary.isPublic && (
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
              >
                <FiShare2 className="mr-2 -ml-1 h-5 w-5" />
                共有
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FiEdit className="mr-2 -ml-1 h-5 w-5" />
                  編集
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FiTrash2 className="mr-2 -ml-1 h-5 w-5" />
                  削除
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{diary.title}</h3>
            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">作成者: {diary.userId.username}</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  diary.isPublic 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {diary.isPublic ? '公開' : '非公開'}
                </span>
              </div>
              <div className="mt-2 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
                <p>作成日: {formatDate(diary.createdAt)}</p>
                {diary.updatedAt !== diary.createdAt && (
                  <p>更新日: {formatDate(diary.updatedAt)}</p>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <div className="prose dark:prose-invert max-w-none markdown-content">
              <MarkdownPreview content={diary.content} showSecrets={isOwner} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Share toast notification */}
      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
          共有リンクがコピーされました
        </div>
      )}
    </DashboardLayout>
  );
}
