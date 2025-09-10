
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MatchupsMatrix({ edges }: { edges: Array<{ aName: string; bName: string; netFromAToB: number; sessionsTogether: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pairwise Matchups</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">This feature is not yet implemented.</p>
        {/* When implemented, this could be a heatmap or a detailed table */}
      </CardContent>
    </Card>
  );
}
