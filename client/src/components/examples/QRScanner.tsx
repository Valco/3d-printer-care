import { useState } from "react";
import QRScanner from "../QRScanner";
import { Button } from "@/components/ui/button";

export default function QRScannerExample() {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="p-4">
      <Button onClick={() => setShowScanner(true)}>Open QR Scanner</Button>
      {showScanner && (
        <QRScanner
          onScan={(data) => {
            console.log("Scanned:", data);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
