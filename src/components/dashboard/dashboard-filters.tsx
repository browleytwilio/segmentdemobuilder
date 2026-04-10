"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SearchIcon, StarIcon, XIcon } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

const INDUSTRIES = [
  { value: "all", label: "All Industries" },
  { value: "E-commerce/Retail", label: "E-commerce/Retail" },
  { value: "B2B SaaS", label: "B2B SaaS" },
  { value: "FinTech", label: "FinTech" },
  { value: "Media & Entertainment", label: "Media & Entertainment" },
];

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "completed", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "updated_at:desc", label: "Recently Updated" },
  { value: "created_at:desc", label: "Newest First" },
  { value: "created_at:asc", label: "Oldest First" },
  { value: "customer_name:asc", label: "Name A-Z" },
  { value: "customer_name:desc", label: "Name Z-A" },
];

export function DashboardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const industry = searchParams.get("industry") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const favorites = searchParams.get("favorites") === "true";
  const sortParam =
    searchParams.get("sort") && searchParams.get("order")
      ? `${searchParams.get("sort")}:${searchParams.get("order")}`
      : "updated_at:desc";

  const [searchValue, setSearchValue] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Keep local search in sync with URL
  useEffect(() => {
    setSearchValue(q);
  }, [q]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.push(qs ? `/dashboard?${qs}` : "/dashboard");
    },
    [router, searchParams]
  );

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value || null });
      if (value) {
        trackEvent("Dashboard Searched", {
          query_length: value.length,
          result_count: 0, // Will be accurate on next render
        });
      }
    }, 300);
  }

  function handleSortChange(value: string | null) {
    if (!value) return;
    const [sort, order] = value.split(":");
    updateParams({ sort, order });
    trackEvent("Dashboard Filtered", { filter_type: "sort", filter_value: value });
  }

  function handleIndustryChange(value: string | null) {
    if (!value) return;
    updateParams({ industry: value === "all" ? null : value });
    trackEvent("Dashboard Filtered", { filter_type: "industry", filter_value: value });
  }

  function handleStatusChange(value: string | null) {
    if (!value) return;
    updateParams({ status: value === "all" ? null : value });
    trackEvent("Dashboard Filtered", { filter_type: "status", filter_value: value });
  }

  function handleFavoritesToggle() {
    const newValue = !favorites;
    updateParams({ favorites: newValue ? "true" : null });
    trackEvent("Dashboard Filtered", {
      filter_type: "favorites",
      filter_value: String(newValue),
    });
  }

  const activeFilterCount =
    (q ? 1 : 0) +
    (industry !== "all" ? 1 : 0) +
    (status !== "all" ? 1 : 0) +
    (favorites ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search playbooks..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Industry */}
      <Select value={industry} onValueChange={handleIndustryChange}>
        <SelectTrigger className="w-[155px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {INDUSTRIES.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort — hidden on small screens */}
      <div className="hidden sm:block">
        <Select value={sortParam} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[155px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Favorites toggle */}
      <Button
        variant={favorites ? "default" : "outline"}
        size="xs"
        className="h-8 gap-1.5 px-2.5"
        onClick={handleFavoritesToggle}
      >
        <StarIcon
          className={`size-3 ${favorites ? "fill-current" : ""}`}
        />
        <span className="hidden sm:inline">Favorites</span>
      </Button>

      {/* Clear filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="xs"
          className="h-8 gap-1 text-muted-foreground"
          onClick={() => router.push("/dashboard")}
        >
          <XIcon className="size-3" />
          Clear{activeFilterCount > 1 ? ` (${activeFilterCount})` : ""}
        </Button>
      )}
    </div>
  );
}
