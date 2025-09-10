"use client";

import type { PlayerAggregate } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Crown } from "lucide-react";
import { motion } from "framer-motion";

type PodiumEntry = {
  label: string;
  value: number;
  id: string | number;
};

// Helper for NOK formatting
const nok = (n: number) =>
  new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(n);

export default function TopWinnersCard({
  winners,
}: {
  winners: PlayerAggregate[];
}) {
  const top = [...winners]
    .sort((a, b) => b.totalNetNok - a.totalNetNok)
    .slice(0, 3);

  if (top.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="text-yellow-500" />
            Last Month’s Top Winners
          </CardTitle>
          <CardDescription>
            The top 3 players with the highest net profit from the previous
            calendar month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No winners from last month.</p>
        </CardContent>
      </Card>
    );
  }

  const maxVal = Math.max(...top.map((t) => t.totalNetNok));
  // Normalize heights (min 64px, max 180px)
  const toHeight = (v: number) => {
    const min = 64;
    const max = 180;
    if (maxVal === 0) return min;
    return Math.max(min, Math.round((v / maxVal) * max));
  };

  // Arrange as [2nd, 1st, 3rd] for podium look
  const podium: PodiumEntry[] = [
    top[1] && {
      label: top[1].player,
      value: top[1].totalNetNok,
      id: top[1].playerId,
    },
    top[0] && {
      label: top[0].player,
      value: top[0].totalNetNok,
      id: top[0].playerId,
    },
    top[2] && {
      label: top[2].player,
      value: top[2].totalNetNok,
      id: top[2].playerId,
    },
  ].filter(Boolean) as PodiumEntry[];

  const barBase =
    "w-24 sm:w-28 rounded-t-xl border transition-transform will-change-transform";
  const barBgSecond =
    "bg-[linear-gradient(to_top,var(--chart-2),var(--chart-3))] border-[var(--border)]";
  const barBgFirst =
    "bg-[linear-gradient(to_top,var(--primary),var(--chart-3))] border-[color:rgba(255,255,255,0.2)]";
  const barBgThird =
    "bg-[linear-gradient(to_top,var(--chart-1),var(--chart-2))] border-[var(--border)]";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="text-yellow-500" />
          Last Month’s Top Winners
        </CardTitle>
        <CardDescription>
          The top 3 players with the highest net profit from the previous
          calendar month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-center gap-6 sm:gap-10 py-6">
          {podium.map((p, idx) => {
            const isFirst = idx === 1;
            const isSecond = idx === 0;
            // removed unused isThird

            const height = toHeight(p.value);
            const barClass = isFirst
              ? `${barBase} ${barBgFirst}`
              : isSecond
              ? `${barBase} ${barBgSecond}`
              : `${barBase} ${barBgThird}`;

            return (
              <div key={p.id} className="flex flex-col items-center gap-3">
                {/* Amount bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="text-sm px-2 py-1 rounded-md border"
                  style={{
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    borderColor: "var(--border)",
                  }}
                >
                  {p.value >= 0 ? `+${nok(p.value)}` : nok(p.value)}
                </motion.div>

                {/* Crown for first place */}
                {isFirst && (
                  <motion.div
                    initial={{ y: -8, opacity: 0, rotate: -10 }}
                    animate={{ y: -12, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    className="-mb-2"
                  >
                    <Crown className="h-6 w-6 text-yellow-400 drop-shadow" />
                  </motion.div>
                )}

                {/* Bar */}
                <motion.div
                  initial={{ height: 0, opacity: 0, y: 20 }}
                  animate={{ height, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={barClass}
                  style={{
                    boxShadow: isFirst
                      ? "0 8px 20px rgba(255,255,255,0.06)"
                      : "0 6px 16px rgba(0,0,0,0.25)",
                  }}
                />

                {/* Rank pill */}
                <div
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                    borderColor: "var(--border)",
                  }}
                >
                  {isFirst ? "1st" : isSecond ? "2nd" : "3rd"}
                </div>

                {/* Name */}
                <div className="text-sm font-medium text-center">{p.label}</div>
              </div>
            );
          })}
        </div>

        {/* Optional subtle base */}
        <div
          className="mx-auto mt-4 h-1 w-64 rounded-full"
          style={{ background: "var(--chart-3)" }}
        />
      </CardContent>
    </Card>
  );
}
