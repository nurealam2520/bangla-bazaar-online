import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const ReturnPolicy = () => {
  return (
    <>
      <SEOHead
        title="Return Policy"
        description="Learn about Pawnest's return and refund policy. We offer hassle-free returns within 30 days of purchase."
        canonical="/return-policy"
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">Return Policy</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">30-Day Return Guarantee</h2>
              <p>
                We want you and your pet to be completely satisfied with your purchase. If for any reason you're not happy, you may return most items within <strong>30 days</strong> of delivery for a full refund or exchange.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Items must be unused, unopened, and in their original packaging.</li>
                <li>Perishable goods (food, treats) cannot be returned once opened.</li>
                <li>Sale items and gift cards are non-refundable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">How to Initiate a Return</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our support team at <strong>hello@compawnest.com</strong> with your order number.</li>
                <li>We'll provide a return shipping label (free for defective items).</li>
                <li>Pack the item securely and ship it back to us.</li>
                <li>Refunds are processed within 5–10 business days after we receive the item.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Damaged or Defective Items</h2>
              <p>
                If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos. We'll arrange a free replacement or full refund immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Shipping Costs</h2>
              <p>
                Return shipping costs are the responsibility of the customer, unless the item is defective or we made a shipping error. Original shipping charges are non-refundable.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ReturnPolicy;
