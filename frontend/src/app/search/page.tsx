'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DiaryList from '@/components/diary/DiaryList';

interface Diary {
  _id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SearchDiaries() {
  const [searchQuery, setSearchQuery] = useState('');
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('検索キーワードを入力してください');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`/api/diaries/search?q=${encodeURIComponent(searchQuery)}`);
      setDiaries(response.data);
      setHasSearched(true);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || '検索に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6">日記を検索</h1>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex rounded-md shadow-sm">
            <div className="relative flex-grow focus-within:z-10">
              <input
                type="text"
                name="search"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-none rounded-l-md border-gray-300 pl-4 focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="キーワードを入力..."
              />
            </div>
            <button
              type="submit"
              className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            >
              <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <span>検索</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>検索中...</p>
          </div>
        ) : hasSearched ? (
          diaries.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">
                「{searchQuery}」に一致する日記は見つかりませんでした。
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                「{searchQuery}」の検索結果: {diaries.length}件
              </p>
              <DiaryList diaries={diaries} onDelete={handleDelete} />
            </>
          )
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              タイトルや内容に含まれるキーワードで検索できます。
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
