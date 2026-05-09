import Editor from '@monaco-editor/react';

interface Props {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ code, onChange, readOnly = false }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-[#1e1e1e]">
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#2d2d2d] border-b border-[#3c3c3c]">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-gray-400 font-mono">python</span>
      </div>
      <Editor
        height="400px"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(val) => onChange(val || '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 4,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
