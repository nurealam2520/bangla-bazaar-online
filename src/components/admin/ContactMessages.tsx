import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Eye, EyeOff, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load messages");
    } else {
      setMessages(data as ContactMessage[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (id: string, current: boolean) => {
    await supabase.from("contact_messages").update({ is_read: !current }).eq("id", id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: !current } : m));
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success("Message deleted");
  };

  const selected = messages.find((m) => m.id === selectedId);
  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Mail className="h-5 w-5" /> Contact Messages
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </h3>
        <Button variant="outline" size="sm" onClick={fetchMessages} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Message list */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedId(msg.id);
                  if (!msg.is_read) toggleRead(msg.id, false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedId === msg.id
                    ? "border-primary bg-primary/5"
                    : msg.is_read
                    ? "border-border bg-card hover:border-primary/30"
                    : "border-primary/30 bg-primary/5 hover:border-primary"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${!msg.is_read ? "font-bold" : "font-medium"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {msg.name} — {msg.email}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Message detail */}
          {selected ? (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">{selected.subject}</h4>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleRead(selected.id, selected.is_read)}
                    title={selected.is_read ? "Mark as unread" : "Mark as read"}
                  >
                    {selected.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMessage(selected.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <p><span className="text-muted-foreground">From:</span> {selected.name} &lt;{selected.email}&gt;</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {selected.message}
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" /> Reply via Email
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center text-muted-foreground text-sm border border-dashed border-border rounded-xl min-h-[200px]">
              Select a message to view
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
