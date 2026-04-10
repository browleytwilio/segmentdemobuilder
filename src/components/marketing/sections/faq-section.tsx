"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  description?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQSection({
  title = "Frequently asked questions",
  description,
  items,
  className,
}: FAQSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn("mx-auto max-w-3xl", className)}
    >
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-muted-foreground">{description}</p>
        )}
      </div>
      <Accordion className="space-y-4">
        {items.map((item) => (
          <AccordionItem
            key={item.question}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6"
          >
            <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
