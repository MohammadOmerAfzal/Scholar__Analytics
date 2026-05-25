import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../styles/ContentBlock.css';

// ── Text Block ──────────────────────────────────────────────
function TextBlock({ content }) {
  return (
    <div className="block-text">
      {content.textContent.split('\n').map((para, i) =>
        para ? <p key={i}>{para}</p> : <br key={i} />
      )}
    </div>
  );
}

// ── Code Block with Syntax Highlighting ─────────────────────
function CodeBlock({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Map common language names to prism-compatible format
  const getLanguage = (lang) => {
    const languageMap = {
      'python': 'python',
      'javascript': 'javascript',
      'js': 'javascript',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'csharp': 'csharp',
      'c#': 'csharp',
      'go': 'go',
      'rust': 'rust',
      'html': 'html',
      'css': 'css',
      'sql': 'sql',
      'bash': 'bash',
      'shell': 'bash',
      'json': 'json',
      'typescript': 'typescript',
      'ts': 'typescript',
      'ruby': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kotlin': 'kotlin',
    };
    return languageMap[lang?.toLowerCase()] || 'text';
  };

  return (
    <div className="block-code">
      <div className="code-header">
        <div className="code-header-left">
          <span className="code-dot red" />
          <span className="code-dot yellow" />
          <span className="code-dot green" />
          {content.codeTitle && <span className="code-title">{content.codeTitle}</span>}
        </div>
        <div className="code-header-right">
          <span className="code-lang">{content.codeLanguage || 'python'}</span>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copied' : '⎘ Copy'}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={getLanguage(content.codeLanguage)}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#1a1e2e',
          fontSize: '13.5px',
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
        }}
        showLineNumbers
        wrapLines={true}
        wrapLongLines={false}
      >
        {content.codeContent}
      </SyntaxHighlighter>
    </div>
  );
}

// ── Image Block ─────────────────────────────────────────────
function ImageBlock({ content }) {
  return (
    <figure className="block-image">
      <img src={content.imageUrl} alt={content.imageCaption || 'Analysis image'} loading="lazy" />
      {content.imageCaption && <figcaption>{content.imageCaption}</figcaption>}
    </figure>
  );
}

// ── Video Block ─────────────────────────────────────────────
function VideoBlock({ content }) {
  // Convert YouTube watch URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    return url;
  };

  const embedUrl = getEmbedUrl(content.videoUrl);
  const isYoutube = embedUrl.includes('youtube.com/embed');

  return (
    <div className="block-video">
      {content.videoTitle && <p className="video-title">{content.videoTitle}</p>}
      {isYoutube ? (
        <div className="video-wrapper">
          <iframe
            src={embedUrl}
            title={content.videoTitle || 'Video'}
            frameBorder="0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      ) : (
        <video controls src={content.videoUrl} style={{ width: '100%', borderRadius: '8px' }} />
      )}
    </div>
  );
}

// ── Table Block ─────────────────────────────────────────────
function TableBlock({ content }) {
  return (
    <div className="block-table">
      <div className="table-scroll">
        <table>
          {content.tableHeaders?.length > 0 && (
            <thead>
              <tr>
                {content.tableHeaders.map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
          )}
          <tbody>
            {content.tableRows?.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => <td key={j}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Dispatcher ─────────────────────────────────────────
export default function ContentBlock({ block }) {
  switch (block.type) {
    case 'text':  return <TextBlock content={block} />;
    case 'code':  return <CodeBlock content={block} />;
    case 'image': return <ImageBlock content={block} />;
    case 'video': return <VideoBlock content={block} />;
    case 'table': return <TableBlock content={block} />;
    default: return <p style={{ color: 'var(--text-muted)' }}>Unknown block type: {block.type}</p>;
  }
}