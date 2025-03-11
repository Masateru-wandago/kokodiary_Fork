'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContributionGraph from '@/components/dashboard/ContributionGraph';
import RecentDiaries from '@/components/dashboard/RecentDiaries';
import { FiPlus } from 'react-icons/fi';

interface Diary {
  _id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
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
        console.log('Fetching diaries for user:', user?._id);
        
        const response = await axios.get('/api/diaries');
        console.log('Diaries response:', response.data);
        
        setDiaries(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch diaries details:', err);
        console.error('Error response:', err.response);
        console.error('Error message:', err.message);
        setError('日記の取得に失敗しました。もう一度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiaries();
  }, [isAuthenticated, user]);

  const handleCreateDiary = () => {
    router.push('/diary/new');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">ダッシュボード</h1>
          <button
            onClick={handleCreateDiary}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
          >
            <FiPlus className="mr-2" />
            新規作成
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>読み込み中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contribution Graph - Takes up full width on small screens, 2/3 on large screens */}
            <div className="lg:col-span-2">
              <ContributionGraph />
            </div>
            
            {/* Recent Diaries - Takes up full width on small screens, 1/3 on large screens */}
            <div className="lg:col-span-1">
              <RecentDiaries diaries={diaries} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
