'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionGraphProps {
  className?: string;
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ className = '' }) => {
  const [contributionData, setContributionData] = useState<ContributionDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Get dates for the last year (365 days)
  const getLastYearDates = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.unshift(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
    
    return dates;
  };

  // Fetch contribution data
  useEffect(() => {
    const fetchContributionData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        
        // Fetch all diaries to get creation dates
        const response = await axios.get('/api/diaries');
        
        // Create a map of dates to count
        const dateCountMap: Record<string, number> = {};
        
        // Initialize all dates in the last year with count 0
        getLastYearDates().forEach(date => {
          dateCountMap[date] = 0;
        });
        
        // Count diaries created on each date
        response.data.forEach((diary: any) => {
          const createdDate = new Date(diary.createdAt).toISOString().split('T')[0];
          if (dateCountMap[createdDate] !== undefined) {
            dateCountMap[createdDate] += 1;
          }
        });
        
        // Convert to array format
        const contributionData = Object.entries(dateCountMap).map(([date, count]) => ({
          date,
          count
        }));
        
        setContributionData(contributionData);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch contribution data:', err);
        setError('活動データの取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributionData();
  }, [isAuthenticated]);

  // Get color based on contribution count - adjusted for approximately 1 post per day
  const getColorClass = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-600';
    if (count === 1) return 'bg-green-300 dark:bg-green-700'; // Make 1 post more visible
    if (count >= 2) return 'bg-green-500 dark:bg-green-500'; // Simplify to just show 2+ posts
    return 'bg-gray-100 dark:bg-gray-800';
  };

  // Group data by weeks for display
  const getWeeksData = (): ContributionDay[][] => {
    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];
    
    contributionData.forEach((day, index) => {
      currentWeek.push(day);
      
      // Start a new week every 7 days
      if ((index + 1) % 7 === 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add the last week if it's not complete
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  // Format date for tooltip
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const weeksData = getWeeksData();

  return (
    <div className={`p-2 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <h2 className="text-lg font-semibold mb-4">活動記録 (ただしくうごいてない)</h2>
      <div className="">
        <div className="flex flex-col">
          {/* Month labels at the top - reversed to match the graph */}
          <div className="flex mb-1">
            <div className="w-8"></div>
            <div className="flex flex-1 text-xs text-gray-500 dark:text-gray-400">
              {Array.from({ length: 12 }, (_, i) => {
                // Reverse the order so most recent month is on the right
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                return (
                  <div key={i} className="flex-1 text-center whitespace-nowrap">
                    {date.toLocaleDateString('ja-JP', { month: 'short' })}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex">
            {/* Day of week labels on the left */}
            <div className="flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
              <span>日</span>
              <span>月</span>
              <span>火</span>
              <span>水</span>
              <span>木</span>
              <span>金</span>
              <span>土</span>
            </div>
            
            {/* Contribution squares - with most recent week on the right */}
            <div className="flex-1">
              <div className="grid grid-cols-52 gap-1">
                {Array.from({ length: 7 }).map((_, dayOfWeek) => {
                  // Get days for this day of week
                  const daysForThisWeekday = contributionData
                    .filter((_, index) => index % 7 === dayOfWeek)
                    .slice(-52); // Last 52 weeks
                  
                  // Create an array of 52 weeks
                  const weeksToShow = Array.from({ length: 52 });
                  
                  return (
                    <React.Fragment key={dayOfWeek}>
                      {weeksToShow.map((_, weekIndex) => {
                        // Get the day for this week (in reverse order)
                        const reversedWeekIndex = 51 - weekIndex;
                        const day = daysForThisWeekday[reversedWeekIndex] || { date: `empty-${dayOfWeek}-${weekIndex}`, count: 0 };
                        
                        return (
                          <div
                            key={day.date}
                            className={`w-3 h-3 rounded-sm ${getColorClass(day.count)}`}
                            title={day.date.startsWith('empty') ? 
                              '日記なし' : 
                              `${formatDate(day.date)}: ${day.count}件の日記`}
                          ></div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="mr-2">なし</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
              <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
            </div>
            <span className="ml-2">あり</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
