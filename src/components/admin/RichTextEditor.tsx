import { useRef, useCallback } from "react";
import {
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Link2, ImageIcon, AlignLeft, AlignCenter,
  Quote, Code, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="h-8 w-8 rounded-md"
    onClick={onClick}
    title={label}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

const RichTextEditor = ({ value, onChange, className = "", placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    // Sync after command
    setTimeout(() => {
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }, 0);
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const insertLink = () => {
    const url = prompt("URL লিখুন:");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("ইমেজ URL লিখুন:");
    if (url) exec("insertImage", url);
  };

  const formatBlock = (tag: string) => {
    exec("formatBlock", tag);
  };

  return (
    <div className={`border border-input rounded-xl overflow-hidden bg-background ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
        <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => formatBlock("h1")} />
        <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => formatBlock("h2")} />
        <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => formatBlock("h3")} />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton icon={Bold} label="Bold" onClick={() => exec("bold")} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => exec("italic")} />
        <ToolbarButton icon={Underline} label="Underline" onClick={() => exec("underline")} />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton icon={List} label="Bullet List" onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => exec("insertOrderedList")} />
        <ToolbarButton icon={Quote} label="Blockquote" onClick={() => formatBlock("blockquote")} />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton icon={AlignLeft} label="Align Left" onClick={() => exec("justifyLeft")} />
        <ToolbarButton icon={AlignCenter} label="Align Center" onClick={() => exec("justifyCenter")} />
        <div className="w-px h-6 bg-border mx-1" />
        <ToolbarButton icon={Link2} label="Insert Link" onClick={insertLink} />
        <ToolbarButton icon={ImageIcon} label="Insert Image" onClick={insertImage} />
        <ToolbarButton icon={Code} label="Code" onClick={() => formatBlock("pre")} />
        <ToolbarButton icon={Minus} label="Horizontal Rule" onClick={() => exec("insertHorizontalRule")} />

        {/* Font Size */}
        <select
          className="h-8 px-2 rounded-md border border-input bg-background text-xs ml-1"
          onChange={(e) => exec("fontSize", e.target.value)}
          defaultValue="3"
        >
          <option value="1">ছোট</option>
          <option value="2">Normal</option>
          <option value="3">মাঝারি</option>
          <option value="4">বড়</option>
          <option value="5">আরো বড়</option>
          <option value="6">অনেক বড়</option>
        </select>

        {/* Text Color */}
        <input
          type="color"
          className="h-7 w-7 rounded cursor-pointer border-0 p-0 ml-1"
          title="Text Color"
          onChange={(e) => exec("foreColor", e.target.value)}
          defaultValue="#000000"
        />
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[300px] p-4 focus:outline-none prose-custom text-sm leading-relaxed"
        onInput={handleInput}
        onBlur={handleInput}
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder}
        style={{ minHeight: "300px" }}
      />
    </div>
  );
};

export default RichTextEditor;
