export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote:
      "We cut our demo prep time from 4 hours to 15 minutes. The AI-generated build prompts are incredibly accurate and the SE scripts have measurably improved our win rate.",
    name: "Sarah Chen",
    role: "VP of Solutions Engineering",
    company: "DataStack",
  },
  {
    id: "2",
    quote:
      "The industry-tailored scenarios are a game changer. My team can now deliver FinTech-specific demos that speak directly to compliance officers and product leads.",
    name: "Marcus Rivera",
    role: "Senior SE Manager",
    company: "CloudMetrics",
  },
  {
    id: "3",
    quote:
      "Finally, a tool that understands the SE workflow. The playbook library has become our team's single source of truth for demo best practices.",
    name: "Priya Patel",
    role: "Solutions Architect",
    company: "Nexus Analytics",
  },
  {
    id: "4",
    quote:
      "The credential security model was the deciding factor for our enterprise adoption. In-memory only, never persisted — exactly what our security team demanded.",
    name: "James O'Brien",
    role: "Director of SE",
    company: "SecureFlow",
  },
  {
    id: "5",
    quote:
      "I onboarded 12 new SEs last quarter and had them producing quality demos within their first week. The guided wizard removes all the guesswork.",
    name: "Anya Volkov",
    role: "SE Enablement Lead",
    company: "GrowthPilot",
  },
  {
    id: "6",
    quote:
      "The auto-generated demo scripts with click-paths and aha moments have standardized our demo quality across the entire APJ region.",
    name: "Kenji Tanaka",
    role: "Regional SE Lead, APJ",
    company: "InsightEdge",
  },
];

export const logoCompanies = [
  { name: "DataStack" },
  { name: "CloudMetrics" },
  { name: "Nexus Analytics" },
  { name: "SecureFlow" },
  { name: "GrowthPilot" },
  { name: "InsightEdge" },
  { name: "Velocitiq" },
  { name: "Amplify" },
  { name: "Streamline" },
  { name: "PulseData" },
];
