import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        setError(t('qrScanner.cameraNotFound'));
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
        
        let errorMessage = t('qrScanner.cameraAccessFailed');
        if (cameraErr.name === "NotAllowedError" || cameraErr.name === "PermissionDeniedError") {
          errorMessage = t('qrScanner.cameraAccessDenied');
        } else if (cameraErr.name === "NotReadableError" || cameraErr.name === "TrackStartError") {
          errorMessage = t('qrScanner.cameraBusy');
        } else if (cameraErr.name === "NotFoundError") {
          errorMessage = t('qrScanner.cameraNotFoundDevice');
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
      setError(t('qrScanner.cameraInitFailed'));
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
        <h1 className="text-3xl font-bold" data-testid="heading-qr-scanner">{t('nav.qrScanner')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('qrScanner.scanPrinterQR')}
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
          <CardTitle>{t('qrScanner.camera')}</CardTitle>
          <CardDescription>
            {isScanning
              ? t('qrScanner.pointCamera')
              : t('qrScanner.clickToActivate')}
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
                  <p>{t('qrScanner.cameraOff')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!isScanning && (
              <Button onClick={startScanning} data-testid="button-start-scan">
                <Camera className="h-4 w-4 mr-2" />
                {t('qrScanner.startScanning')}
              </Button>
            )}
            {isScanning && (
              <Button onClick={stopScanning} variant="destructive" data-testid="button-stop-scan">
                <CameraOff className="h-4 w-4 mr-2" />
                {t('qrScanner.stop')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
