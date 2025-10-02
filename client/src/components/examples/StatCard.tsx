import StatCard from "../StatCard";
import { Printer, AlertCircle, Clock, TrendingUp } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Printers" value={12} icon={Printer} variant="default" />
      <StatCard title="Overdue Tasks" value={5} icon={AlertCircle} variant="overdue" />
      <StatCard title="Today Tasks" value={8} icon={Clock} variant="warning" />
      <StatCard title="Upcoming Tasks" value={15} icon={TrendingUp} variant="success" />
    </div>
  );
}
