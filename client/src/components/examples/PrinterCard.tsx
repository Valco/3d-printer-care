import PrinterCard from "../PrinterCard";

export default function PrinterCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PrinterCard
        id="1"
        name="X1C-002"
        model="BambuLab X1C"
        location="Lab Room 1"
        visibility="PUBLIC"
        overdueCount={2}
        todayCount={1}
        onViewDetails={(id) => console.log("View details:", id)}
      />
      <PrinterCard
        id="2"
        name="A1-001"
        model="BambuLab A1"
        location="Lab Room 2"
        visibility="RESTRICTED"
        overdueCount={0}
        todayCount={3}
        onViewDetails={(id) => console.log("View details:", id)}
      />
      <PrinterCard
        id="3"
        name="Prusa MK4"
        model="Prusa i3 MK4"
        location="Workshop"
        visibility="PUBLIC"
        overdueCount={0}
        todayCount={0}
        onViewDetails={(id) => console.log("View details:", id)}
      />
    </div>
  );
}
