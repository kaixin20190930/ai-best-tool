import Markdown from 'react-markdown';

export default function MarkdownProse({ markdown, className }: { markdown: string; className?: string }) {
  return (
    <article className='prose prose-invert mx-auto max-w-pc prose-h1:text-blue-700 prose-h2:text-blue-700 prose-strong:text-blue-600'>
      <Markdown className={className}>{markdown}</Markdown>
    </article>
  );
}
