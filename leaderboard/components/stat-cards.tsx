import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type StatCardItem = {
  label: string;
  value: string | number;
  hint?: string;
  trendPct?: number; // Not implemented yet
};

export default function StatCards({ items }: { items: StatCardItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            {item.hint && (
              <p className="text-xs text-muted-foreground">{item.hint}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
