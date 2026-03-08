import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useBotProtection, useFormRateLimit } from "@/hooks/useBotProtection";
import HoneypotField from "@/components/HoneypotField";
import { supabase } from "@/integrations/supabase/client";

const contactInfo = [
  { icon: Mail, label: "Email", value: "support@compawnest.com" },
  { icon: Phone, label: "Phone", value: "+1 (800) 555-PETS" },
  { icon: MapPin, label: "Headquarters", value: "Shipping worldwide to US, CA, AU & NZ" },
  { icon: Clock, label: "Support Hours", value: "24/7 — We're always here" },
];

const Contact = () => {
  const [sending, setSending] = useState(false);
  const { honeypot, setHoneypot, isBot } = useBotProtection(2000);
  const { checkLimit } = useFormRateLimit(3, 60000);
  const [liveChatUrl, setLiveChatUrl] = useState<string | null>(null);

  // Load live chat URL from site_content
  useEffect(() => {
    const loadChatConfig = async () => {
      const { data } = await supabase
        .from("site_content")
        .select("value")
        .eq("key", "live_chat_url")
        .maybeSingle();
      if (data?.value) setLiveChatUrl(data.value);
    };
    loadChatConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBot()) { toast.error("Suspicious activity detected."); return; }
    if (checkLimit()) { toast.error("Too many attempts. Please wait."); return; }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !subject || !message) {
      toast.error("Please fill all fields.");
      return;
    }

    setSending(true);
    try {
      // Save to database
      const { error: dbError } = await supabase.from("contact_messages").insert({
        name, email, subject, message,
      });
      if (dbError) throw dbError;

      // Send email notification
      await supabase.functions.invoke("send-email", {
        body: {
          to: "support@compawnest.com",
          subject: `[Contact Form] ${subject}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#16a34a;">New Contact Message 🐾</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
                <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Subject</td><td style="padding:8px;border-bottom:1px solid #eee;">${subject}</td></tr>
              </table>
              <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:8px;">
                <p style="margin:0;white-space:pre-wrap;">${message}</p>
              </div>
              <p style="margin-top:16px;font-size:12px;color:#999;">Sent from PawNest Contact Form</p>
            </div>
          `,
          body: `New contact from ${name} (${email})\nSubject: ${subject}\n\n${message}`,
        },
      });

      toast.success("Message sent! We'll get back to you soon. 🐾");
      form.reset();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleLiveChat = () => {
    if (liveChatUrl) {
      window.open(liveChatUrl, "_blank");
    } else {
      toast.info("Live chat is coming soon! Please use the contact form.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead title="Contact Us" description="Get in touch with Pawnest. Reach our 24/7 customer support for orders, returns, and product questions." canonical="/contact" />
      <Navbar />
      <main>
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-display font-bold mb-4"
            >
              Get in <span className="text-gradient-green">Touch</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground max-w-md mx-auto"
            >
              Have a question? We'd love to hear from you.
            </motion.p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-display font-bold mb-8">Contact Information</h2>
                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 rounded-2xl bg-gradient-green text-primary-foreground">
                  <h3 className="font-display font-semibold text-lg mb-2">Need urgent help?</h3>
                  <p className="text-sm text-primary-foreground/80 mb-4">Our live chat support is available 24/7 for all your pet product inquiries.</p>
                  <Button
                    variant="outline"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                    onClick={handleLiveChat}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Start Live Chat
                  </Button>
                </div>
              </div>

              {/* Form */}
              <div>
                <h2 className="text-2xl font-display font-bold mb-8">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5 relative">
                  <HoneypotField value={honeypot} onChange={setHoneypot} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" placeholder="Your name" required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="you@example.com" required className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="How can we help?" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us more..."
                      required
                      className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={sending} className="bg-gradient-green text-primary-foreground shadow-emerald hover:opacity-90 w-full sm:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    {sending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
