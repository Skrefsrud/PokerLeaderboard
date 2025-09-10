import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StreaksCard({
  winStreak,
  loseStreak,
}: {
  winStreak: number;
  loseStreak: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Streaks</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground">
            Longest Win Streak
          </div>
          <Badge variant="outline" className="text-lg">
            {winStreak}
          </Badge>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-sm text-muted-foreground">
            Longest Losing Streak
          </div>
          <Badge variant="destructive" className="text-lg">
            {loseStreak}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Note: Need to add/define 'success' variant for Badge component
