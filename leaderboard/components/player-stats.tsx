import {
  getPlayerAggregate,
  getRollingForPlayer,
  getHeatmap,
  getBuyInVsNet,
  getProfitByLength,
} from "@/lib/ledger";
import { notFound } from "next/navigation";
import StatCards, { type StatCardItem } from "./stat-cards";
import StreaksCard from "./streaks-card";
import PlayerBadges from "./player-badges";
import { badgesFromAggregate } from "@/lib/metrics";
import RollingRoiChart from "./rolling-roi-chart";
import TimeHeatmap from "./time-heatmap";
import BuyInNetScatter from "./buyin-net-scatter";
import ProfitByLength from "./profit-by-length";

export default async function PlayerStats({ playerId }: { playerId: string }) {
  const [aggregate, rolling, heatmapHour, buyInNet, profitLength] = await Promise.all([
    getPlayerAggregate(playerId),
    getRollingForPlayer(playerId),
    getHeatmap(playerId, 'hour'),
    getBuyInVsNet(playerId),
    getProfitByLength(playerId),
  ]);

  if (!aggregate) {
    notFound();
  }

  const statItems: StatCardItem[] = [
    { label: "Total Sessions", value: aggregate.totalSessions },
    { label: "Total Net (NOK)", value: aggregate.totalNetNok.toFixed(0) },
    { label: "Avg/Session (NOK)", value: aggregate.avgPerSessionNok.toFixed(0) },
    { label: "Win Rate", value: `${aggregate.winRatePct.toFixed(1)}%` },
    { label: "Best Session (NOK)", value: aggregate.bestSessionNok.toFixed(0) },
    { label: "Worst Session (NOK)", value: aggregate.worstSessionNok.toFixed(0) },
    { label: "ROI", value: `${aggregate.roiPct.toFixed(1)}%` },
    { label: "Hourly Rate (NOK/h)", value: aggregate.hourlyRateNok.toFixed(0) },
    { label: "Volatility (σ)", value: aggregate.volatilityStdNok.toFixed(0) },
  ];

  const badges = badgesFromAggregate(aggregate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold tracking-tight">{aggregate.player}</h2>
          <PlayerBadges badges={badges} />
      </div>
      
      <StatCards items={statItems} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StreaksCard 
            winStreak={aggregate.longestWinStreak} 
            loseStreak={aggregate.longestLoseStreak} 
        />
        {/* Other cards could go here */}
      </div>

      <RollingRoiChart data={rolling} />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <TimeHeatmap data={heatmapHour} xLabel="Hour of Day" />
        <ProfitByLength bars={profitLength} />
      </div>
      
      <BuyInNetScatter points={buyInNet.map(p => ({...p, date: p.date.toISOString()}))} />

    </div>
  );
}