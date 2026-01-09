
// const { books } = require('./seed_data_mock'); // Removed to use inline mock data

class POSSystem {
    constructor() {
        this.books = JSON.parse(JSON.stringify(mockBooks));
        this.sales = [];
        this.cart = [];
    }

    // 1. Functional: Product Management
    getBook(id) {
        return this.books.find(b => b.id === id);
    }

    addToCart(bookId, quantity) {
        const book = this.getBook(bookId);
        if (!book) return { success: false, error: 'Book not found' };
        if (book.stock_quantity < quantity) return { success: false, error: 'Insufficient stock' };

        const existing = this.cart.find(item => item.bookId === bookId);
        if (existing) {
            if (book.stock_quantity < existing.quantity + quantity) {
                return { success: false, error: 'Insufficient stock for total quantity' };
            }
            existing.quantity += quantity;
        } else {
            this.cart.push({ bookId, title: book.title, price: book.price, quantity });
        }
        return { success: true };
    }

    // 2. Financial Accuracy
    calculateTotal() {
        // Strict floating point handling
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return Math.round(total * 100) / 100; // Round to 2 decimal places
    }

    // 3. Inventory Integrity
    checkout(paymentReceived) {
        const total = this.calculateTotal();
        if (paymentReceived < total) return { success: false, error: 'Insufficient payment' };

        // Verify stock explicitly before committing
        for (const item of this.cart) {
            const book = this.getBook(item.bookId);
            if (book.stock_quantity < item.quantity) {
                return { success: false, error: `Stock changed during transaction for ${item.title}` };
            }
        }

        // Commit Transaction
        const saleRecord = {
            id: Date.now(),
            items: [...this.cart],
            total: total,
            date: new Date().toISOString()
        };
        this.sales.push(saleRecord);

        // Reduce Stock
        for (const item of this.cart) {
            const book = this.getBook(item.bookId);
            book.stock_quantity -= item.quantity;
        }

        this.cart = [];
        return { success: true, change: paymentReceived - total };
    }
}

// -- TEST SUITE --
const runTests = () => {
    console.log("Starting QA Automation Suite for BookMaster POS...");
    const pos = new POSSystem();
    const results = [];

    // Test 1: Add Item to Cart (Valid)
    pos.addToCart(1, 1); // Great Gatsby (Stock 50)
    results.push({
        id: 'FUNC-001',
        feature: 'Sales & Billing',
        desc: 'Add item to cart with valid stock',
        status: pos.cart.length === 1 ? 'PASS' : 'FAIL'
    });

    // Test 2: Overselling Prevention
    const overSellInit = pos.addToCart(1, 1000); // Exceeds stock
    results.push({
        id: 'INV-001',
        feature: 'Inventory Integrity',
        desc: 'Prevent adding quantity > stock',
        status: overSellInit.success === false ? 'PASS' : 'FAIL'
    });

    // Test 3: Financial Calculation Accuracy
    pos.cart = [];
    pos.addToCart(1, 2); // 12.99 * 2 = 25.98
    pos.addToCart(2, 1); // 14.50 * 1 = 14.50
    const total = pos.calculateTotal(); // Should be 40.48
    results.push({
        id: 'FIN-001',
        feature: 'Reports & Financial Accuracy',
        desc: 'Calculate cart total accurately',
        status: total === 40.48 ? 'PASS' : 'FAIL',
        details: `Expected 40.48, Got ${total}`
    });

    // Test 4: Checkout & Stock Reduction
    const initialStock = pos.getBook(1).stock_quantity; // 50
    pos.checkout(50.00);
    const finalStock = pos.getBook(1).stock_quantity; // Should be 48 (50 - 2)
    results.push({
        id: 'INV-002',
        feature: 'Inventory Integrity',
        desc: 'Stock reduces correctly after sale',
        status: (initialStock - finalStock) === 2 ? 'PASS' : 'FAIL',
        details: `Start: ${initialStock}, End: ${finalStock}`
    });

    // Test 5: Performance / Stress (Simulate 1000 items)
    const t0 = performance.now();
    for (let i = 0; i < 1000; i++) {
        pos.addToCart(3, 1); // To Kill a Mockingbird
    }
    const t1 = performance.now();
    const billingTime = t1 - t0;
    results.push({
        id: 'PERF-001',
        feature: 'Performance',
        desc: 'Add 1000 items to cart < 100ms',
        status: billingTime < 100 ? 'PASS' : 'WARN',
        details: `${billingTime.toFixed(2)}ms`
    });

    // Output JSON for the agent to read
    console.log(JSON.stringify(results, null, 2));
};

// Mock Data Source - Moved to top in logic, but for script fix we rename local usage or rely on top level
const mockBooks = [
    { id: 1, title: "The Great Gatsby", price: 12.99, stock_quantity: 50 },
    { id: 2, title: "1984", price: 14.50, stock_quantity: 40 },
    { id: 3, title: "To Kill a Mockingbird", price: 11.99, stock_quantity: 10000 },
];


module.exports = { mockBooks };

if (require.main === module) {
    runTests();
}
