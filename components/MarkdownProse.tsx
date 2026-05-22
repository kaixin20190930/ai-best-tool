import Markdown from 'react-markdown';

export default function MarkdownProse({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <article className='prose prose-invert mx-auto max-w-pc prose-h1:text-slate-900 prose-h2:text-slate-900 prose-strong:text-cyan-700'>
      <Markdown className={className}>{markdown}</Markdown>
    </article>
  );
}
