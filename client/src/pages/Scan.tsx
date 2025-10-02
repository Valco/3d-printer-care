import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CameraOff, AlertCircle } from "lucide-react";

type QRData = {
  type: string;
  id: string;
  name: string;
};

export default function Scan() {
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanControlsRef = useRef<IScannerControls | null>(null);
  const lastScannedIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (scanControlsRef.current) {
        scanControlsRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      lastScannedIdRef.current = null;
      
      const codeReader = new BrowserQRCodeReader();

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        setError("Камера не знайдена");
        return;
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      setIsScanning(true);

      try {
        const controls = await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const qrText = result.getText();
              let printerId: string | null = null;

              try {
                const qrData: QRData = JSON.parse(qrText);
                if (qrData.type === "printer" && qrData.id) {
                  printerId = qrData.id;
                }
              } catch {
                printerId = qrText;
              }

              if (printerId && printerId !== lastScannedIdRef.current) {
                lastScannedIdRef.current = printerId;
                stopScanning();
                navigate(`/?addWorkLog=${printerId}`);
              }
            }
            
            if (error && !error.name?.includes("NotFoundException")) {
              console.error("QR scanning error:", error);
            }
          }
        );
        
        scanControlsRef.current = controls;
      } catch (cameraErr: any) {
        console.error("Camera access error:", cameraErr);
        
        let errorMessage = "Не вдалося отримати доступ до камери";
        if (cameraErr.name === "NotAllowedError" || cameraErr.name === "PermissionDeniedError") {
          errorMessage = "Доступ до камери заборонено. Будь ласка, дозвольте доступ у налаштуваннях браузера.";
        } else if (cameraErr.name === "NotReadableError" || cameraErr.name === "TrackStartError") {
          errorMessage = "Камера зайнята іншим додатком. Закрийте інші програми, що використовують камеру.";
        } else if (cameraErr.name === "NotFoundError") {
          errorMessage = "Камера не знайдена на цьому пристрої";
        }
        
        setError(errorMessage);
        setIsScanning(false);
        if (scanControlsRef.current) {
          scanControlsRef.current.stop();
          scanControlsRef.current = null;
        }
      }
    } catch (err) {
      console.error("Camera initialization error:", err);
      setError("Не вдалося ініціалізувати камеру");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scanControlsRef.current) {
      scanControlsRef.current.stop();
      scanControlsRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-qr-scanner">QR сканер</h1>
        <p className="text-muted-foreground mt-1">
          Скануйте QR код принтера для додавання роботи
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Камера</CardTitle>
          <CardDescription>
            {isScanning
              ? "Наведіть камеру на QR код принтера"
              : "Натисніть кнопку для активації камери"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-muted rounded-lg overflow-hidden" style={{ height: "400px" }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{ display: isScanning ? "block" : "none" }}
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Camera className="h-16 w-16 mx-auto mb-2" />
                  <p>Камера вимкнена</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isScanning && (
              <Button onClick={startScanning} data-testid="button-start-scan">
                <Camera className="h-4 w-4 mr-2" />
                Почати сканування
              </Button>
            )}
            {isScanning && (
              <Button onClick={stopScanning} variant="destructive" data-testid="button-stop-scan">
                <CameraOff className="h-4 w-4 mr-2" />
                Зупинити
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
