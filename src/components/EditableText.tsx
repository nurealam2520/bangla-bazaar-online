import { useState, useRef } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { toast } from "@/hooks/use-toast";

interface EditableTextProps {
  contentKey: string;
  fallback: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
  className?: string;
  multiline?: boolean;
}

const EditableText = ({
  contentKey,
  fallback,
  as: Tag = "span",
  className = "",
  multiline = false,
}: EditableTextProps) => {
  const { isAdmin } = useAuth();
  const { get, update } = useSiteContent();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const displayValue = get(contentKey, fallback);

  const startEdit = () => {
    setValue(displayValue);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const save = async () => {
    setSaving(true);
    const ok = await update(contentKey, value);
    setSaving(false);
    setEditing(false);
    if (ok) toast({ title: "সংরক্ষণ হয়েছে ✓" });
    else toast({ title: "Error saving", variant: "destructive" });
  };

  const cancel = () => setEditing(false);

  if (!isAdmin) {
    return <Tag className={className}>{displayValue}</Tag>;
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1.5 relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-background border border-primary rounded-lg px-3 py-2 text-foreground text-sm min-w-[200px] max-w-[500px] min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Escape") cancel();
            }}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-background border border-primary rounded-lg px-3 py-1.5 text-foreground text-sm min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
          />
        )}
        <button
          onClick={save}
          disabled={saving}
          className="p-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={cancel}
          className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    );
  }

  return (
    <Tag
      className={`${className} group/edit relative cursor-pointer`}
      onClick={startEdit}
    >
      {displayValue}
      <span className="absolute -top-2 -right-6 opacity-0 group-hover/edit:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
        <Pencil className="h-3 w-3" />
      </span>
    </Tag>
  );
};

export default EditableText;
