'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiPlus, FiShare2 } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DiaryList from '@/components/diary/DiaryList';
import SearchBar from '@/components/dashboard/SearchBar';

interface Diary {
  _id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MyDiaries() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch user's diaries
  useEffect(() => {
    const fetchDiaries = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const response = await axios.get('/api/diaries');
        setDiaries(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch diaries:', err);
        setError('日記の取得に失敗しました。もう一度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaries();
  }, [isAuthenticated]);

  const handleCreateDiary = () => {
    router.push('/diary/new');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('この日記を削除してもよろしいですか？')) {
      return;
    }

    try {
      await axios.delete(`/api/diaries/${id}`);
      // Remove the deleted diary from the list
      setDiaries(diaries.filter(diary => diary._id !== id));
    } catch (err: any) {
      console.error('Failed to delete diary:', err);
      alert('日記の削除に失敗しました。もう一度お試しください。');
    }
  };

  const handleShare = async (id: string) => {
    try {
      // Generate share link (or get it from server)
      const shareUrl = `${window.location.origin}/share/${id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('シェアリンクをコピーしました。');
    } catch (err) {
      console.error('Failed to share diary:', err);
      alert('シェアリンクの作成に失敗しました。');
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">マイ日記</h1>
          <button
            onClick={handleCreateDiary}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" />
            新規作成
          </button>
        </div>
        
        
        {/* Search Bar */}
        <SearchBar />

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>読み込み中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        ) : diaries.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              まだ日記がありません。最初の日記を作成しましょう！
            </p>
            <button
              onClick={handleCreateDiary}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              日記を書く
            </button>
          </div>
        ) : (
          <DiaryList diaries={diaries} onDelete={handleDelete} onShare={handleShare} />
        )}
      </div>
    </DashboardLayout>
  );
}
