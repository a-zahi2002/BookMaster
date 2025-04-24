const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    loadAvailableBooks();
    loadSalesOverview();
    loadRecentTransactions();
    renderSalesChart();
});

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
                    <button onclick="addToCart(${book.id})" class="text-blue-600 hover:text-blue-900 mr-3">Add to Cart</button>
                    <button onclick="viewBookDetails(${book.id})" class="text-green-600 hover:text-green-900">View Details</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load available books:', error);
    }
}

function addToCart(bookId) {
    // Logic to add the book to the cart
    console.log(`Book ${bookId} added to cart`);
}

function viewBookDetails(bookId) {
    // Fetch book details and display in modal
    ipcRenderer.invoke('get-book-details', bookId).then(book => {
        const content = `
            <h4 class="text-md font-medium">Title: ${book.title}</h4>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Price:</strong> LKR ${book.price.toLocaleString()}</p>
            <p><strong>Stock:</strong> ${book.stock}</p>
            <p><strong>Description:</strong> ${book.description}</p>
        `;
        document.getElementById('bookDetailsContent').innerHTML = content;
        document.getElementById('bookDetailsModal').classList.remove('hidden');
    }).catch(error => {
        console.error('Failed to load book details:', error);
    });
}

function closeBookDetailsModal() {
    document.getElementById('bookDetailsModal').classList.add('hidden');
}

async function loadSalesOverview() {
    try {
        const overview = await ipcRenderer.invoke('get-sales-overview');
        document.getElementById('totalSales').textContent = `LKR ${overview.totalSales.toLocaleString()}`;
        document.getElementById('totalItemsSold').textContent = overview.totalItemsSold;
        document.getElementById('totalTransactions').textContent = overview.totalTransactions;
    } catch (error) {
        console.error('Failed to load sales overview:', error);
    }
}

async function loadRecentTransactions() {
    try {
        const transactions = await ipcRenderer.invoke('get-recent-transactions');
        const tbody = document.getElementById('recentTransactionsList');
        tbody.innerHTML = '';

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${new Date(transaction.date).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">LKR ${transaction.total.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${transaction.itemsSold}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load recent transactions:', error);
    }
}

function renderSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Populate with dates
            datasets: [{
                label: 'Sales',
                data: [], // Populate with sales data
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Fetch sales data for the chart
    ipcRenderer.invoke('get-sales-data').then(data => {
        salesChart.data.labels = data.labels; // Dates
        salesChart.data.datasets[0].data = data.sales; // Sales amounts
        salesChart.update();
    }).catch(error => {
        console.error('Failed to load sales data for chart:', error);
    });
} 