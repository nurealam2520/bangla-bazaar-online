import { useState, useRef } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { toast } from "@/hooks/use-toast";

interface EditableLinkProps {
  contentKey: string;
  children: React.ReactNode;
  className?: string;
}

const EditableLink = ({ contentKey, children, className = "" }: EditableLinkProps) => {
  const { isAdmin } = useAuth();
  const { get, update } = useSiteContent();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const href = get(contentKey, "#");

  const startEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(href === "#" ? "" : href);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const save = async () => {
    setSaving(true);
    const ok = await update(contentKey, value || "#");
    setSaving(false);
    setEditing(false);
    if (ok) toast({ title: "লিংক সংরক্ষণ হয়েছে ✓" });
    else toast({ title: "Error saving", variant: "destructive" });
  };

  const cancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://facebook.com/..."
          className="bg-background border border-primary rounded-lg px-3 py-1.5 text-foreground text-xs min-w-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
        />
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
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="relative group/link cursor-pointer" onClick={startEdit}>
        {children}
        <span className="absolute -top-2 -right-2 opacity-0 group-hover/link:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1 shadow-lg z-10">
          <Pencil className="h-2.5 w-2.5" />
        </span>
      </div>
    );
  }

  // Regular user: open link in new tab
  return (
    <a
      href={href && href !== "#" ? href : undefined}
      target={href && href !== "#" ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
};

export default EditableLink;
