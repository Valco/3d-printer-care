import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, X } from "lucide-react";

type QRScannerProps = {
  onScan: (data: string) => void;
  onClose: () => void;
};

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleStartScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      onScan("printer-001");
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">QR Scanner</h2>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-scanner">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {isScanning ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-primary rounded-lg animate-pulse" />
            </div>
          ) : (
            <QrCode className="h-24 w-24 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            {isScanning ? "Scanning..." : "Position the QR code within the frame"}
          </p>
          <Button
            className="w-full"
            onClick={handleStartScan}
            disabled={isScanning}
            data-testid="button-start-scan"
          >
            {isScanning ? "Scanning..." : "Start Scan"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
