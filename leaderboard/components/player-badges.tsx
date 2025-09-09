import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BadgeInfo } from "@/lib/metrics";

export default function PlayerBadges({ badges }: { badges: BadgeInfo[] }) {
  if (!badges || badges.length === 0) {
    return null; // Don't render anything if there are no badges
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <Tooltip key={badge.name}>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="cursor-help">
                {badge.name}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{badge.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}