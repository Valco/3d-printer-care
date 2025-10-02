import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, Edit, Trash2 } from "lucide-react";

type Printer = {
  id: string;
  name: string;
  model?: string;
  location?: string;
  visibility: "PUBLIC" | "RESTRICTED";
  printHours: number;
  jobsCount: number;
  overdueCount: number;
  todayCount: number;
};

type PrinterTableProps = {
  printers: Printer[];
  userRole: "ADMIN" | "OPERATOR" | "VIEWER";
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function PrinterTable({ printers, userRole, onView, onEdit, onDelete }: PrinterTableProps) {
  const canEdit = userRole === "ADMIN" || userRole === "OPERATOR";

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-printers">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Visibility</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Metrics</th>
              <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {printers.map((printer) => (
              <tr
                key={printer.id}
                className="hover-elevate"
                data-testid={`row-printer-${printer.id}`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{printer.name}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{printer.model || "-"}</td>
                <td className="px-4 py-3 text-muted-foreground">{printer.location || "-"}</td>
                <td className="px-4 py-3">
                  {printer.visibility === "RESTRICTED" ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      <span className="text-sm">Restricted</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Public</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    {printer.overdueCount > 0 && (
                      <Badge variant="outline" className="bg-overdue/20 text-overdue border-overdue/30">
                        {printer.overdueCount} Overdue
                      </Badge>
                    )}
                    {printer.todayCount > 0 && (
                      <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                        {printer.todayCount} Today
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-muted-foreground font-mono">
                    {printer.printHours}h / {printer.jobsCount} jobs
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onView(printer.id)}
                      data-testid={`button-view-${printer.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(printer.id)}
                          data-testid={`button-edit-${printer.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onDelete(printer.id)}
                          data-testid={`button-delete-${printer.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {printers.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No printers found</div>
      )}
    </div>
  );
}
