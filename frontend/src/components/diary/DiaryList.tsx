'use client';

import React from 'react';
import Link from 'next/link';
import { FiEye, FiEyeOff, FiEdit, FiTrash2 } from 'react-icons/fi';

interface Diary {
  _id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DiaryListProps {
  diaries: Diary[];
  onDelete?: (id: string) => void;
}

const DiaryList: React.FC<DiaryListProps> = ({ diaries, onDelete }) => {
  // Format date to a more readable format
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

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {diaries.map((diary) => (
          <li key={diary._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Link
                  href={`/diary/${diary._id}`}
                  className="text-lg font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 truncate"
                >
                  {diary.title}
                </Link>
                <div className="ml-2 flex-shrink-0 flex">
                  {diary.isPublic ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                      <FiEye className="mr-1" /> 公開
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      <FiEyeOff className="mr-1" /> 非公開
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    作成日: {formatDate(diary.createdAt)}
                  </p>
                  {diary.updatedAt !== diary.createdAt && (
                    <p className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-6">
                      更新日: {formatDate(diary.updatedAt)}
                    </p>
                  )}
                </div>
                <div className="mt-2 flex items-center text-sm sm:mt-0">
                  <Link
                    href={`/diary/edit/${diary._id}`}
                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4"
                  >
                    <FiEdit className="h-5 w-5" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(diary._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DiaryList;
