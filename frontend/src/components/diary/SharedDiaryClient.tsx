'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

interface SharedDiaryClientProps {
  initialData: Diary | null;
  error: string | null;
  diaryId: string;
}

export default function SharedDiaryClient({ initialData, error: initialError, diaryId }: SharedDiaryClientProps) {
  const [diary, setDiary] = useState<Diary | null>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData && !initialError);
  const [error, setError] = useState<string | null>(initialError);

  // Fetch diary data if not provided initially
  useEffect(() => {
    const fetchDiary = async () => {
      if (initialData || initialError || !diaryId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/diaries/share/${diaryId}`);
        setDiary(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch shared diary:', err);
        if (err.response?.status === 403) {
          setError('この日記は非公開です。');
        } else if (err.response?.status === 404) {
          setError('日記が見つかりませんでした。');
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
  }, [diaryId, initialData, initialError]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
        <p className="text-gray-700 dark:text-gray-300">読み込み中...</p>
      </div>
    );
  }

  if (error || !diary) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8 flex justify-center">
        <div className="max-w-3xl w-full">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error || '日記が見つかりませんでした。'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 md:p-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{diary.title}</h3>
            <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">作成者: {diary.userId.username}</span>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                  公開
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
              <MarkdownPreview content={diary.content} showSecrets={false} />
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <a href="/" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                KokoDiary
              </a>
              でアカウントを作成して、あなたも日記を書いてみませんか？
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
