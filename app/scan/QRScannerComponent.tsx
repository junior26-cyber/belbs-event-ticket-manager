'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import styles from './scanner.module.css';

export default function QRScannerComponent() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanner, setScanner] = useState<QrScanner | null>(null);
    const [scannedData, setScannedData] = useState<string>('');
    const [isScanning, setIsScanning] = useState(true);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!videoRef.current) return;

        const qrScanner = new QrScanner(
            videoRef.current,
            (result) => {
                setScannedData(result.data);
                // Optionnel: arrêter le scanner après une lecture réussie
                // qrScanner.stop();
            },
            {
                onDecodeError: (error) => {
                    // Ignorer les erreurs de décodage normales
                    if (error !== QrScanner.NO_QR_CODE_FOUND) {
                        console.error('QR Scanner error:', error);
                    }
                },
                highlightCodeOutline: true,
                maxScansPerSecond: 5,
            }
        );

        setScanner(qrScanner);
        setIsLoading(true);

        qrScanner.start()
            .then(() => {
                setIsLoading(false);
                setError('');
            })
            .catch((err) => {
                setError(`Erreur lors du démarrage du scanner: ${err.message}`);
                setIsLoading(false);
            });

        return () => {
            qrScanner.stop();
            qrScanner.destroy();
        };
    }, []);

    const handleToggleScan = async () => {
        if (!scanner) return;

        try {
            if (isScanning) {
                await scanner.stop();
                setIsScanning(false);
            } else {
                await scanner.start();
                setIsScanning(true);
            }
        } catch (err) {
            setError(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        }
    };

    const handleReset = () => {
        setScannedData('');
        setError('');
    };

    return (
        <div className={styles.container}>
            <h1>Scanner de Code QR</h1>

            <div className={styles.videoContainer}>
                {isLoading && <div className={styles.loading}>Initialisation du scanner...</div>}
                <video
                    ref={videoRef}
                    className={styles.video}
                    style={{ display: isLoading ? 'none' : 'block' }}
                />
                <div className={styles.scannerOverlay} />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {scannedData && (
                <div className={styles.resultBox}>
                    <h2>Code QR scanné ✓</h2>
                    <p className={styles.resultData}>{scannedData}</p>
                    <button onClick={handleReset} className={styles.resetButton}>
                        Scanner un autre code
                    </button>
                </div>
            )}

            <div className={styles.controls}>
                <button
                    onClick={handleToggleScan}
                    className={`${styles.button} ${isScanning ? styles.buttonActive : ''}`}
                >
                    {isScanning ? '⏸ Pause' : '▶ Reprendre'}
                </button>
            </div>

            <div className={styles.info}>
                <h3>Instructions:</h3>
                <ul>
                    <li>Placez le code QR devant votre caméra</li>
                    <li>Assurez-vous d'avoir une bonne luminosité</li>
                    <li>Le scanner détectera automatiquement le code</li>
                </ul>
            </div>
        </div>
    );
}
