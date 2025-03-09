'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownPreviewProps {
  content: string;
  showSecrets?: boolean;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, showSecrets = false }) => {
  // Process content to handle secret spoilers
  console.log("MarkdownPreview - showSecrets:", showSecrets);
  console.log("MarkdownPreview - content:", content);
  
  const processedContent = React.useMemo(() => {
    if (showSecrets) {
      console.log("MarkdownPreview - Showing secrets");
      // Replace secret tags with a div for styling but keep content
      return content.replace(
        /:::secret\n([\s\S]*?)\n:::/g,
        (_, secretContent) => {
          console.log("MarkdownPreview - Secret content found:", secretContent);
          return `<div class="secret-spoiler"><div class="secret-spoiler-header">シークレットスポイラー</div>${secretContent}</div>`;
        }
      );
    } else {
      console.log("MarkdownPreview - Hiding secrets");
      // Replace secret content with a placeholder
      return content.replace(
        /:::secret\n[\s\S]*?\n:::/g,
        '<div class="secret-spoiler"><div class="secret-spoiler-header">シークレットスポイラー</div><p>このコンテンツは非公開です</p></div>'
      );
    }
  }, [content, showSecrets]);
  
  console.log("MarkdownPreview - processedContent:", processedContent);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              // @ts-ignore - Type error with the style prop
              style={tomorrow}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownPreview;
