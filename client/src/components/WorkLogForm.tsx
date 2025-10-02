import { useState, useEffect } from "react";
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
  tasks: Array<{
    id: string;
    title: string;
    requiresAxis: boolean;
    requiresNozzleSize: boolean;
    requiresPlasticType: boolean;
    customFieldLabel: string | null;
    customFieldType: string | null;
  }>;
  currentUserName: string;
  preselectedPrinterId?: string | null;
  onSubmit: (data: WorkLogData) => void;
  onCancel: () => void;
};

export type WorkLogData = {
  printerId: string;
  taskId?: string;
  axis?: string;
  nozzleSize?: string;
  plasticType?: string;
  customFieldValue?: string;
  printHours?: number;
  jobsCount?: number;
  details?: string;
  performedBy?: string;
};

export default function WorkLogForm({ printers, tasks, currentUserName, preselectedPrinterId, onSubmit, onCancel }: WorkLogFormProps) {
  const [formData, setFormData] = useState<WorkLogData>({
    printerId: preselectedPrinterId || "",
    performedBy: currentUserName,
  });

  useEffect(() => {
    if (currentUserName && formData.performedBy === "") {
      setFormData(prev => ({ ...prev, performedBy: currentUserName }));
    }
  }, [currentUserName]);

  useEffect(() => {
    if (preselectedPrinterId) {
      setFormData(prev => ({ ...prev, printerId: preselectedPrinterId }));
    }
  }, [preselectedPrinterId]);

  const selectedTask = tasks.find(task => task.id === formData.taskId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTask?.requiresAxis && !formData.axis) {
      alert("Будь ласка, оберіть вісь для цього завдання");
      return;
    }
    
    if (selectedTask?.requiresNozzleSize && !formData.nozzleSize) {
      alert("Будь ласка, вкажіть розмір сопла");
      return;
    }

    if (selectedTask?.requiresPlasticType && !formData.plasticType) {
      alert("Будь ласка, вкажіть тип пластику");
      return;
    }

    if (selectedTask?.customFieldLabel && selectedTask?.customFieldType && !formData.customFieldValue) {
      alert(`Будь ласка, заповніть поле "${selectedTask.customFieldLabel}"`);
      return;
    }
    
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

      {selectedTask?.requiresAxis && (
        <div className="space-y-2">
          <Label htmlFor="axis">Ось *</Label>
          <Select
            value={formData.axis}
            onValueChange={(value) => setFormData({ ...formData, axis: value })}
          >
            <SelectTrigger id="axis" data-testid="select-axis">
              <SelectValue placeholder="Оберіть вісь" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="X">X</SelectItem>
              <SelectItem value="Y">Y</SelectItem>
              <SelectItem value="Z">Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedTask?.requiresNozzleSize && (
        <div className="space-y-2">
          <Label htmlFor="nozzleSize">Розмір сопла *</Label>
          <Input
            id="nozzleSize"
            data-testid="input-nozzle-size"
            value={formData.nozzleSize || ""}
            onChange={(e) => setFormData({ ...formData, nozzleSize: e.target.value })}
            placeholder="0.4mm"
          />
        </div>
      )}

      {selectedTask?.requiresPlasticType && (
        <div className="space-y-2">
          <Label htmlFor="plasticType">Тип пластику *</Label>
          <Input
            id="plasticType"
            data-testid="input-plastic-type"
            value={formData.plasticType || ""}
            onChange={(e) => setFormData({ ...formData, plasticType: e.target.value })}
            placeholder="PLA, ABS, PETG..."
          />
        </div>
      )}

      {selectedTask?.customFieldLabel && selectedTask?.customFieldType && (
        <div className="space-y-2">
          <Label htmlFor="customField">{selectedTask.customFieldLabel} *</Label>
          <Input
            id="customField"
            type={selectedTask.customFieldType === "NUMBER" ? "number" : "text"}
            data-testid="input-custom-field"
            value={formData.customFieldValue || ""}
            onChange={(e) => setFormData({ ...formData, customFieldValue: e.target.value })}
            placeholder={`Введіть ${selectedTask.customFieldLabel.toLowerCase()}...`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Button 
          type="submit" 
          disabled={
            !formData.printerId || 
            (!!selectedTask?.requiresAxis && !formData.axis) ||
            (!!selectedTask?.requiresNozzleSize && !formData.nozzleSize) ||
            (!!selectedTask?.requiresPlasticType && !formData.plasticType) ||
            (!!selectedTask?.customFieldLabel && !!selectedTask?.customFieldType && !formData.customFieldValue)
          }
          data-testid="button-submit"
        >
          Записати роботу
        </Button>
      </div>
    </form>
  );
}
