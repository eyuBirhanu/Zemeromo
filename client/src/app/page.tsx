"use client"; // Needs to be client component for animations

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import AppShowcase from "@/components/landing/AppShowcase";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/layout/Footer";

// Animation variant for fading in sections as you scroll
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-bg text-white selection:bg-accent selection:text-dark-bg overflow-x-hidden">
      <Navbar />

      <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
        <Hero />
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
        <Features />
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeInUp}>
        <AppShowcase />
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={fadeInUp}>
        <CTA />
      </motion.div>

      <Footer />
    </main>
  );
}