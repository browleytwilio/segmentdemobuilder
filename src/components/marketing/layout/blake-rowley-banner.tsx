"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

export function BlakeRowleyBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-r from-marketing-blue/10 via-marketing-purple/10 to-marketing-blue/10"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2.5 lg:px-8">
            <div className="flex items-center gap-3 text-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-marketing-blue" />
              <p className="text-muted-foreground">
                <span className="hidden sm:inline">Welcome! This tool was </span>
                <span className="sm:hidden">B</span>
                <span className="hidden sm:inline">b</span>uilt by{" "}
                <span className="font-semibold text-foreground">
                  Blake Rowley
                </span>
                <span className="hidden md:inline">
                  , Senior Manager Product Specialists Asia Pacific & Japan
                </span>
                <span className="hidden sm:inline md:hidden">
                  , Sr. Manager Product Specialists APJ
                </span>
              </p>
            </div>
            <button
              onClick={() => setVisible(false)}
              className="shrink-0 rounded-md p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
