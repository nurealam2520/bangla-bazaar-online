import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import FeaturesSection from "@/components/FeaturesSection";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import HomeBlogPosts from "@/components/HomeBlogPosts";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEOHead
        title="Premium Dog & Cat Supplies, Food & Accessories"
        description="Shop premium dog and cat supplies at Pawnest. Discover high-quality pet food, toys, grooming products, and accessories with fast shipping."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Pawnest",
          url: "https://compawnest.com",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://compawnest.com/shop?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CategorySection />
        <FeaturedProducts />
        <HomeBlogPosts />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
