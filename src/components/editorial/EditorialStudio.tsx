import React, { useState, useMemo, useRef } from 'react';
import { EDITORIAL_TEMPLATES } from '../../data/templates';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Link as LinkIcon,
  Minus,
  Download,
  Copy,
  Check,
  Search,
  BookOpen,
  Eye,
  Columns,
  RotateCcw,
} from 'lucide-react';

interface EditorialStudioProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const EditorialStudio: React.FC<EditorialStudioProps> = ({ onNotify }) => {
  const [content, setContent] = useState<string>(EDITORIAL_TEMPLATES[0].content);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Document metrics
  const stats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = content.length;
    const readingTime = Math.ceil(words / 200);
    const paragraphs = content
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0).length;
    return { words, chars, readingTime, paragraphs };
  }, [content]);

  // Insert formatting at cursor
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Find & Replace
  const matchCount = useMemo(() => {
    if (!findText) return 0;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  }, [content, findText]);

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const updated = content.replace(regex, replaceText);
    setContent(updated);
    onNotify('success', 'Replaced All Matches', `${matchCount} instances updated.`);
  };

  // Export handlers
  const handleDownloadFile = (ext: 'md' | 'html' | 'txt') => {
    let output = content;
    let mime = 'text/markdown';

    if (ext === 'html') {
      mime = 'text/html';
      output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Editorial Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; }
    h1, h2, h3 { line-height: 1.25; }
    blockquote { border-left: 3px solid #ccc; margin: 1em 0; padding-left: 1em; color: #555; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
    pre code { display: block; padding: 1em; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f9f9f9; }
  </style>
</head>
<body>
${renderMarkdownToHtml(content)}
</body>
</html>`;
    } else if (ext === 'txt') {
      mime = 'text/plain';
      output = content.replace(/[#*`_~>]/g, '');
    }

    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editorial-document.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('success', `Exported .${ext}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onNotify('success', 'Copied to Clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950 text-neutral-200">
      {/* Editorial Top Toolbar */}
      <div className="h-12 border-b border-neutral-800/80 bg-neutral-950/80 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Formatting Actions */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => insertFormatting('# ', '', 'Heading 1')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('## ', '', 'Heading 2')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('### ', '', 'Heading 3')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('~~', '~~', 'strikethrough')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          <button
            onClick={() => insertFormatting('> ', '', 'Quoted thought')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('`', '`', 'code')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('- ', '', 'List item')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('1. ', '', 'Numbered item')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('- [ ] ', '', 'Task item')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Checklist"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              insertFormatting(
                '\n| Dimension | Value |\n| :--- | :--- |\n| Metric A | 100 |\n| Metric B | 200 |\n\n'
              )
            }
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('[', '](https://example.com)', 'link text')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('\n---\n\n')}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Divider Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Find & Replace toggle */}
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`p-1.5 rounded transition-colors ${
              showFindReplace
                ? 'bg-rose-500/20 text-rose-400'
                : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Find & Replace"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* View mode toggle & Template dropdown */}
        <div className="flex items-center gap-2">
          {/* Templates */}
          <select
            onChange={(e) => {
              const tmpl = EDITORIAL_TEMPLATES.find((t) => t.id === e.target.value);
              if (tmpl) {
                setContent(tmpl.content);
                onNotify('info', `Loaded: ${tmpl.title}`);
              }
            }}
            className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
          >
            <option value="">Load Template...</option>
            {EDITORIAL_TEMPLATES.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>
                {tmpl.title}
              </option>
            ))}
          </select>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1 rounded ${
                viewMode === 'split' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Split View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1 rounded ${
                viewMode === 'edit' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Editor Only"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1 rounded ${
                viewMode === 'preview'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export & Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
            title="Copy Markdown"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleDownloadFile('md')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-xs font-medium text-neutral-200 transition-colors"
            title="Download .md"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>.md</span>
          </button>
        </div>
      </div>

      {/* Find & Replace Strip */}
      {showFindReplace && (
        <div className="px-4 py-2 bg-neutral-900/90 border-b border-neutral-800 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Find..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-36"
            />
            {findText && (
              <span className="text-[10px] font-mono text-neutral-400">
                {matchCount} match{matchCount === 1 ? '' : 'es'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1">
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-36"
            />
          </div>

          <button
            onClick={handleReplaceAll}
            disabled={!findText || matchCount === 0}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 rounded font-medium transition-colors"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Editor & Preview Split Panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Raw Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'border-r border-neutral-800/80' : ''}`}>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your creative brief, article, or documentation here in markdown..."
              className="flex-1 w-full p-6 bg-neutral-950 text-neutral-200 font-mono text-sm leading-relaxed resize-none focus:outline-none selection:bg-rose-500/20"
              spellCheck={false}
            />
          </div>
        )}

        {/* Formatted Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex-1 overflow-y-auto p-8 bg-neutral-900/30 selection:bg-rose-500/20">
            <div
              className="max-w-2xl mx-auto prose prose-invert prose-neutral leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
            />
          </div>
        )}
      </div>

      {/* Live Document Metrics Footer */}
      <div className="h-8 border-t border-neutral-800/80 bg-neutral-950 px-4 flex items-center justify-between text-[11px] text-neutral-500 font-mono select-none shrink-0">
        <div className="flex items-center gap-4">
          <span>{stats.words.toLocaleString()} words</span>
          <span>{stats.chars.toLocaleString()} characters</span>
          <span>{stats.paragraphs} paragraphs</span>
        </div>
        <div className="flex items-center gap-3">
          <span>~{stats.readingTime} min read</span>
          <span className="text-neutral-700">·</span>
          <span>UTF-8 Markdown</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Lightweight safe markdown to HTML parser for instant zero-dependency live preview
 */
function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let html = markdown;

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="bg-neutral-950 border border-neutral-800 rounded-lg p-4 my-4 font-mono text-xs overflow-x-auto text-emerald-400"><code>${escapeHtml(
      code.trim()
    )}</code></pre>`;
  });

  // Headers
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-base font-semibold text-neutral-200 mt-6 mb-2 tracking-tight">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-lg font-bold text-white mt-8 mb-3 tracking-tight border-b border-neutral-800/80 pb-1">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-2xl font-bold font-display text-white mb-4 tracking-tight">$1</h1>'
  );

  // Blockquotes
  html = html.replace(
    /^\> (.*$)/gim,
    '<blockquote class="border-l-2 border-rose-500 pl-4 py-1 my-4 text-neutral-300 italic bg-neutral-900/40 rounded-r-md">$1</blockquote>'
  );

  // Horizontal Rule
  html = html.replace(/^---$/gim, '<hr class="border-neutral-800 my-6" />');

  // Inline formatting
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-neutral-300">$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<del class="line-through text-neutral-500">$1</del>');
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs text-rose-400">$1</code>'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-rose-400 hover:text-rose-300 underline underline-offset-2">$1</a>'
  );

  // Bullet items
  html = html.replace(
    /^- (.*$)/gim,
    '<li class="flex items-start gap-2 my-1 text-neutral-300"><span class="text-rose-500 font-bold shrink-0 mt-1">·</span><span>$1</span></li>'
  );

  // Wrap lines into paragraphs
  const blocks = html.split(/\n\s*\n/);
  return blocks
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (
        block.startsWith('<h') ||
        block.startsWith('<pre') ||
        block.startsWith('<blockquote') ||
        block.startsWith('<hr') ||
        block.startsWith('<li')
      ) {
        return block;
      }
      return `<p class="my-3 text-neutral-300 text-sm leading-relaxed">${block.replace(
        /\n/g,
        '<br />'
      )}</p>`;
    })
    .join('\n');
}
