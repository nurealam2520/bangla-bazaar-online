import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Read Pawnest's privacy policy to understand how we collect, use, and protect your personal information."
        canonical="/privacy-policy"
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8 text-foreground">Privacy Policy</h1>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account information:</strong> Name, email address, password when you create an account.</li>
                <li><strong>Order information:</strong> Shipping address, billing details, and payment information.</li>
                <li><strong>Communication:</strong> Messages you send to our support team.</li>
                <li><strong>Usage data:</strong> How you interact with our site (pages visited, products viewed).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders.</li>
                <li>Send order confirmations and shipping updates.</li>
                <li>Respond to your inquiries and provide customer support.</li>
                <li>Send promotional emails (you can opt out anytime).</li>
                <li>Improve our website and product offerings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Data Protection</h2>
              <p>
                We implement industry-standard security measures to protect your personal data, including SSL encryption, secure payment processing via Stripe, and restricted database access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Third-Party Sharing</h2>
              <p>
                We do not sell your personal information. We share data only with trusted partners necessary to fulfill orders (shipping carriers, payment processors).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access, correct, or delete your personal data.</li>
                <li>Opt out of marketing communications.</li>
                <li>Request a copy of your data.</li>
              </ul>
              <p>Contact us at <strong>hello@compawnest.com</strong> for any privacy-related requests.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
