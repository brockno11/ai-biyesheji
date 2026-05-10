/**
 * Renders long text as multiple paragraphs by splitting at sentence boundaries (。！？).
 * Falls back to rendering as-is for short text or text without clear sentence breaks.
 */
export default function SmartParagraph({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  // Split on sentence-ending punctuation followed by a non-punctuation/non-whitespace character
  const sentences = text
    .split(/(?<=[。！？])(?=[^\s，,；;：:。！？'"」』\)）\-0-9a-zA-Z])/g)
    .filter(Boolean);

  // If only 1-2 sentences, render as single paragraph
  if (sentences.length <= 2) {
    return <p className={className}>{text}</p>;
  }

  // Group sentences into paragraphs of 2-3 sentences each
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(''));
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-gray-700 leading-relaxed">
          {p.trim()}
        </p>
      ))}
    </div>
  );
}
