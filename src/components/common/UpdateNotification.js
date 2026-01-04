import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';

const UpdateNotification = () => {
    const [updateStatus, setUpdateStatus] = useState(null); // checking, available, progress, downloaded, error
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!window.electronAPI) return;

        window.electronAPI.onUpdateMessage((data) => {
            console.log('Update message:', data);

            switch (data.status) {
                case 'checking':
                    // Optionally show checking status, or stay silent until found
                    break;
                case 'available':
                    setUpdateStatus('available');
                    setMessage('New version found. Downloading in background...');
                    setIsVisible(true);
                    break;
                case 'progress':
                    setUpdateStatus('progress');
                    setProgress(Math.round(data.progress.percent));
                    setIsVisible(true);
                    break;
                case 'downloaded':
                    setUpdateStatus('downloaded');
                    setMessage('Update ready to install.');
                    setIsVisible(true);
                    break;
                case 'error':
                    setUpdateStatus('error');
                    setMessage('Update check failed. ' + (data.error || ''));
                    // Only show error if we were actively downloading, otherwise silent fail is better for POS
                    console.error("Update error:", data.error);
                    break;
                case 'not-available':
                    // Silent
                    break;
                default:
                    break;
            }
        });

        // Check for updates on mount (app start)
        // Only if not in dev mode usually, but ipcMain handles that check
        window.electronAPI.checkForUpdates();

        return () => {
            if (window.electronAPI.removeUpdateListeners) {
                window.electronAPI.removeUpdateListeners();
            }
        };
    }, []);

    const handleRestart = async () => {
        if (window.confirm('The application will restart to update. Ensure active transactions are completed. Continue?')) {
            await window.electronAPI.quitAndInstall();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible && updateStatus !== 'downloaded') return null; // Always show if downloaded until actioned? Or allow dismiss?

    // Render logic
    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className="bg-white rounded-xl shadow-2xl border border-blue-100 p-4 max-w-sm w-full">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        {updateStatus === 'downloaded' ? (
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        ) : updateStatus === 'error' ? (
                            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                                <Download className="h-6 w-6 text-blue-600" />
                            </div>
                        )}

                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">
                                {updateStatus === 'downloaded' ? 'Update Ready' :
                                    updateStatus === 'progress' ? `Downloading ${progress}%` :
                                        updateStatus === 'available' ? 'Update Available' : 'Update System'}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{message}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Progress Bar */}
                {updateStatus === 'progress' && (
                    <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                )}

                {/* Action Buttons */}
                {updateStatus === 'downloaded' && (
                    <div className="mt-4 flex space-x-2">
                        <button
                            onClick={handleRestart}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                        >
                            <RefreshCw className="h-3 w-3 mr-1.5" />
                            Restart & Update
                        </button>
                        <button
                            onClick={handleClose}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                        >
                            Later
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpdateNotification;
