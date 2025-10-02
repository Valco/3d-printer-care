import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Lock, AlertCircle } from "lucide-react";

type PrinterCardProps = {
  id: string;
  name: string;
  model?: string;
  location?: string;
  visibility: "PUBLIC" | "RESTRICTED";
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
  onViewDetails: (id: string) => void;
};

export default function PrinterCard({
  id,
  name,
  model,
  location,
  visibility,
  overdueCount,
  todayCount,
  upcomingCount,
  onViewDetails,
}: PrinterCardProps) {
  const hasOverdue = overdueCount > 0;

  return (
    <Card
      className={`hover-elevate ${hasOverdue ? "border-2 border-overdue" : ""}`}
      data-testid={`card-printer-${id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" data-testid={`text-printer-name-${id}`}>
              {name}
            </h3>
            {model && (
              <p className="text-sm text-muted-foreground truncate" data-testid={`text-printer-model-${id}`}>
                {model}
              </p>
            )}
          </div>
          {visibility === "RESTRICTED" && (
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" data-testid={`icon-restricted-${id}`} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate" data-testid={`text-printer-location-${id}`}>{location}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-1">
            <div className="flex items-center gap-1 bg-success/20 px-2 py-1 rounded-md border border-success/30">
              <span className="text-xs font-semibold text-success" data-testid={`count-upcoming-${id}`}>
                {upcomingCount}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-warning/20 px-2 py-1 rounded-md border border-warning/30">
              <span className="text-xs font-semibold text-warning" data-testid={`count-today-${id}`}>
                {todayCount}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-overdue/20 px-2 py-1 rounded-md border border-overdue/30">
              <span className="text-xs font-semibold text-overdue" data-testid={`count-overdue-${id}`}>
                {overdueCount}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onViewDetails(id)}
          data-testid={`button-view-details-${id}`}
        >
          Переглянути деталі
        </Button>
      </CardFooter>
    </Card>
  );
}
