const { ipcRenderer } = require('electron');

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    // Logout button handler
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await ipcRenderer.invoke('logout');
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout failed:', error);
            alert('Failed to logout. Please try again.');
        }
    });

    // Section navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(e.currentTarget.dataset.section);
        });
    });

    // Load available books
    loadAvailableBooks();

    // Initialize cart
    updateCartDisplay();
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${sectionId}Section`).classList.remove('hidden');
    document.getElementById('sectionTitle').textContent = 
        sectionId === 'pos' ? 'Point of Sale' : 'View Books';
}

async function loadAvailableBooks() {
    try {
        const books = await ipcRenderer.invoke('get-available-books');
        const tbody = document.getElementById('availableBooksList');
        tbody.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${book.title}</td>
                <td class="px-6 py-4 whitespace-nowrap">LKR ${book.price.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${book.stock}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="addToCart(${book.id})" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            ${book.stock <= 0 ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load books:', error);
        alert('Failed to load available books. Please try again.');
    }
}

async function addToCart(bookId) {
    try {
        const book = await ipcRenderer.invoke('get-book', bookId);
        const existingItem = cart.find(item => item.id === bookId);

        if (existingItem) {
            if (existingItem.quantity < book.stock) {
                existingItem.quantity++;
            } else {
                alert('Maximum stock reached');
                return;
            }
        } else {
            cart.push({
                id: bookId,
                title: book.title,
                price: book.price,
                quantity: 1
            });
        }

        updateCartDisplay();
    } catch (error) {
        console.error('Failed to add to cart:', error);
        alert('Failed to add item to cart. Please try again.');
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center';
        itemDiv.innerHTML = `
            <div>
                <h4 class="font-medium">${item.title}</h4>
                <p class="text-sm text-gray-600">
                    LKR ${item.price.toLocaleString()} x ${item.quantity}
                </p>
            </div>
            <button onclick="removeFromCart(${item.id})" class="text-red-600 hover:text-red-900">
                Remove
            </button>
        `;
        cartItems.appendChild(itemDiv);
        total += item.price * item.quantity;
    });

    cartTotal.textContent = `LKR ${total.toLocaleString()}`;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function removeFromCart(bookId) {
    cart = cart.filter(item => item.id !== bookId);
    updateCartDisplay();
}

async function processPayment(method) {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }

    try {
        await ipcRenderer.invoke('process-sale', {
            items: cart,
            paymentMethod: method
        });
        cart = [];
        updateCartDisplay();
        alert('Payment successful!');
        loadAvailableBooks(); // Refresh available books
    } catch (error) {
        console.error('Payment failed:', error);
        alert('Payment failed. Please try again.');
    }
}

function toggleCart() {
    const cartPanel = document.getElementById('cartPanel');
    cartPanel.classList.toggle('hidden');
} 