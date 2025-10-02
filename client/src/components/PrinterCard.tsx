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
        <div className="flex flex-wrap gap-2">
          {overdueCount > 0 && (
            <Badge
              variant="outline"
              className="bg-overdue/20 text-overdue border-overdue/30"
              data-testid={`badge-overdue-${id}`}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              {overdueCount} прострочено
            </Badge>
          )}
          {todayCount > 0 && (
            <Badge
              variant="outline"
              className="bg-warning/20 text-warning border-warning/30"
              data-testid={`badge-today-${id}`}
            >
              {todayCount} сьогодні
            </Badge>
          )}
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
