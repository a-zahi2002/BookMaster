const { db } = require('../src/database/connection');

const books = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Classic", price: 12.99, stock: 50, publisher: "Scribner", seller: "BookHouse" },
    { title: "1984", author: "George Orwell", genre: "Dystopian", price: 14.50, stock: 40, publisher: "Secker & Warburg", seller: "BookHouse" },
    { title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Classic", price: 11.99, stock: 35, publisher: "J.B. Lippincott & Co.", seller: "BookHouse" },
    { title: "The Hobbit", author: "J.R.R. Tolkien", genre: "Fantasy", price: 15.00, stock: 60, publisher: "Allen & Unwin", seller: "MiddleEarthBooks" },
    { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", genre: "Fantasy", price: 20.00, stock: 100, publisher: "Bloomsbury", seller: "WizardingWorks" },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Classic", price: 10.99, stock: 30, publisher: "Little, Brown", seller: "BookHouse" },
    { title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", price: 9.99, stock: 45, publisher: "T. Egerton", seller: "ClassicReads" },
    { title: "The Da Vinci Code", author: "Dan Brown", genre: "Thriller", price: 18.50, stock: 55, publisher: "Doubleday", seller: "MysteryShack" },
    { title: "The Alchemist", author: "Paulo Coelho", genre: "Philosophy", price: 16.00, stock: 70, publisher: "HarperTorch", seller: "GlobalBooks" },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", genre: "Non-fiction", price: 22.00, stock: 25, publisher: "Farrar, Straus and Giroux", seller: "SmartRead" },
    { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", genre: "History", price: 24.00, stock: 40, publisher: "Harvill Secker", seller: "SmartRead" },
    { title: "Educated", author: "Tara Westover", genre: "Memoir", price: 19.00, stock: 30, publisher: "Random House", seller: "BioBooks" },
    { title: "Becoming", author: "Michelle Obama", genre: "Memoir", price: 21.00, stock: 50, publisher: "Crown", seller: "BioBooks" },
    { title: "Atomic Habits", author: "James Clear", genre: "Self-help", price: 17.50, stock: 80, publisher: "Penguin", seller: "GrowthBooks" },
    { title: "The Power of Now", author: "Eckhart Tolle", genre: "Spirituality", price: 15.50, stock: 45, publisher: "Namaste Publishing", seller: "SpiritReads" },
    { title: "Dune", author: "Frank Herbert", genre: "Sci-Fi", price: 18.00, stock: 60, publisher: "Chilton Books", seller: "FutureWorlds" },
    { title: "Neuromancer", author: "William Gibson", genre: "Sci-Fi", price: 14.00, stock: 35, publisher: "Ace", seller: "FutureWorlds" },
    { title: "Gone Girl", author: "Gillian Flynn", genre: "Thriller", price: 13.50, stock: 50, publisher: "Crown", seller: "MysteryShack" },
    { title: "The Girl on the Train", author: "Paula Hawkins", genre: "Thriller", price: 12.50, stock: 45, publisher: "Riverhead", seller: "MysteryShack" },
    { title: "Where the Crawdads Sing", author: "Delia Owens", genre: "Fiction", price: 16.50, stock: 75, publisher: "Putnam", seller: "NatureReads" }
];

const users = [
    { username: 'admin', password: 'password123', role: 'admin' },
    { username: 'staff1', password: 'password123', role: 'staff' },
    { username: 'staff2', password: 'password123', role: 'staff' }
];

const { runMigrations } = require('../src/database/migrations');

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Wrap in async function to handle migrations
(async () => {
    try {
        console.log('Running migrations...');
        await runMigrations();
        console.log('Migrations completed.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }

    db.serialize(() => {
        // 1. Clear existing data (optional - uncomment if you want a fresh start)
        // console.log('Clearing existing data...');
        // db.run("DELETE FROM books");
        // db.run("DELETE FROM users");
        // db.run("DELETE FROM sales");
        // db.run("DELETE FROM sale_items");

        // 2. Insert Users
        console.log('Seeding Users...');
        const stmtUser = db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
        users.forEach(user => {
            stmtUser.run(user.username, user.password, user.role);
        });
        stmtUser.finalize();

        // 3. Insert Books
        console.log('Seeding Books...');
        const stmtBook = db.prepare("INSERT INTO books (title, author, genre, price, stock_quantity, publisher, seller) VALUES (?, ?, ?, ?, ?, ?, ?)");
        books.forEach(book => {
            stmtBook.run(book.title, book.author, book.genre, book.price, book.stock, book.publisher, book.seller);
        });
        stmtBook.finalize();

        // 4. Generate Sales
        console.log('Seeding Sales...');

        // Get user IDs
        db.all("SELECT id FROM users", (err, userRows) => {
            if (err) { console.error(err); return; }
            const userIds = userRows.map(u => u.id);

            // Get book IDs and prices
            db.all("SELECT id, price FROM books", (err, bookRows) => {
                if (err) { console.error(err); return; }
                if (bookRows.length === 0) { console.log("No books found to create sales."); return; }

                const stmtSale = db.prepare("INSERT INTO sales (user_id, total_amount, payment_method, date) VALUES (?, ?, ?, ?)");
                const stmtSaleItem = db.prepare("INSERT INTO sale_items (sale_id, book_id, quantity, price) VALUES (?, ?, ?, ?)");

                const startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                const endDate = new Date();

                // Create 50 random sales
                for (let i = 0; i < 50; i++) {
                    const randomUserUrl = userIds[Math.floor(Math.random() * userIds.length)];
                    const saleDate = getRandomDate(startDate, endDate).toISOString();
                    const paymentMethods = ['Cash', 'Card', 'UPI'];
                    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

                    // Pick 1-5 random books
                    const numItems = Math.floor(Math.random() * 5) + 1;
                    let totalAmount = 0;
                    const saleItems = [];

                    for (let j = 0; j < numItems; j++) {
                        const book = bookRows[Math.floor(Math.random() * bookRows.length)];
                        const quantity = Math.floor(Math.random() * 2) + 1;
                        const itemTotal = book.price * quantity;
                        totalAmount += itemTotal;
                        saleItems.push({ book_id: book.id, quantity, price: book.price });
                    }

                    stmtSale.run(randomUserUrl, totalAmount, paymentMethod, saleDate, function (err) {
                        if (err) console.error(err);
                        const saleId = this.lastID;
                        saleItems.forEach(item => {
                            stmtSaleItem.run(saleId, item.book_id, item.quantity, item.price);
                        });
                    });
                }
                // Finalize handled implicitly or via logic - removed explicit premature finalization
                console.log('Seeding completed successfully.');
            });
        });
    });
})();
