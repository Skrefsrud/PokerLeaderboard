"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

export default function TimeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine active range based on search params
  const activeRange = (() => {
    const from = searchParams.get("from");
    if (!from) return "all";

    const today = new Date();
    const fromDate = new Date(from);
    const diffDays = Math.floor(
      (today.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 7) return "week";
    if (diffDays <= 31) return "month";
    if (diffDays <= 365) return "year";
    return "all";
  })();

  const setDateRange = (range: "week" | "month" | "year" | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    const today = new Date();
    let fromDate: Date | null = null;

    switch (range) {
      case "week":
        fromDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case "month":
        fromDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case "year":
        fromDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      case "all":
        params.delete("from");
        params.delete("to");
        router.replace(`${pathname}?${params.toString()}`);
        return;
    }

    if (fromDate) {
      params.set("from", fromDate.toISOString().split("T")[0]);
      params.delete("to");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const buttonStyle = (range: string) =>
    activeRange === range
      ? "bg-[var(--card)] text-[var(--accent-foreground)] hover:bg-[var(--muted)] cursor-pointer"
      : "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--muted)] cursor-pointer";

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className={buttonStyle("week")}
        onClick={() => setDateRange("week")}
      >
        7 days
      </Button>
      <Button
        variant="outline"
        className={buttonStyle("month")}
        onClick={() => setDateRange("month")}
      >
        30 days
      </Button>
      <Button
        variant="outline"
        className={buttonStyle("year")}
        onClick={() => setDateRange("year")}
      >
        This Year
      </Button>
      <Button
        variant="outline"
        className={buttonStyle("all")}
        onClick={() => setDateRange("all")}
      >
        All Time
      </Button>
    </div>
  );
}
