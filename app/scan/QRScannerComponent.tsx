'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import styles from './scanner.module.css';

export default function QRScannerComponent() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannerRef = useRef<QrScanner | null>(null); // Utilisation d'une Ref pour le scanner
    const [scannedData, setScannedData] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Initialisation du scanner
        scannerRef.current = new QrScanner(
            videoElement,
            (result) => {
                setScannedData(result.data);
            },
            {
                onDecodeError: (error) => {
                    // On ignore les erreurs de recherche de code (fréquentes pendant le scan)
                    if (typeof error === 'string' && error.includes('No QR code found')) {
                        return;
                    }
                },
                highlightCodeOutline: true,
                maxScansPerSecond: 5,
            }
        );

        const startScanner = async () => {
            try {
                setIsLoading(true);
                await scannerRef.current?.start();
                setIsScanning(true);
                setError('');
            } catch (err: any) {
                setError("Caméra introuvable ou accès refusé.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        startScanner();

        // Nettoyage crucial pour Next.js (Strict Mode)
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop();
                scannerRef.current.destroy();
                scannerRef.current = null;
            }
        };
    }, []);

    const handleToggleScan = async () => {
        if (!scannerRef.current) return;

        try {
            if (isScanning) {
                scannerRef.current.stop();
                setIsScanning(false);
            } else {
                await scannerRef.current.start();
                setIsScanning(true);
            }
        } catch (err) {
            setError("Impossible de basculer la caméra.");
        }
    };

    const handleReset = () => {
        setScannedData('');
        setError('');
    };

    return (
        <div className={styles.container}>
            <h1 className="text-xl font-bold mb-4">Scanner de Code QR</h1>

            <div className={styles.videoContainer} style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                {isLoading && <div className={styles.loading}>Initialisation...</div>}

                <video
                    ref={videoRef}
                    className={styles.video}
                    playsInline  // Indispensable pour iOS
                    muted        // Aide au démarrage automatique
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block' // Assure-toi qu'il n'est pas en display: none
                    }}
                />
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {scannedData && (
                <div className={styles.resultBox} style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
                    <h2 className="font-bold">Résultat :</h2>
                    <p className={styles.resultData} style={{ wordBreak: 'break-all' }}>{scannedData}</p>
                    <button onClick={handleReset} className={styles.resetButton}>
                        Réinitialiser
                    </button>
                </div>
            )}

            <div className={styles.controls} style={{ marginTop: '20px' }}>
                <button
                    onClick={handleToggleScan}
                    className={styles.button}
                >
                    {isScanning ? '⏸ Pause' : '▶ Reprendre'}
                </button>
            </div>
        </div>
    );
}