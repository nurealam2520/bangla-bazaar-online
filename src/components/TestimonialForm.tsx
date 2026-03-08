import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ShareButtons from "@/components/ShareButtons";
import { Star, Send, CheckCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

const TestimonialForm = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [petInfo, setPetInfo] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (!user) return;
    if (!comment.trim()) {
      toast.error("Please write your experience");
      return;
    }

    setSubmitting(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const { error } = await supabase.from("testimonials").insert({
      user_id: user.id,
      user_name: profile?.full_name || user.email?.split("@")[0] || "Pet Lover",
      rating,
      comment,
      pet_info: petInfo,
      location,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Thank you! Your testimonial is pending approval.");
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (submitted) {
    const shareText = `I just shared my experience with Pawnest! ⭐ ${rating}/5 - "${comment.slice(0, 100)}${comment.length > 100 ? "..." : ""}"`;
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="font-display font-bold text-lg mb-2">Thank You!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Your testimonial has been submitted and is pending approval.
        </p>
        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium mb-3 flex items-center justify-center gap-1.5">
            <Share2 className="h-4 w-4" /> Share your review
          </p>
          <ShareButtons
            title={shareText}
            description="Check out Pawnest for premium pet products!"
            url="https://compawnest.com"
            className="justify-center"
          />
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setSubmitted(false);
            setComment("");
            setPetInfo("");
            setRating(5);
          }}
        >
          Write Another
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <h3 className="font-display font-bold text-lg">Share Your Experience</h3>
      <p className="text-sm text-muted-foreground">
        Love our products? Let other pet parents know!
      </p>

      <div>
        <Label className="text-sm">Your Rating</Label>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onMouseEnter={() => setHoverRating(i + 1)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(i + 1)}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  i < (hoverRating || rating) ? "fill-primary text-primary" : "text-muted"
                }`}
              />
            </button>
          ))}
          <span className="text-sm font-semibold text-primary ml-2 self-center">{hoverRating || rating}.0</span>
        </div>
      </div>

      <div>
        <Label className="text-sm">Your Experience</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience with Pawnest..."
          className="mt-1 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-sm">Your Pet(s)</Label>
          <Input
            value={petInfo}
            onChange={(e) => setPetInfo(e.target.value)}
            placeholder="e.g. 2 Dogs"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm">Location</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. New York, USA"
            className="mt-1"
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={submitting} className="gap-1.5 w-full bg-gradient-green text-primary-foreground">
        <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Testimonial"}
      </Button>
    </div>
  );
};

export default TestimonialForm;
