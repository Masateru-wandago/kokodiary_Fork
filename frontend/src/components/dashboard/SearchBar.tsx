'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    // Redirect to search page with the query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
        <div className="relative flex-grow focus-within:z-10">
          <input
            type="text"
            name="search"
            id="dashboard-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block h-full w-full rounded-none rounded-l-md border-gray-300 pl-4 focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="日記を検索..."
          />
        </div>
        <button
          type="submit"
          className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
        >
          <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-300" />
          <span>検索</span>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
