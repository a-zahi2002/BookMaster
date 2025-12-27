import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Activity } from 'lucide-react';
import ForecastWidget from './ForecastWidget';
import SmartRestockList from './SmartRestockList';
import InsightBot from './InsightBot';

const AIInsightsPanel = () => {
    const [anomalies, setAnomalies] = useState([]);

    useEffect(() => {
        loadAnomalies();
    }, []);

    const loadAnomalies = async () => {
        try {
            const data = await window.electronAPI.getAnomalies();
            if (!data.error) setAnomalies(data);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">AI Command Center</h2>
                    <p className="text-gray-500">Real-time predictive analytics & automated insights</p>
                </div>
                <div className="flex-1"></div>
                <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center">
                    <Activity className="w-3 h-3 mr-2 animate-pulse" />
                    System Active
                </div>
            </div>

            {/* Anomalies Banner */}
            {anomalies.length > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start space-x-4 animate-in fade-in slide-in-from-top-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Activity className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-orange-900">Anomaly Detected</h3>
                        <p className="text-sm text-orange-800 mt-1">
                            We detected {anomalies.length} unusual sales pattern(s) in the last 60 days.
                        </p>
                        <div className="mt-3 flex space-x-4 overflow-x-auto pb-2">
                            {anomalies.map((a, i) => (
                                <div key={i} className="flex-shrink-0 bg-white p-3 rounded-lg border border-orange-100 shadow-sm text-sm">
                                    <span className="font-semibold block">{a.date}</span>
                                    <span className={`text-xs font-bold ${a.type === 'SPIKE' ? 'text-green-600' : 'text-red-600'}`}>
                                        {a.type === 'SPIKE' ? '📈 Surge' : '📉 Drop'}
                                    </span>
                                    <span className="text-gray-500 mx-1">•</span>
                                    <span className="text-gray-600">{a.reasoning}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Forecast & Chat */}
                <div className="lg:col-span-2 space-y-8">
                    <ForecastWidget />

                    {/* Chatbot Section */}
                    <div className="h-[400px]">
                        <InsightBot />
                    </div>
                </div>

                {/* Right Column: Restock Recommendations */}
                <div className="lg:col-span-1">
                    <SmartRestockList />
                </div>
            </div>

        </div>
    );
};

export default AIInsightsPanel;
