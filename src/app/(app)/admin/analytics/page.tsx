import { getAnalyticsStats } from "../actions";
import { AnalyticsDashboard } from "./analytics-dashboard";

export default async function AdminAnalyticsPage() {
  const { data, error } = await getAnalyticsStats();

  return <AnalyticsDashboard data={data} error={error} />;
}
