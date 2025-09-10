import PlayerStats from "@/components/player-stats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import TimeFilter from "@/components/time-filter";

export const dynamic = "force-dynamic";

type SearchParams = {
  from?: string | string[];
  to?: string | string[];
};

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>; // <-- Promise
  searchParams: Promise<SearchParams>; // <-- Promise
}) {
  const { id } = await params; // <-- await params
  const { from, to } = await searchParams; // <-- await searchParams

  const playerId = decodeURIComponent(id); // <-- no await

  const fromStr = Array.isArray(from) ? from[0] : from;
  const toStr = Array.isArray(to) ? to[0] : to;

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Back to Leaderboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-muted-foreground">
          Player Analytics
        </h1>
      </div>

      <TimeFilter />
      <PlayerStats playerId={playerId} from={fromStr} to={toStr} />
    </div>
  );
}
