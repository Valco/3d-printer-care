import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WorkLogFormProps = {
  printers: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; title: string }>;
  onSubmit: (data: WorkLogData) => void;
  onCancel: () => void;
};

export type WorkLogData = {
  printerId: string;
  taskId?: string;
  nozzleSize?: string;
  printHours?: number;
  jobsCount?: number;
  details?: string;
  performedBy?: string;
};

export default function WorkLogForm({ printers, tasks, onSubmit, onCancel }: WorkLogFormProps) {
  const [formData, setFormData] = useState<WorkLogData>({
    printerId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="printer">Принтер *</Label>
        <Select
          value={formData.printerId}
          onValueChange={(value) => setFormData({ ...formData, printerId: value })}
          required
        >
          <SelectTrigger id="printer" data-testid="select-printer">
            <SelectValue placeholder="Оберіть принтер" />
          </SelectTrigger>
          <SelectContent>
            {printers.map((printer) => (
              <SelectItem key={printer.id} value={printer.id}>
                {printer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task">Завдання (необов'язково)</Label>
        <Select
          value={formData.taskId}
          onValueChange={(value) => setFormData({ ...formData, taskId: value })}
        >
          <SelectTrigger id="task" data-testid="select-task">
            <SelectValue placeholder="Оберіть завдання" />
          </SelectTrigger>
          <SelectContent>
            {tasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nozzleSize">Розмір сопла</Label>
          <Input
            id="nozzleSize"
            data-testid="input-nozzle-size"
            value={formData.nozzleSize || ""}
            onChange={(e) => setFormData({ ...formData, nozzleSize: e.target.value })}
            placeholder="0.4mm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="printHours">Годин друку</Label>
          <Input
            id="printHours"
            type="number"
            data-testid="input-print-hours"
            value={formData.printHours || ""}
            onChange={(e) =>
              setFormData({ ...formData, printHours: parseInt(e.target.value) || undefined })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobsCount">Кількість робіт</Label>
          <Input
            id="jobsCount"
            type="number"
            data-testid="input-jobs-count"
            value={formData.jobsCount || ""}
            onChange={(e) =>
              setFormData({ ...formData, jobsCount: parseInt(e.target.value) || undefined })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="performedBy">Виконавець</Label>
        <Input
          id="performedBy"
          data-testid="input-performed-by"
          value={formData.performedBy || ""}
          onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
          placeholder="Ваше ім'я"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Деталі</Label>
        <Textarea
          id="details"
          data-testid="textarea-details"
          value={formData.details || ""}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          placeholder="Деталі обслуговування..."
          rows={4}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
          Скасувати
        </Button>
        <Button type="submit" disabled={!formData.printerId} data-testid="button-submit">
          Записати роботу
        </Button>
      </div>
    </form>
  );
}
