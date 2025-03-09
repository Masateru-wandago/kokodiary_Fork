'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          KokoDiary
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {!isAuthenticated && !isLoading && (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-md bg-secondary-600 text-white hover:bg-secondary-700 transition-colors"
              >
                登録
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center text-center max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">KokoDiary</h1>
        <p className="text-xl mb-8">
          Markdownをサポートし、シークレットスポイラー機能を持つ日記アプリケーション
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3">Markdown対応</h2>
            <p>
              日記をMarkdown形式で書くことができます。見出し、リスト、コード、リンクなどを簡単に追加できます。
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3">公開/非公開設定</h2>
            <p>
              日記を公開するか非公開にするかを選択できます。公開された日記は他のユーザーが閲覧できます。
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-3">シークレットスポイラー</h2>
            <p>
              日記の一部を非公開にできるシークレットスポイラー機能を使用できます。
            </p>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {!isAuthenticated && !isLoading && (
          <>
            <Link
              href="/register"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            >
              <h2 className="mb-3 text-2xl font-semibold">
                始める{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
              <p className="m-0 max-w-[30ch] text-sm opacity-50">
                アカウントを作成して日記を書き始めましょう。
              </p>
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
