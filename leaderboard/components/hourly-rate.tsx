
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HourlyRate({ value }: { value: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Hourly Rate (NOK)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">Net profit per hour played</p>
      </CardContent>
    </Card>
  );
}
