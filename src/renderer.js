const { ipcRenderer } = require('electron');

let books = [];
let cart = [];

// Load books when the page loads
window.onload = async () => {
    loadBooks();
};

async function loadBooks() {
    try {
        books = await ipcRenderer.invoke('get-books');
        displayBooks();
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function displayBooks() {
    const bookList = document.getElementById('bookList');
    bookList.innerHTML = '';

    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>Author: ${book.author}</p>
            <p>Price: $${book.price.toFixed(2)}</p>
            <p>Stock: ${book.stock_quantity}</p>
            <button onclick="addToCart(${book.id})" ${book.stock_quantity === 0 ? 'disabled' : ''}>
                ${book.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        `;
        bookList.appendChild(bookElement);
    });
}

function addToCart(bookId) {
    const book = books.find(b => b.id === bookId);
    if (book && book.stock_quantity > 0) {
        const cartItem = cart.find(item => item.bookId === bookId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({
                bookId: book.id,
                title: book.title,
                price: book.price,
                quantity: 1
            });
        }
        updateCartDisplay();
        document.getElementById('cartCount').textContent = cart.length;
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div>
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.quantity} × $${item.price.toFixed(2)}</div>
            </div>
            <div class="text-right font-medium">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
    });

    cartTotal.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="font-semibold">Total</span>
            <span class="font-semibold">$${total.toFixed(2)}</span>
        </div>
    `;
}

function toggleCart() {
    const cartPanel = document.getElementById('cartPanel');
    cartPanel.classList.toggle('hidden');
}

async function checkout() {
    if (cart.length === 0) {
        alert('Cart is empty!');
        return;
    }

    const sale = {
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: 'cash',
        items: cart
    };

    try {
        await ipcRenderer.invoke('create-sale', sale);
        cart = [];
        updateCartDisplay();
        document.getElementById('cartCount').textContent = '0';
        loadBooks();
        alert('Sale completed successfully!');
    } catch (error) {
        console.error('Error creating sale:', error);
        alert('Error processing sale');
    }
}

function showAddBookForm() {
    // Implementation remains the same for now
    // You can create a modal dialog later for better UX
    const title = prompt('Enter book title:');
    if (!title) return;

    const book = {
        title,
        author: prompt('Enter author:'),
        isbn: prompt('Enter ISBN:'),
        genre: prompt('Enter genre:'),
        stock_quantity: parseInt(prompt('Enter stock quantity:')) || 0,
        price: parseFloat(prompt('Enter price:')) || 0,
        publisher: prompt('Enter publisher:'),
        seller: prompt('Enter seller:')
    };

    ipcRenderer.invoke('add-book', book)
        .then(() => {
            loadBooks();
            alert('Book added successfully!');
        })
        .catch(error => {
            console.error('Error adding book:', error);
            alert('Error adding book');
        });
}