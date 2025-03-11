'use client';

import React from 'react';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

interface Diary {
  _id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RecentDiariesProps {
  diaries: Diary[];
  className?: string;
}

const RecentDiaries: React.FC<RecentDiariesProps> = ({ diaries, className = '' }) => {
  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get only the 3 most recent diaries
  const recentDiaries = diaries.slice(0, 3);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold">最近の日記</h2>
        <Link 
          href="/diary" 
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center text-sm"
        >
          すべて見る <FiArrowRight className="ml-1" />
        </Link>
      </div>
      
      {recentDiaries.length === 0 ? (
        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p>まだ日記がありません。最初の日記を作成しましょう！</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentDiaries.map((diary) => (
            <li key={diary._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <Link href={`/diary/${diary._id}`} className="block">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {diary.title}
                  </h3>
                  {diary.isPublic ? (
                    <span className="px-2 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      <FiEye className="mr-1" /> 公開
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      <FiEyeOff className="mr-1" /> 非公開
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(diary.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentDiaries;
