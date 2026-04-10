"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionWrapper } from "@/components/marketing/sections/section-wrapper";
import { GradientHeading } from "@/components/marketing/sections/gradient-heading";
import { FAQSection } from "@/components/marketing/sections/faq-section";
import { generalFaq } from "@/lib/marketing/data/faq";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  company: z.string().min(1, "Company is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

export function ContactContent() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (_data: ContactForm) => {
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    toast.success("Message sent! We'll be in touch within 24 hours.");
  };

  return (
    <>
      <SectionWrapper background="gradient" className="pt-32 lg:pt-40">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-marketing-blue">
            Contact
          </p>
          <GradientHeading as="h1">Get in touch</GradientHeading>
          <p className="mt-6 text-lg text-muted-foreground">
            Questions about enterprise plans, partnerships, or just want to
            chat? We&apos;d love to hear from you.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-5">
          {/* Contact form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="rounded-2xl border border-marketing-green/20 bg-marketing-green/[0.03] p-8 text-center">
                <div className="mb-4 text-4xl">&#10003;</div>
                <h3 className="text-xl font-semibold text-foreground">
                  Message sent!
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Thanks for reaching out. We&apos;ll get back to you within 24
                  hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8"
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name" className="mb-2 block text-sm">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Jane Smith"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="mb-2 block text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@company.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="company" className="mb-2 block text-sm">
                    Company
                  </Label>
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    {...register("company")}
                  />
                  {errors.company && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.company.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message" className="mb-2 block text-sm">
                    Message
                  </Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your needs..."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-marketing-blue to-marketing-purple text-white hover:opacity-90"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <Mail className="mb-3 h-5 w-5 text-marketing-blue" />
              <h3 className="font-semibold text-foreground">Email</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                hello@demobuilder.io
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <MapPin className="mb-3 h-5 w-5 text-marketing-purple" />
              <h3 className="font-semibold text-foreground">Location</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sydney, Australia (APJ HQ)
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
              <MessageSquare className="mb-3 h-5 w-5 text-marketing-green" />
              <h3 className="font-semibold text-foreground">Response Time</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We typically respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="muted">
        <FAQSection items={generalFaq} />
      </SectionWrapper>
    </>
  );
}
