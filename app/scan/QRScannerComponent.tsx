'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import styles from './scanner.module.css';

export default function QRScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Initialisation du scanner
    scannerRef.current = new QrScanner(
      videoElement,
      (result) => {
        setScannedResult(result.data); // Stocke le résultat dans la variable
        if (navigator.vibrate) navigator.vibrate(100); // Vibration
      },
      {
        highlightCodeOutline: true,
        preferredCamera: 'environment',
      }
    );

    scannerRef.current.start().catch((err) => console.error("Erreur caméra:", err));

    return () => {
      scannerRef.current?.destroy();
    };
  }, []);

  const handleReset = () => {
    setScannedResult(null);
    scannerRef.current?.start();
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>QR SCANNER</h1>
        <p>{scannedResult ? "Analyse terminée" : "Alignez le code QR"}</p>
      </header>

      <div className={styles.videoWrapper}>
        <video ref={videoRef} className={styles.video} playsInline muted />
        
        {!scannedResult && (
          <div className={styles.overlay}>
            <div className={styles.viewfinder}>
              <div className={`${styles.corner} ${styles.topL}`}></div>
              <div className={`${styles.corner} ${styles.topR}`}></div>
              <div className={`${styles.corner} ${styles.botL}`}></div>
              <div className={`${styles.corner} ${styles.botR}`}></div>
              <div className={styles.laser}></div>
            </div>
          </div>
        )}
      </div>

      {scannedResult && (
        <div className={styles.resultCard}>
          <h3 style={{ margin: 0 }}>Résultat :</h3>
          <div className={styles.dataBox}>{scannedResult}</div>
          <button className={styles.btnPrimary} onClick={handleReset}>
            Scanner à nouveau
          </button>
        </div>
      )}
    </div>
  );
}