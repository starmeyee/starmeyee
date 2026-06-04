"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { newsletterService } from "@/lib/firebase/services/newsletterService";
import { subscriberService } from "@/lib/firebase/services/subscriberService";
import type { NewsletterSettings } from "@/types";
import { Send, CheckCircle2 } from "lucide-react";

interface NewsletterSectionProps {
  content?: Record<string, any>;
}

export default function NewsletterSection({ content }: NewsletterSectionProps) {
  const [settings, setSettings] = useState<NewsletterSettings | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await newsletterService.getSettings();
        if (data && data.enabled) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching newsletter settings:", error);
      }
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await subscriberService.addSubscriber(email);
      setStatus("success");
      setMessage("Welcome to the cosmos! You've been subscribed.");
      setEmail("");
      
      // Reset success state after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error: any) {
      console.error("Subscription error:", error);
      setStatus("error");
      setMessage(error.message || "Failed to subscribe. Please try again.");
    }
  };

  if (!settings) return null;

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="relative bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-16 text-center overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-indigo-500/10 rotate-12 blur-3xl rounded-full" />
            <div className="absolute top-[20%] -right-[20%] w-[60%] h-[100%] bg-purple-500/10 -rotate-12 blur-3xl rounded-full" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              {settings.headline || "Join the Cosmos"}
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto font-body">
              {settings.description ||
                "Subscribe to receive the latest updates, thoughts, and cosmic musings directly in your inbox."}
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={status === "loading" || status === "success"}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-32 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all backdrop-blur-md"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className="absolute right-2 top-2 bottom-2 bg-white text-black px-6 rounded-full font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === "loading" ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : status === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <>
                      {settings.ctaText || "Subscribe"}
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              
              {/* Messages */}
              {status === "success" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-0 w-full text-center text-sm text-green-400"
                >
                  {message}
                </motion.p>
              )}
              {status === "error" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-8 left-0 w-full text-center text-sm text-red-400"
                >
                  {message}
                </motion.p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
