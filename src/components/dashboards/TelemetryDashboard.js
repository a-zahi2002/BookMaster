import React, { useState, useEffect } from 'react';
import { Activity, Server, Clock, HardDrive, AlertTriangle, ShieldCheck } from 'lucide-react';

const TelemetryDashboard = () => {
    const [telemetry, setTelemetry] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTelemetry = async () => {
        try {
            if (window.electronAPI) {
                const data = await window.electronAPI.getSystemTelemetry();
                setTelemetry(data);
            }
        } catch (error) {
            console.error('Failed to fetch telemetry:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTelemetry();
        const interval = setInterval(fetchTelemetry, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    if (loading && !telemetry) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!telemetry) {
        return (
            <div className="p-8 text-center text-gray-500">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                <h3 className="text-xl font-bold">Telemetry Data Unavailable</h3>
                <p>Make sure you are running in the Electron environment.</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Activity className="mr-3 h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    Runtime Telemetry
                </h2>
                <p className="text-gray-500 dark:text-slate-400 mt-2">Live system health, error rates, and resource utilization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between">
                        <h3 className="text-gray-500 font-medium">Memory Usage</h3>
                        <HardDrive className="text-blue-500 h-5 w-5" />
                    </div>
                    <p className="text-3xl font-bold mt-2">{telemetry.memoryUsage} MB</p>
                    <div className="mt-4 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (telemetry.memoryUsage / 1024) * 100)}%` }}></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between">
                        <h3 className="text-gray-500 font-medium">Uptime</h3>
                        <Clock className="text-emerald-500 h-5 w-5" />
                    </div>
                    <p className="text-3xl font-bold mt-2">{telemetry.uptimeHours}h</p>
                    <p className="text-sm mt-1 text-emerald-600">System running smoothly</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between">
                        <h3 className="text-gray-500 font-medium">Recent Errors</h3>
                        <AlertTriangle className={telemetry.errorCount > 0 ? "text-amber-500 h-5 w-5" : "text-gray-400 h-5 w-5"} />
                    </div>
                    <p className="text-3xl font-bold mt-2">{telemetry.errorCount}</p>
                    <p className="text-sm mt-1 text-amber-600">In the last 24h</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between">
                        <h3 className="text-gray-500 font-medium">Auto-Updater</h3>
                        <ShieldCheck className={telemetry.updaterStatus.includes('Error') ? "text-red-500 h-5 w-5" : "text-indigo-500 h-5 w-5"} />
                    </div>
                    <p className="text-xl font-bold mt-2 truncate" title={telemetry.updaterStatus}>{telemetry.updaterStatus}</p>
                    <p className="text-sm mt-1 text-indigo-600">Active version: {telemetry.version}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <Server className="mr-2 h-5 w-5 text-gray-500" /> System Events Log
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {telemetry.recentLogs && telemetry.recentLogs.length > 0 ? (
                            telemetry.recentLogs.map((logItem, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm font-mono border-l-4 border-gray-300">
                                    <span className="text-gray-500">{logItem.time}</span>
                                    <span className="ml-2 font-semibold">{logItem.level}:</span>
                                    <span className="ml-2">{logItem.message}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">No recent log entries.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center">
                        <ShieldCheck className="mr-2 h-5 w-5 text-emerald-500" /> Backup Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
                            <div>
                                <p className="font-semibold">Last Local Backup</p>
                                <p className="text-sm text-gray-500">{telemetry.backups.lastLocal ? new Date(telemetry.backups.lastLocal).toLocaleString() : 'None'}</p>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">SUCCESS</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                            <div>
                                <p className="font-semibold">Last Cloud Backup</p>
                                <p className="text-sm text-gray-500">{telemetry.backups.lastCloud ? new Date(telemetry.backups.lastCloud).toLocaleString() : 'None'}</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">{telemetry.backups.lastCloud ? 'SUCCESS' : 'PENDING'}</span>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                <strong>Total Local Files: </strong> {telemetry.backups.localCount} <br />
                                <strong>Total Cloud Files: </strong> {telemetry.backups.cloudCount} <br />
                                <strong>Pending Uploads: </strong> {telemetry.backups.pendingCount}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TelemetryDashboard;
