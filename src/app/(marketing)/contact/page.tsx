import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact | Segment Demo Builder",
  description:
    "Get in touch with our team for enterprise inquiries, support, or partnership opportunities.",
};

export default function ContactPage() {
  return <ContactContent />;
}
