import React, { useState } from 'react';
import { MessageSquare, Send, Bot, Sparkles } from 'lucide-react';

const InsightBot = () => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResponse(null);
        try {
            const result = await window.electronAPI.askAI(query);
            setResponse(result);
        } catch (error) {
            setResponse({ type: 'error', message: "Sorry, I couldn't process that request." });
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        "Top selling books",
        "Total sales revenue",
        "Low stock alerts"
    ];

    return (
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg text-white h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center mb-1">
                    <Bot className="w-6 h-6 mr-2 text-indigo-200" />
                    Ask BookMaster AI
                </h3>
                <p className="text-indigo-100 text-sm opacity-80">
                    Get instant insights about your business in plain English.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                {!response ? (
                    <div className="flex flex-col justify-center h-full space-y-3">
                        <p className="text-xs uppercase tracking-wider text-indigo-300 font-semibold mb-1">Try asking:</p>
                        {suggestions.map(s => (
                            <button
                                key={s}
                                onClick={() => setQuery(s)}
                                className="text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all border border-white/5 flex items-center"
                            >
                                <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />
                                {s}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/10 rounded-xl p-4 border border-white/10 animate-fade-in">
                        <p className="text-xs text-indigo-200 mb-2 uppercase tracking-wider font-semibold">AI Answer:</p>

                        {response.type === 'table' && (
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg">{response.title}</h4>
                                <div className="bg-black/20 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <tbody className="divide-y divide-white/10">
                                            {response.data.map((row, i) => (
                                                <tr key={i} className="hover:bg-white/5">
                                                    <td className="p-3">{row.title}</td>
                                                    <td className="p-3 text-right font-mono">{row.sold} units</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {response.type === 'stat' && (
                            <div className="text-center py-4">
                                <h4 className="text-indigo-200 text-sm mb-1">{response.title}</h4>
                                <p className="text-4xl font-bold">LKR {response.data.toLocaleString()}</p>
                            </div>
                        )}

                        {response.type === 'list' && (
                            <div>
                                <h4 className="font-bold mb-2">{response.title}</h4>
                                <ul className="space-y-1">
                                    {response.data.map((item, i) => (
                                        <li key={i} className="text-sm flex justify-between bg-black/20 p-2 rounded">
                                            <span>{item.title}</span>
                                            <span className="text-red-300 font-bold">{item.stock_quantity} left</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {response.type === 'unknown' && (
                            <div className="p-2 text-center text-yellow-300 bg-yellow-900/20 rounded">
                                <p>{response.explanation}</p>
                            </div>
                        )}

                        {response.explanation && response.type !== 'unknown' && (
                            <p className="mt-3 text-xs text-indigo-200 italic border-t border-white/10 pt-2">
                                ℹ️ {response.explanation}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type your question..."
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
                <button
                    type="submit"
                    disabled={loading || !query.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </form>
        </div>
    );
};

export default InsightBot;
