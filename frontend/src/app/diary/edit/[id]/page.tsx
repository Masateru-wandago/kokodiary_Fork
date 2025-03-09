'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DiaryEditor from '@/components/diary/DiaryEditor';

interface Diary {
  _id: string;
  title: string;
  content: string;
  isPublic: boolean;
  userId: string;
}

export default function EditDiary() {
  const [diary, setDiary] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const diaryId = params?.id as string;

  // Fetch diary data
  useEffect(() => {
    const fetchDiary = async () => {
      if (!diaryId || !isAuthenticated) return;

      try {
        setIsLoading(true);
        const response = await axios.get(`/api/diaries/${diaryId}`);
        setDiary(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch diary:', err);
        setError(
          err.response?.data?.message || '日記の取得に失敗しました。もう一度お試しください。'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiary();
  }, [diaryId, isAuthenticated]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if not the owner
  useEffect(() => {
    if (diary && user && diary.userId !== user.id) {
      router.push('/dashboard');
    }
  }, [diary, user, router]);

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

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
            onClick={() => router.back()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            戻る
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <DiaryEditor
          diaryId={diaryId}
          initialData={{
            title: diary.title,
            content: diary.content,
            isPublic: diary.isPublic,
          }}
          isEditing={true}
        />
      </div>
    </DashboardLayout>
  );
}
