import { CheckCircle2 } from 'lucide-react';

type TextBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

function cleanMarkdown(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```[a-zA-Z]*|```/g, ''))
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sentenceParagraphs(text: string) {
  const sentences = text
    .split(/(?<=[。！？!?])\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (sentences.length <= 2) return [text];

  const groups: string[] = [];
  for (let index = 0; index < sentences.length; index += 2) {
    groups.push(sentences.slice(index, index + 2).join(''));
  }
  return groups;
}

function parseText(raw: string): TextBlock[] {
  const text = cleanMarkdown(raw);
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 2 && text.length > 120) {
    return sentenceParagraphs(text).map((paragraph) => ({ type: 'paragraph', text: paragraph }));
  }

  const blocks: TextBlock[] = [];
  let list: Extract<TextBlock, { type: 'list' }> | null = null;

  const flushList = () => {
    if (list && list.items.length > 0) blocks.push(list);
    list = null;
  };

  for (const line of lines) {
    const numbered = line.match(/^\d+[.、)]\s*(.+)$/);
    const bullet = line.match(/^[-*•]\s*(.+)$/);

    if (numbered || bullet) {
      const ordered = Boolean(numbered);
      const content = (numbered?.[1] || bullet?.[1] || '').trim();
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { type: 'list', ordered, items: [] };
      }
      list.items.push(content);
      continue;
    }

    flushList();
    sentenceParagraphs(line).forEach((paragraph) => {
      blocks.push({ type: 'paragraph', text: paragraph });
    });
  }

  flushList();
  return blocks;
}

interface Props {
  text: string;
  compact?: boolean;
}

export default function AITextRenderer({ text, compact = false }: Props) {
  const blocks = parseText(text);

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {blocks.map((block, blockIndex) => {
        if (block.type === 'paragraph') {
          return (
            <p key={`${block.type}-${blockIndex}`} className="text-sm leading-7 text-slate-700">
              {block.text}
            </p>
          );
        }

        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag key={`${block.type}-${blockIndex}`} className="space-y-2">
            {block.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                {block.ordered ? (
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {itemIndex + 1}
                  </span>
                ) : (
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                )}
                <span>{item}</span>
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
