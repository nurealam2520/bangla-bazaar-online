import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What countries do you ship to?",
    a: "We currently ship to the United States, Canada, Australia, and New Zealand. We're working on expanding to more regions soon.",
  },
  {
    q: "How long does shipping take?",
    a: "Shipping times vary by location. US orders typically arrive in 5–10 business days. International orders (Canada, Australia, NZ) take 10–20 business days depending on the destination.",
  },
  {
    q: "How does shipping work?",
    a: "We offer fast & secure shipping worldwide. Shipping rates are calculated at checkout based on your location and order weight. Check our shipping page for delivery estimates to your country.",
  },
  {
    q: "Can I return an opened product?",
    a: "Unopened items can be returned within 30 days. Opened perishable items (food, treats) cannot be returned for hygiene reasons. See our Return Policy for full details.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive an email with a tracking number. You can also track your order on our Track Order page using your order ID and email.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit/debit cards via Stripe, PayPal, Afterpay, Klarna, Apple Pay, Google Pay, and Cash on Delivery (where available).",
  },
  {
    q: "Are your products safe for pets?",
    a: "Absolutely. All products are sourced from reputable suppliers and meet safety standards. We carefully vet every item before listing it in our store.",
  },
  {
    q: "How do I contact customer support?",
    a: "You can reach us at hello@compawnest.com or through our Contact page. We typically respond within 24 hours.",
  },
];

const FAQ = () => {
  return (
    <>
      <SEOHead
        title="Frequently Asked Questions"
        description="Find answers to frequently asked questions about Pawnest orders, shipping, returns, and more."
        canonical="/faq"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        }}
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">Frequently Asked Questions</h1>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-5">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FAQ;
