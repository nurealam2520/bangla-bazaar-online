import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const TermsOfService = () => {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Read the Pawnest terms of service governing your use of our website and purchases."
        canonical="/terms-of-service"
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">Terms of Service</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Pawnest (compawnest.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">2. Products & Pricing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices are listed in USD unless otherwise noted.</li>
                <li>We reserve the right to change prices at any time without notice.</li>
                <li>Product descriptions are as accurate as possible; slight variations may occur.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">3. Orders & Payment</h2>
              <p>
                By placing an order, you confirm that all information provided is accurate. We reserve the right to refuse or cancel any order for suspected fraud or stock issues.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">4. Shipping</h2>
              <p>
                We ship to the USA, Canada, Australia, and New Zealand. Delivery times vary by location and are estimates only. We are not responsible for delays caused by carriers or customs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">5. Intellectual Property</h2>
              <p>
                All content on this site—including logos, images, text, and graphics—is the property of Pawnest and may not be reproduced without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
              <p>
                Pawnest is not liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our maximum liability is limited to the purchase price of the product.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">7. Contact</h2>
              <p>
                For questions regarding these terms, contact us at <strong>hello@compawnest.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;
