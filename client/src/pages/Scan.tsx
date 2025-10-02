import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

type QRData = {
  type: string;
  id: string;
  name: string;
};

type WorkLog = {
  id: string;
  printerId: string;
  taskId: string | null;
  performedBy: string;
  date: string;
  printHours?: number;
  jobsCount?: number;
  details?: string;
  axis?: string;
  nozzleSize?: string;
  printer: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
    category?: {
      id: string;
      name: string;
    };
  } | null;
};

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedPrinterId, setScannedPrinterId] = useState<string | null>(null);
  const [scannedPrinterName, setScannedPrinterName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scanControlsRef = useRef<IScannerControls | null>(null);

  const { data: workLogs, isLoading: isLoadingLogs } = useQuery<WorkLog[]>({
    queryKey: ["/api/worklogs", scannedPrinterId],
    enabled: !!scannedPrinterId,
  });

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
      setScannedPrinterId(null);
      setScannedPrinterName(null);
      
      const codeReader = new BrowserQRCodeReader();

      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      if (videoInputDevices.length === 0) {
        setError("Камера не знайдена");
        return;
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      setIsScanning(true);

      const controls = await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            try {
              const qrData: QRData = JSON.parse(result.getText());
              
              if (qrData.type === "printer" && qrData.id) {
                setScannedPrinterId(qrData.id);
                setScannedPrinterName(qrData.name || "Невідомий принтер");
                stopScanning();
              }
            } catch (e) {
              console.error("Invalid QR code format", e);
            }
          }
          
          if (error && error.name !== "NotFoundException") {
            console.error("QR scanning error:", error);
          }
        }
      );
      
      scanControlsRef.current = controls;
    } catch (err) {
      console.error("Camera error:", err);
      setError("Не вдалося отримати доступ до камери");
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

  const resetScanner = () => {
    setScannedPrinterId(null);
    setScannedPrinterName(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-qr-scanner">QR сканер</h1>
        <p className="text-muted-foreground mt-1">
          Скануйте QR код принтера для перегляду виконаних робіт
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
            {!isScanning && !scannedPrinterId && (
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
            {scannedPrinterId && (
              <Button onClick={resetScanner} variant="outline" data-testid="button-reset-scan">
                Сканувати інший
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {scannedPrinterId && (
        <Card>
          <CardHeader>
            <CardTitle>Виконані роботи</CardTitle>
            <CardDescription>
              Принтер: <span className="font-semibold">{scannedPrinterName}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLogs && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoadingLogs && workLogs && workLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Роботи не знайдені для цього принтера
              </div>
            )}

            {!isLoadingLogs && workLogs && workLogs.length > 0 && (
              <div className="space-y-3">
                {workLogs.map((log) => (
                  <Card key={log.id} data-testid={`worklog-card-${log.id}`}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            {log.task && (
                              <div className="font-medium text-lg">{log.task.title}</div>
                            )}
                            {!log.task && (
                              <div className="font-medium text-lg text-muted-foreground">
                                Робота без завдання
                              </div>
                            )}
                            {log.task?.category && (
                              <Badge variant="outline" className="mt-1">
                                {log.task.category.name}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground text-right">
                            {format(new Date(log.date), "d MMMM yyyy, HH:mm", { locale: uk })}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Виконавець:</span>{" "}
                            <span className="font-medium">{log.performedBy}</span>
                          </div>
                          {log.printHours !== null && log.printHours !== undefined && (
                            <div>
                              <span className="text-muted-foreground">Годин друку:</span>{" "}
                              <span className="font-medium">{log.printHours}</span>
                            </div>
                          )}
                          {log.jobsCount !== null && log.jobsCount !== undefined && (
                            <div>
                              <span className="text-muted-foreground">К-сть завдань:</span>{" "}
                              <span className="font-medium">{log.jobsCount}</span>
                            </div>
                          )}
                          {log.axis && (
                            <div>
                              <span className="text-muted-foreground">Вісь:</span>{" "}
                              <span className="font-medium">{log.axis}</span>
                            </div>
                          )}
                          {log.nozzleSize && (
                            <div>
                              <span className="text-muted-foreground">Розмір сопла:</span>{" "}
                              <span className="font-medium">{log.nozzleSize}</span>
                            </div>
                          )}
                        </div>

                        {log.details && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Деталі:</span>{" "}
                            <span>{log.details}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
