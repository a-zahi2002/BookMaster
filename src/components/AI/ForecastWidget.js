import React, { useState, useEffect } from 'react';
import { TrendingUp, FileText, AlertCircle } from 'lucide-react';

const ForecastWidget = () => {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadForecast();
    }, []);

    const loadForecast = async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getSalesForecast(7);
            if (data.error) throw new Error(data.error);
            setForecast(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-64">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-40 bg-gray-100 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-red-100">
            <div className="flex items-center text-red-600 mb-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                <h3 className="font-semibold">Forecast Unavailable</h3>
            </div>
            <p className="text-sm text-gray-500">{error}</p>
            {error.includes("Not enough historical data") && (
                <p className="text-xs text-gray-400 mt-2">The system needs at least 5 days of sales data to generate accurate predictions.</p>
            )}
        </div>
    );

    if (!forecast || !forecast.forecast.length) return null;

    const maxVal = Math.max(...forecast.forecast.map(d => d.predictedAmount)) * 1.1;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                        AI Sales Forecast
                    </h3>
                    <p className="text-sm text-gray-500">Predicted revenue for next 7 days</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Confidence</div>
                    <div className={`text-lg font-bold ${forecast.confidence > 0.8 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {(forecast.confidence * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div className="flex items-end space-x-2 h-48 mb-4 border-b border-gray-100 pb-2">
                {forecast.forecast.map((day, i) => {
                    const heightPct = (day.predictedAmount / maxVal) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col justify-end group relative">
                            <div
                                className="bg-indigo-50 hover:bg-indigo-100 rounded-t-lg transition-all duration-300 relative"
                                style={{ height: `${heightPct}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                    LKR {day.predictedAmount.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 text-center mt-2 truncate">
                                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-indigo-50/50 rounded-lg p-3 flex items-start">
                <FileText className="w-4 h-4 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                    <span className="font-semibold text-indigo-900">AI Insight:</span> {forecast.explanation}
                </p>
            </div>
        </div>
    );
};

export default ForecastWidget;
