'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiEye, FiEyeOff, FiEdit, FiTrash2, FiList, FiCalendar, FiShare2 } from 'react-icons/fi';
import { format } from 'date-fns';

interface Diary {
  _id: string;
  title: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DiaryListProps {
  diaries: Diary[];
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

type ViewMode = 'list' | 'calendar';

const DiaryList: React.FC<DiaryListProps> = ({ diaries, onDelete, onShare }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view mode from URL or default to 'list'
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'list'
  );
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Update URL when view mode changes
  const updateViewMode = (newMode: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newMode);
    router.push(`?${params.toString()}`, { scroll: false });
    setViewMode(newMode);
  };

  // Listen for URL changes
  useEffect(() => {
    const mode = searchParams.get('view') as ViewMode;
    if (mode && (mode === 'list' || mode === 'calendar')) {
      setViewMode(mode);
    }
  }, [searchParams]);

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

  // Format date for calendar display (just day)
  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  // Get year and month for calendar header
  const getMonthYearHeader = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
    });
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };

  // Group diaries by date for calendar view
  const getDiariesByDate = () => {
    const diariesByDate: Record<string, Diary[]> = {};
    
    diaries.forEach(diary => {
      const date = new Date(diary.createdAt);
      // Using YYYY-MM-DD format for consistency
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!diariesByDate[dateKey]) {
        diariesByDate[dateKey] = [];
      }
      
      diariesByDate[dateKey].push(diary);
    });
    
    return diariesByDate;
  };

  // Reset to current month
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Check if a day is today
  const isToday = (year: number, month: number, day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Render calendar view
  const renderCalendarView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const diariesByDate = getDiariesByDate();
    
    // Create array of day cells
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month}-${day}`;
      const dayDiaries = diariesByDate[dateKey] || [];
      
      days.push(
        <div 
          key={day} 
          className={`h-24 border border-gray-200 dark:border-gray-700 p-1 overflow-hidden ${
            isToday(year, month, day) 
              ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 dark:ring-primary-400' 
              : ''
          }`}
        >
          <div className={`font-semibold text-sm mb-1 ${
            isToday(year, month, day) 
              ? 'text-primary-600 dark:text-primary-400' 
              : ''
          }`}>{day}</div>
          <div className="overflow-y-auto max-h-16">
            {dayDiaries.map(diary => (
              <Link
                key={diary._id}
                href={`/diary/${diary._id}`}
                className="block text-xs truncate mb-1 p-1 rounded bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
              >
                {diary.title}
              </Link>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button 
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="前月"
            >
              ←
            </button>
            <button
              onClick={goToToday}
              className="ml-1 px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              今日
            </button>
          </div>
          <h2 className="text-lg font-semibold">{getMonthYearHeader(currentMonth)}</h2>
          <button 
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="翌月"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="text-center font-medium text-sm py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {diaries.map((diary) => (
          <div
            key={diary._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <Link href={`/diary/${diary._id}`} className="block">
              <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">
                {diary.title || '無題'}
              </h3>
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{format(new Date(diary.updatedAt), 'yyyy/MM/dd')}</span>
                <span>{diary.isPublic ? '公開' : '非公開'}</span>
              </div>
            </Link>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2">
              <Link
                href={`/diary/${diary._id}/edit`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full dark:hover:bg-blue-900/20 dark:text-blue-400"
                title="編集"
              >
                <FiEdit size={16} />
              </Link>
              <button
                onClick={() => onShare(diary._id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full dark:hover:bg-green-900/20 dark:text-green-400"
                title="共有"
              >
                <FiShare2 size={16} />
              </button>
              <button
                onClick={() => onDelete(diary._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full dark:hover:bg-red-900/20 dark:text-red-400"
                title="削除"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => updateViewMode('list')}
          className={`flex items-center px-4 py-2 mr-2 ${
            viewMode === 'list'
              ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FiList className="mr-2" /> リスト表示
        </button>
        <button
          onClick={() => updateViewMode('calendar')}
          className={`flex items-center px-4 py-2 ${
            viewMode === 'calendar'
              ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <FiCalendar className="mr-2" /> カレンダー表示
        </button>
      </div>
      
      {viewMode === 'list' ? renderListView() : renderCalendarView()}
    </div>
  );
};

export default DiaryList;
