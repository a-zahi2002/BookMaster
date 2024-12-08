const { createObjectCsvWriter } = require('csv-writer');
const moment = require('moment');
const { db } = require('../database/connection');

class ReportService {
  async generateSalesReport(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          s.id as sale_id,
          s.date,
          s.total_amount,
          s.payment_method,
          b.title,
          si.quantity,
          si.price
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN books b ON si.book_id = b.id
        WHERE s.date BETWEEN ? AND ?
      `;

      db.all(query, [startDate, endDate], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async generateInventoryReport() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          title,
          author,
          isbn,
          genre,
          stock_quantity,
          price,
          publisher,
          seller
        FROM books
        ORDER BY stock_quantity ASC
      `;

      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async exportToCSV(data, filename) {
    const csvWriter = createObjectCsvWriter({
      path: filename,
      header: Object.keys(data[0]).map(key => ({ id: key, title: key.toUpperCase() }))
    });

    await csvWriter.writeRecords(data);
    return filename;
  }

  async getTopSellingBooks(limit = 10, period = '30') {
    const startDate = moment().subtract(period, 'days').format('YYYY-MM-DD');
    
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          b.title,
          b.author,
          SUM(si.quantity) as total_sold,
          SUM(si.quantity * si.price) as total_revenue
        FROM sale_items si
        JOIN books b ON si.book_id = b.id
        JOIN sales s ON si.sale_id = s.id
        WHERE s.date >= ?
        GROUP BY b.id
        ORDER BY total_sold DESC
        LIMIT ?
      `;

      db.all(query, [startDate, limit], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  async getLowStockAlert(threshold = 5) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM books WHERE stock_quantity <= ? ORDER BY stock_quantity ASC',
        [threshold],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = new ReportService();