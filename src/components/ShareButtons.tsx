import { Facebook, Twitter, Link2, MessageCircle, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ShareButtonsProps {
  url?: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

const ShareButtons = ({
  url,
  title,
  description = "",
  className = "",
}: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const openShareWindow = (url: string, name: string) => {
    window.open(url, name, "width=600,height=400,scrollbars=yes,resizable=yes");
  };

  const platforms = [
    {
      name: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
      color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
      color: "hover:bg-muted",
      isLink: true,
    },
  ];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      {platforms.map((p) =>
        (p as any).isLink ? (
          <Button
            key={p.name}
            variant="outline"
            size="icon"
            className={`h-9 w-9 rounded-full transition-all duration-200 ${p.color}`}
            asChild
          >
            <a href={p.href} aria-label={`Share via ${p.name}`}>
              <p.icon className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button
            key={p.name}
            variant="outline"
            size="icon"
            className={`h-9 w-9 rounded-full transition-all duration-200 ${p.color}`}
            onClick={() => openShareWindow(p.href, p.name)}
            aria-label={`Share on ${p.name}`}
          >
            <p.icon className="h-4 w-4" />
          </Button>
        )
      )}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-muted"
        onClick={copyLink}
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default ShareButtons;
