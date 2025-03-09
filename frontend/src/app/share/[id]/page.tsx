import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import SharedDiaryClient from '@/components/diary/SharedDiaryClient';

// Define the type for the page parameters
type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Function to fetch diary data from the API
async function getDiary(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/diaries/share/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      if (response.status === 403) {
        return { forbidden: true };
      }
      throw new Error('Failed to fetch diary');
    }

    return { diary: await response.json() };
  } catch (error) {
    console.error('Error fetching diary:', error);
    return { error: 'Failed to fetch diary' };
  }
}

// Generate metadata for the page
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch diary data
  const { diary, notFound: isNotFound, forbidden, error } = await getDiary(params.id);
  
  // If diary not found or forbidden, return default metadata
  if (isNotFound || forbidden || error || !diary) {
    return {
      title: 'KokoDiary - 日記が見つかりません',
      description: 'この日記は存在しないか、非公開に設定されています。',
    };
  }

  // Get parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  // Extract a short description from the content (first 100 characters)
  const description = diary.content
    .replace(/:::secret[\s\S]*?:::/g, '') // Remove secret content
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .slice(0, 160)
    .trim() + (diary.content.length > 160 ? '...' : '');

  // Return metadata with OGP
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
          url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/og?title=${encodeURIComponent(diary.title)}&author=${encodeURIComponent(diary.userId.username)}`,
          width: 1200,
          height: 630,
          alt: diary.title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: diary.title,
      description: description,
      images: [`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/og?title=${encodeURIComponent(diary.title)}&author=${encodeURIComponent(diary.userId.username)}`],
    },
  };
}

// Main page component
export default async function SharedDiaryPage({ params }: Props) {
  const { diary, notFound: isNotFound, forbidden, error } = await getDiary(params.id);
  
  // Handle errors
  if (isNotFound) {
    notFound();
  }

  // Pass the data to the client component
  return <SharedDiaryClient 
    initialData={diary} 
    error={forbidden ? 'この日記は非公開です。' : error} 
    diaryId={params.id} 
  />;
}
