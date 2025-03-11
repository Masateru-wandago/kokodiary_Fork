'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FiEye, FiEyeOff, FiSave, FiX, FiCalendar } from 'react-icons/fi';
import MarkdownPreview from './MarkdownPreview';

interface DiaryEditorProps {
  diaryId?: string;
  initialData?: {
    title: string;
    content: string;
    isPublic: boolean;
  };
  isEditing?: boolean;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({
  diaryId,
  initialData,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
      setIsPublic(initialData.isPublic);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    if (!content.trim()) {
      setError('内容を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && diaryId) {
        // Update existing diary
        console.log('Updating diary with ID:', diaryId);
        console.log('Update payload:', { title, content, isPublic });
        
        try {
          // Log the full URL being used
          const url = `/api/diaries/${diaryId}`;
          console.log('Making PUT request to URL:', url);
          console.log('Authorization header:', axios.defaults.headers.common['Authorization'] ? 'Present' : 'Not present');
          
          // Make the request with explicit headers
          const response = await axios({
            method: 'put',
            url: url,
            data: {
              title,
              content,
              isPublic,
            },
            headers: {
              'Content-Type': 'application/json',
              // Include Authorization header from axios defaults
            }
          });
          
          console.log('Update diary response:', response.data);
          
          // Redirect to dashboard on success
          router.push('/dashboard');
        } catch (updateErr: any) {
          console.error('Update diary error details:', updateErr);
          console.error('Update error response:', updateErr.response?.data);
          console.error('Update error status:', updateErr.response?.status);
          console.error('Update error headers:', updateErr.response?.headers);
          console.error('Update error config:', updateErr.config);
          throw updateErr;
        }
      } else {
        // Create new diary
        console.log('Creating new diary');
        console.log('Create payload:', { title, content, isPublic });
        
        const response = await axios.post('/api/diaries', {
          title,
          content,
          isPublic,
        });
        console.log('Create diary response:', response.data);
        
        // Redirect to dashboard on success
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Failed to save diary details:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError(
        err.response?.data?.message || '日記の保存に失敗しました。もう一度お試しください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const insertSecretSpoiler = () => {
    const textarea = document.getElementById('diary-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent =
      content.substring(0, start) +
      `:::secret\n${selectedText || 'ここに非公開にしたい内容を書きます'}\n:::` +
      content.substring(end);

    setContent(newContent);

    // Focus back on textarea and set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + (selectedText ? selectedText.length : 0) + 24;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const insertCurrentDate = () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-');
    
    setTitle(current => {
      // If title already has date, replace it, otherwise prepend date
      const dateRegex = /^\d{4}-\d{2}-\d{2}/;
      if (dateRegex.test(current)) {
        return `${formattedDate}${current.replace(dateRegex, '')}`;
      }
      return `${formattedDate} ${current.trim()}`;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          {isEditing ? '日記を編集' : '新しい日記を作成'}
        </h3>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="diary-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                タイトル
              </label>
              <button
                type="button"
                onClick={insertCurrentDate}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-100 dark:bg-primary-800 dark:hover:bg-primary-700"
              >
                <FiCalendar className="mr-1 h-3 w-3" />
                今日の日付を挿入
              </button>
            </div>
            <input
              type="text"
              id="diary-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="日記のタイトル"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-100 dark:bg-primary-800 dark:hover:bg-primary-700"
              >
                {isPreview ? 'エディタに戻る' : 'プレビュー'}
              </button>
              {!isPreview && (
                <button
                  type="button"
                  onClick={insertSecretSpoiler}
                  className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-100 dark:bg-red-800 dark:hover:bg-red-700"
                >
                  シークレットスポイラーを挿入
                </button>
              )}
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
                {isPublic ? '公開' : '非公開'}
              </span>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  isPublic ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
                <span className="sr-only">公開設定</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="diary-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              内容
            </label>
            {isPreview ? (
              <div className="mt-1 p-3 border border-gray-300 rounded-md shadow-sm dark:border-gray-600 min-h-[300px] markdown-content">
                <MarkdownPreview content={content} showSecrets={true} />
              </div>
            ) : (
              <textarea
                id="diary-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                placeholder="Markdownで日記を書きましょう..."
              />
            )}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Markdownがサポートされています。シークレットスポイラーは :::secret と ::: で囲みます。
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
            >
              <FiX className="mr-2 -ml-1 h-5 w-5" />
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="mr-2 -ml-1 h-5 w-5" />
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiaryEditor;
