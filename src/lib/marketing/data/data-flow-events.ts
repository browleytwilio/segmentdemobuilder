export interface FlowNode {
  id: string;
  label: string;
  icon: string;
}

export interface FlowEvent {
  label: string;
  color: string;
}

export interface IndustryFlow {
  industry: string;
  sources: FlowNode[];
  destinations: FlowNode[];
  events: FlowEvent[];
}

export const industryFlows: IndustryFlow[] = [
  {
    industry: "E-commerce",
    sources: [
      { id: "web", label: "Web Store", icon: "Globe" },
      { id: "mobile", label: "Mobile App", icon: "Smartphone" },
      { id: "server", label: "Order API", icon: "Server" },
    ],
    destinations: [
      { id: "amplitude", label: "Amplitude", icon: "BarChart3" },
      { id: "braze", label: "Braze", icon: "Send" },
      { id: "bigquery", label: "BigQuery", icon: "Database" },
    ],
    events: [
      { label: "Product Viewed", color: "marketing-blue" },
      { label: "Cart Updated", color: "marketing-purple" },
      { label: "Order Completed", color: "marketing-green" },
      { label: "Coupon Applied", color: "marketing-cyan" },
    ],
  },
  {
    industry: "B2B SaaS",
    sources: [
      { id: "app", label: "Web App", icon: "Globe" },
      { id: "api", label: "Backend API", icon: "Server" },
      { id: "cli", label: "CLI Tool", icon: "Terminal" },
    ],
    destinations: [
      { id: "mixpanel", label: "Mixpanel", icon: "PieChart" },
      { id: "hubspot", label: "HubSpot", icon: "Users" },
      { id: "snowflake", label: "Snowflake", icon: "Snowflake" },
    ],
    events: [
      { label: "Feature Used", color: "marketing-blue" },
      { label: "Seat Invited", color: "marketing-purple" },
      { label: "Plan Upgraded", color: "marketing-green" },
      { label: "API Key Created", color: "marketing-cyan" },
    ],
  },
  {
    industry: "FinTech",
    sources: [
      { id: "banking", label: "Banking App", icon: "Smartphone" },
      { id: "web", label: "Web Portal", icon: "Globe" },
      { id: "server", label: "Core Banking", icon: "Server" },
    ],
    destinations: [
      { id: "salesforce", label: "Salesforce", icon: "Cloud" },
      { id: "braze", label: "Braze", icon: "Send" },
      { id: "redshift", label: "Redshift", icon: "Database" },
    ],
    events: [
      { label: "Account Opened", color: "marketing-blue" },
      { label: "Transfer Sent", color: "marketing-purple" },
      { label: "KYC Completed", color: "marketing-green" },
      { label: "Loan Applied", color: "marketing-cyan" },
    ],
  },
  {
    industry: "Media",
    sources: [
      { id: "web", label: "Website", icon: "Globe" },
      { id: "streaming", label: "Streaming App", icon: "Smartphone" },
      { id: "api", label: "Content API", icon: "Server" },
    ],
    destinations: [
      { id: "amplitude", label: "Amplitude", icon: "BarChart3" },
      { id: "braze", label: "Braze", icon: "Send" },
      { id: "bigquery", label: "BigQuery", icon: "Database" },
    ],
    events: [
      { label: "Content Viewed", color: "marketing-blue" },
      { label: "Video Played", color: "marketing-purple" },
      { label: "Subscribed", color: "marketing-green" },
      { label: "Ad Clicked", color: "marketing-cyan" },
    ],
  },
];
