
import PlayerStats from "@/components/player-stats";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const playerId = decodeURIComponent(params.id);

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-8">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Leaderboard</span>
                </Link>
            </Button>
            <h1 className="text-2xl font-bold text-muted-foreground">Player Analytics</h1>
        </div>
        
        <PlayerStats playerId={playerId} />
    </div>
  );
}
