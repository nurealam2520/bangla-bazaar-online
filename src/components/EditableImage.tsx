import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EditableImageProps {
  contentKey: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
}

const EditableImage = ({
  contentKey,
  fallbackSrc,
  alt,
  className = "",
  overlayClassName = "",
}: EditableImageProps) => {
  const { isAdmin } = useAuth();
  const { get, update } = useSiteContent();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const currentSrc = get(contentKey, "") || fallbackSrc;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধুমাত্র ছবি আপলোড করুন", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "ছবি ৫MB এর কম হতে হবে", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${contentKey}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Save relative URL for same-domain serving via PHP proxy
      const relativeUrl = `/uploads/${fileName}`;

      const ok = await update(contentKey, relativeUrl);
      if (ok) {
        toast({ title: "ছবি আপডেট হয়েছে ✓" });
      } else {
        throw new Error("Failed to save URL");
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "আপলোড ব্যর্থ হয়েছে", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!isAdmin) {
    return <img src={currentSrc} alt={alt} className={className} />;
  }

  return (
    <div className={`relative group/img ${overlayClassName}`}>
      <img src={currentSrc} alt={alt} className={className} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover/img:bg-foreground/40 transition-colors cursor-pointer z-10"
      >
        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center gap-2 bg-background/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-xl shadow-lg text-sm font-medium">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              আপলোড হচ্ছে...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              ছবি পরিবর্তন করুন
            </>
          )}
        </span>
      </button>
    </div>
  );
};

export default EditableImage;
