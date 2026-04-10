export interface Integration {
  id: string;
  name: string;
  description: string;
  category: "source" | "destination" | "tool";
  icon: string;
}

export const integrations: Integration[] = [
  // Sources
  { id: "js", name: "Analytics.js", description: "Client-side JavaScript tracking", category: "source", icon: "Code" },
  { id: "node", name: "Node.js", description: "Server-side event collection", category: "source", icon: "Server" },
  { id: "ios", name: "iOS SDK", description: "Native Apple platform tracking", category: "source", icon: "Smartphone" },
  { id: "android", name: "Android SDK", description: "Native Android tracking", category: "source", icon: "Smartphone" },
  { id: "python", name: "Python", description: "Backend event tracking", category: "source", icon: "Terminal" },
  { id: "http", name: "HTTP API", description: "RESTful event ingestion", category: "source", icon: "Globe" },

  // Destinations
  { id: "amplitude", name: "Amplitude", description: "Product analytics platform", category: "destination", icon: "BarChart3" },
  { id: "mixpanel", name: "Mixpanel", description: "User behavior analytics", category: "destination", icon: "PieChart" },
  { id: "braze", name: "Braze", description: "Customer engagement platform", category: "destination", icon: "Send" },
  { id: "hubspot", name: "HubSpot", description: "CRM and marketing automation", category: "destination", icon: "Users" },
  { id: "salesforce", name: "Salesforce", description: "Enterprise CRM platform", category: "destination", icon: "Cloud" },
  { id: "bigquery", name: "BigQuery", description: "Cloud data warehouse", category: "destination", icon: "Database" },
  { id: "snowflake", name: "Snowflake", description: "Data cloud platform", category: "destination", icon: "Snowflake" },
  { id: "redshift", name: "Redshift", description: "AWS data warehouse", category: "destination", icon: "Database" },

  // Tools
  { id: "protocols", name: "Protocols", description: "Data quality and governance", category: "tool", icon: "Shield" },
  { id: "personas", name: "Unify", description: "Identity resolution engine", category: "tool", icon: "Fingerprint" },
  { id: "engage", name: "Engage", description: "Audience activation platform", category: "tool", icon: "Target" },
  { id: "functions", name: "Functions", description: "Custom data transformations", category: "tool", icon: "Workflow" },
];

export const integrationCategories = [
  { id: "source" as const, label: "Sources", count: 6 },
  { id: "destination" as const, label: "Destinations", count: 8 },
  { id: "tool" as const, label: "Tools", count: 4 },
];
