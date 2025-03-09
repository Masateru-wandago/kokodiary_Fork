import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Get the searchParams from the request
    const { searchParams } = new URL(request.url);
    
    // Get title and author from the searchParams
    const title = searchParams.get('title') || 'KokoDiary';
    const author = searchParams.get('author') || '';
    
    // Truncate title if it's too long
    const truncatedTitle = title.length > 70 
      ? title.substring(0, 70) + '...' 
      : title;

    // Get current date in Japanese format
    const date = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            backgroundImage: 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
            padding: '40px 80px',
          }}
        >
          {/* Logo and App Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 'bold',
                color: '#4f46e5',
              }}
            >
              KokoDiary
            </div>
          </div>

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              padding: '40px',
              width: '100%',
              height: '70%',
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#111827',
                textAlign: 'center',
                marginBottom: '20px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {truncatedTitle}
            </div>

            {/* Divider */}
            <div
              style={{
                width: '80%',
                height: '2px',
                backgroundColor: '#e5e7eb',
                margin: '20px 0',
              }}
            />

            {/* Author and Date */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                color: '#6b7280',
                fontSize: 24,
              }}
            >
              <div>作成者: {author}</div>
              <div>{date}</div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '20px',
              color: '#6b7280',
              fontSize: 20,
            }}
          >
            KokoDiary - あなたの日記をシンプルに
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
