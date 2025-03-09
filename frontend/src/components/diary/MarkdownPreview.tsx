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

interface SecretSection {
  id: string;
  content: string;
}

const SecretSpoiler: React.FC<{ content: string }> = ({ content }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSpoiler = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="secret-spoiler border border-gray-300 rounded-md my-4 overflow-hidden">
      <div 
        className="secret-spoiler-header bg-gray-100 dark:bg-gray-700 p-2 cursor-pointer flex justify-between items-center"
        onClick={toggleSpoiler}
      >
        <span className="font-medium">シークレットスポイラー</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="p-3 border-t border-gray-300 dark:border-gray-600">
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
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, showSecrets = false }) => {
  // Process content to extract secret sections
  const [mainContent, secretSections] = React.useMemo(() => {
    const sections: SecretSection[] = [];
    let sectionId = 0;
    
    // Replace secret sections with placeholders and collect the sections
    const processedContent = content.replace(
      /:::secret\n([\s\S]*?)\n:::/g,
      (_, secretContent) => {
        const id = `secret-${sectionId++}`;
        sections.push({ id, content: secretContent });
        return `{{${id}}}`;
      }
    );
    
    return [processedContent, sections];
  }, [content]);

  // Split content by secret placeholders
  const contentParts = React.useMemo(() => {
    const parts: React.ReactNode[] = [];
    const segments = mainContent.split(/{{(secret-\d+)}}/);
    
    for (let i = 0; i < segments.length; i++) {
      if (i % 2 === 0) {
        // Regular content
        if (segments[i]) {
          parts.push(
            <ReactMarkdown
              key={`content-${i}`}
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
              {segments[i]}
            </ReactMarkdown>
          );
        }
      } else {
        // Secret placeholder
        const secretId = segments[i];
        const secret = secretSections.find(s => s.id === secretId);
        
        if (secret) {
          if (showSecrets) {
            parts.push(
              <SecretSpoiler key={secretId} content={secret.content} />
            );
          } else {
            parts.push(
              <div key={secretId} className="secret-spoiler border border-gray-300 rounded-md my-4 overflow-hidden">
                <div className="secret-spoiler-header bg-gray-100 dark:bg-gray-700 p-2">
                  <span className="font-medium">シークレットスポイラー</span>
                </div>
                <div className="p-3 border-t border-gray-300 dark:border-gray-600">
                  <p>このコンテンツは非公開です</p>
                </div>
              </div>
            );
          }
        }
      }
    }
    
    return parts;
  }, [mainContent, secretSections, showSecrets]);

  return <>{contentParts}</>;
};

export default MarkdownPreview;
