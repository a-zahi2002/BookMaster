const SimpleLinearRegression = (x, y) => {
    const n = x.length;
    if (n === 0) return { slope: 0, intercept: 0 };

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
};

class AIService {
    constructor(db) {
        this.db = db;
    }

    /**
     * 1. Predictive Sales Analytics
     * Forecasts future sales based on historical daily sales data.
     */
    async generateSalesForecast(daysToForecast = 7) {
        try {
            // Fetch last 30 days of sales
            const salesData = await this.db.all(`
        SELECT 
          date(created_at) as date,
          SUM(total_amount) as total
        FROM sales 
        WHERE created_at >= date('now', '-30 days')
        GROUP BY date(created_at)
        ORDER BY date ASC
      `);

            if (salesData.length < 5) {
                return {
                    forecast: [],
                    confidence: 0,
                    explanation: "Not enough historical data (minimum 5 days required)."
                };
            }

            // Prepare data for regression
            const x = salesData.map((_, i) => i);
            const y = salesData.map(d => d.total);

            const { slope, intercept } = SimpleLinearRegression(x, y);

            // Generate forecast
            const forecast = [];
            const today = new Date();

            for (let i = 1; i <= daysToForecast; i++) {
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate() + i);

                const predictedValue = Math.max(0, slope * (x.length + i) + intercept);

                forecast.push({
                    date: futureDate.toISOString().split('T')[0],
                    predictedAmount: Math.round(predictedValue * 100) / 100,
                    trend: slope > 0 ? "increasing" : "decreasing"
                });
            }

            // Calculate confidence based on R-squared approximation or variance
            // Simplified: More data points usually means slightly higher confidence in this simple model
            const confidence = Math.min(0.5 + (salesData.length * 0.01), 0.95);

            return {
                forecast,
                confidence: parseFloat(confidence.toFixed(2)),
                explanation: `Based on a linear trend analysis of the past ${salesData.length} days. Sales are showing a ${slope > 0 ? 'positive' : 'negative'} trajectory.`
            };

        } catch (error) {
            console.error('Error generating sales forecast:', error);
            throw error;
        }
    }

    /**
     * 2. AI-Assisted Inventory Reorder System
     * Analyzes velocity and stock levels to recommend restocking.
     */
    async generateReorderRecommendations() {
        try {
            // Get books with sales velocity (avg sold per day in last 30 days)
            const recommendations = await this.db.all(`
        WITH SalesVelocity AS (
          SELECT 
            si.book_id,
            SUM(si.quantity) as total_sold,
            COUNT(DISTINCT date(s.created_at)) as sales_days
          FROM sales_items si
          JOIN sales s ON si.sale_id = s.id
          WHERE s.created_at >= date('now', '-30 days')
          GROUP BY si.book_id
        )
        SELECT 
          b.id, b.title, b.author, b.stock_quantity, b.price,
          COALESCE(sv.total_sold, 0) as sold_last_30_days,
          COALESCE(sv.total_sold / 30.0, 0) as daily_velocity
        FROM books b
        LEFT JOIN SalesVelocity sv ON b.id = sv.book_id
        WHERE b.stock_quantity < 20 OR (sv.total_sold / 30.0) > 0.5
      `);

            const insights = recommendations.map(book => {
                const dailyVelocity = parseFloat(book.daily_velocity);
                const daysOfCover = dailyVelocity > 0 ? Math.floor(book.stock_quantity / dailyVelocity) : 999;

                let priority = 'LOW';
                let suggestedReorder = 0;
                let reasoning = "";

                if (daysOfCover < 7) {
                    priority = 'CRITICAL';
                    suggestedReorder = Math.ceil(dailyVelocity * 14); // Target 2 weeks cover
                    reasoning = `Sales velocity is ${dailyVelocity.toFixed(1)}/day. Current stock (${book.stock_quantity}) will last only ~${daysOfCover} days.`;
                } else if (daysOfCover < 14) {
                    priority = 'HIGH';
                    suggestedReorder = Math.ceil(dailyVelocity * 14);
                    reasoning = `Stock is getting low relative to demand. Expected stockout in ${daysOfCover} days.`;
                } else if (book.stock_quantity < 5) {
                    priority = 'MEDIUM';
                    suggestedReorder = 10; // Default minimum
                    reasoning = "Stock quantity is critically low (" + book.stock_quantity + "), although velocity is currently low.";
                }

                if (suggestedReorder > 0) {
                    return {
                        bookId: book.id,
                        title: book.title,
                        currentStock: book.stock_quantity,
                        salesVelocity: dailyVelocity.toFixed(2),
                        daysOfCover,
                        priority,
                        suggestedReorder,
                        reasoning,
                        confidence: 0.90 // Statistical calculation is deterministic
                    };
                }
                return null;
            }).filter(Boolean);

            return insights.sort((a, b) => {
                const pMap = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
                return pMap[b.priority] - pMap[a.priority];
            });

        } catch (error) {
            console.error('Error generating reorder recommendations:', error);
            throw error;
        }
    }

    /**
     * 4. Sales Trend & Anomaly Detection
     */
    async detectAnomalies() {
        try {
            const sales = await this.db.all(`
        SELECT date(created_at) as date, SUM(total_amount) as total
        FROM sales
        WHERE created_at >= date('now', '-60 days')
        GROUP BY date(created_at)
        ORDER BY total DESC
      `);

            if (sales.length < 10) return [];

            // Calculate simple stats
            const totals = sales.map(s => s.total);
            const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
            const stdDev = Math.sqrt(totals.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / totals.length);

            const anomalies = sales.filter(s => {
                const zScore = (s.total - avg) / stdDev;
                return Math.abs(zScore) > 2; // >2 standard deviations
            }).map(s => ({
                date: s.date,
                total: s.total,
                type: s.total > avg ? 'SPIKE' : 'DROP',
                severity: Math.abs((s.total - avg) / stdDev) > 3 ? 'HIGH' : 'MEDIUM',
                reasoning: `Sales were ${Math.abs(((s.total - avg) / stdDev)).toFixed(1)}x standard deviations ${s.total > avg ? 'above' : 'below'} average.`
            }));

            return anomalies;

        } catch (error) {
            console.error('Error detecting anomalies:', error);
            throw error;
        }
    }

    /**
     * 3. Natural Language Business Insights
     * Rule-based intent parser for SQL generation
     */
    async processNaturalLanguageQuery(query) {
        const lowerQuery = query.toLowerCase();

        // Safety check: allow specific patterns only, NO raw SQL generation
        let result = { type: 'unknown', data: null, explanation: "I didn't understand that query. Try asking about 'top selling books', 'total sales', or 'low stock'." };

        try {
            if (lowerQuery.includes('top selling') || lowerQuery.includes('best seller')) {
                const data = await this.db.all(`
          SELECT b.title, SUM(si.quantity) as sold
          FROM sales_items si
          JOIN books b ON si.book_id = b.id
          GROUP BY si.book_id
          ORDER BY sold DESC
          LIMIT 5
        `);
                result = {
                    type: 'table',
                    title: 'Top 5 Best Selling Books',
                    data,
                    explanation: "Showing the top 5 books with the highest quantity sold across all time."
                };
            }
            else if (lowerQuery.includes('total sales') || lowerQuery.includes('how much money')) {
                const data = await this.db.get(`SELECT SUM(total_amount) as total FROM sales`);
                result = {
                    type: 'stat',
                    title: 'Total Revenue',
                    data: data.total || 0,
                    explanation: "Calculated the sum of all completed transactions in the database."
                };
            }
            else if (lowerQuery.includes('low stock') || lowerQuery.includes('run out')) {
                const data = await this.db.all(`SELECT title, stock_quantity FROM books WHERE stock_quantity < 10 ORDER BY stock_quantity ASC LIMIT 10`);
                result = {
                    type: 'list',
                    title: 'Low Stock Alerts',
                    data,
                    explanation: "Found books where current inventory count is less than 10."
                };
            }

            return result;

        } catch (error) {
            console.error('Error processing NL query:', error);
            return { type: 'error', message: "Could not process query." };
        }
    }
}

module.exports = AIService;
