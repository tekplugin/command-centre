import React, { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div>
      <div
        ref={ref}
        contentEditable
        className="border border-gray-300 rounded-md p-2 min-h-[120px] bg-white"
        onInput={e => onChange((e.target as HTMLDivElement).innerHTML)}
        suppressContentEditableWarning
        style={{ outline: 'none' }}
      />
      <div className="text-xs text-gray-400 mt-1">You can use formatting (bold, italic, lists, links, etc.)</div>
    </div>
  );
};

export default RichTextEditor;
