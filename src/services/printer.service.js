const { printer } = require('node-thermal-printer');
const logger = require('../utils/logger');

class PrinterService {
    static async printReceipt(sale) {
        try {
            const printer = new printer({
                type: 'epson',
                interface: 'printer:POS-58'
            });

            printer.alignCenter();
            printer.println("Bookstore POS");
            printer.drawLine();
            
            sale.items.forEach(item => {
                printer.alignLeft();
                printer.println(`${item.title}`);
                printer.alignRight();
                printer.println(`${item.quantity} x $${item.price}`);
            });

            printer.drawLine();
            printer.alignRight();
            printer.println(`Total: $${sale.totalAmount}`);
            printer.println(`Payment: ${sale.paymentMethod}`);
            printer.cut();

            return await printer.execute();
        } catch (error) {
            logger.error('Print receipt error:', error);
            throw error;
        }
    }

    static async printBarcode(bookId, quantity = 1) {
        try {
            const printer = new printer({
                type: 'epson',
                interface: 'printer:POS-58'
            });

            for (let i = 0; i < quantity; i++) {
                printer.printBarcode(bookId.toString(), "EAN13");
                printer.cut();
            }

            return await printer.execute();
        } catch (error) {
            logger.error('Print barcode error:', error);
            throw error;
        }
    }

    static async getPrinters() {
        // Implementation depends on the OS and printer discovery method
        return ['POS-58', 'POS-80']; // Example return
    }
}

module.exports = PrinterService;