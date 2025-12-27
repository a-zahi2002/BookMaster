import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertTriangle, Check, RefreshCw } from 'lucide-react';

const SmartRestockList = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            const data = await window.electronAPI.getReorderRecommendations();
            if (data.error) throw new Error(data.error);
            setRecommendations(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-pulse h-64">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
                        Smart Restock
                    </h3>
                    <p className="text-sm text-gray-500">AI-suggested inventory reorders</p>
                </div>
                <button
                    onClick={loadRecommendations}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh Insights"
                >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {recommendations.length === 0 ? (
                <div className="text-center py-10">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h4 className="text-gray-900 font-medium">Inventory Healthy</h4>
                    <p className="text-sm text-gray-500 mt-1">No restocking actions needed yet.</p>
                </div>
            ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {recommendations.map((item) => (
                        <div
                            key={item.bookId}
                            className={`p-4 rounded-xl border ${item.priority === 'CRITICAL' ? 'bg-red-50 border-red-100' :
                                    item.priority === 'HIGH' ? 'bg-orange-50 border-orange-100' :
                                        'bg-blue-50 border-blue-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
                                    <div className="flex items-center text-xs mt-1 space-x-3">
                                        <span className="text-gray-600">Stock: <b className="text-gray-900">{item.currentStock}</b></span>
                                        <span className="text-gray-600">Velocity: <b className="text-gray-900">{item.salesVelocity}/day</b></span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase ${item.priority === 'CRITICAL' ? 'bg-red-200 text-red-800' :
                                        item.priority === 'HIGH' ? 'bg-orange-200 text-orange-800' :
                                            'bg-blue-200 text-blue-800'
                                    }`}>
                                    {item.priority}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mt-3 pl-3 border-l-2 border-black/10">
                                <p className="text-xs text-gray-600 w-2/3 italic">
                                    "{item.reasoning}"
                                </p>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Suggest</p>
                                    <p className="text-lg font-bold text-gray-900">+{item.suggestedReorder}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SmartRestockList;
