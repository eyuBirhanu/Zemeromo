import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import AppShowcase from "@/components/landing/AppShowcase";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-bg text-white selection:bg-accent selection:text-dark-bg">
      <Navbar />
      <Hero />
      <Features />
      <AppShowcase />
      <CTA />
      <Footer />
    </main>
  );
}