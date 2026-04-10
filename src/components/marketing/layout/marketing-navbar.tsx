"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { navLinks, isNavGroup } from "@/lib/marketing/data/nav-links";
import { cn } from "@/lib/utils";

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.08] bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center text-foreground hover:opacity-80 transition-opacity">
          <LogoMark size={26} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((item) =>
            isNavGroup(item) ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <AnimatePresence>
                  {openDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full pt-2"
                    >
                      <div className="w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                        {item.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : item.href.startsWith("http") ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm" render={<Link href="/sign-in" />} className="text-muted-foreground hover:text-foreground">
            Sign In
          </Button>
          <div className="group relative">
            <div className="animate-glow-pulse absolute -inset-0.5 rounded-lg bg-gradient-to-r from-marketing-blue to-marketing-purple opacity-50 blur-sm" />
            <Button
              size="sm"
              render={<Link href="/sign-in" />}
              className="relative overflow-hidden bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-95"
            >
              <span className="relative z-10">Get Started</span>
              <span className="animate-shimmer-sweep pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </Button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden rounded-md p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-white/[0.08] bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {navLinks.map((item) =>
                isNavGroup(item) ? (
                  <div key={item.label} className="space-y-1">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {item.label}
                    </p>
                    {item.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : item.href.startsWith("http") ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" size="sm" className="flex-1" render={<Link href="/sign-in" />}>
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-marketing-blue to-marketing-purple text-white"
                  render={<Link href="/sign-in" />}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
