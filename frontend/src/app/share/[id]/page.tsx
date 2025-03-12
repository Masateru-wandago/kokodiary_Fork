import React from 'react';
import SharedDiaryClient from '@/components/diary/SharedDiaryClient';
import { Metadata, ResolvingMetadata } from 'next';
import axios from 'axios';

interface Diary {
  _id: string;
  title: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    username: string;
  };
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  
  try {
    // Fetch diary data from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/diaries/share/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      // Return default metadata if diary not found or not public
      return {
        title: 'KokoDiary - 共有日記',
        description: 'KokoDiaryで共有された日記です。',
      };
    }
    
    const diary: Diary = await response.json();
    
    // Create description from content (truncate if needed)
    const description = diary.content.length > 200 
      ? diary.content.substring(0, 200) + '...' 
      : diary.content;
    
    // Generate OG image URL with title and author
    const ogImageUrl = new URL('/api/og', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    ogImageUrl.searchParams.set('title', diary.title);
    ogImageUrl.searchParams.set('author', diary.userId.username);
    
    return {
      title: `${diary.title} | KokoDiary`,
      description: description,
      openGraph: {
        title: diary.title,
        description: description,
        type: 'article',
        publishedTime: diary.createdAt,
        modifiedTime: diary.updatedAt,
        authors: [diary.userId.username],
        images: [
          {
            url: ogImageUrl.toString(),
            width: 1200,
            height: 630,
            alt: diary.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: diary.title,
        description: description,
        images: [ogImageUrl.toString()],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'KokoDiary - 共有日記',
      description: 'KokoDiaryで共有された日記です。',
    };
  }
}

// Main page component
export default async function SharedDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  return (
    <SharedDiaryClient
      initialData={null}
      error={null}
      diaryId={id}
    />
  );
}
