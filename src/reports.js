const { ipcRenderer } = require('electron');
let salesChart, topSellingChart;

window.onload = async () => {
    initializeCharts();
    await loadInitialData();
};

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Daily Sales',
                data: [],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Sales'
                }
            }
        }
    });

    // Top Selling Chart
    const topSellingCtx = document.getElementById('topSellingChart').getContext('2d');
    topSellingChart = new Chart(topSellingCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Units Sold',
                data: [],
                backgroundColor: 'rgb(59, 130, 246)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Top Selling Books'
                }
            }
        }
    });
}

async function loadInitialData() {
    await generateSalesReport();
    await generateTopSellingReport();
}

async function generateSalesReport() {
    const range = document.getElementById('salesRange').value;
    try {
        const data = await ipcRenderer.invoke('generate-sales-report', { range });
        updateSalesChart(data);
    } catch (error) {
        console.error('Error generating sales report:', error);
    }
}

async function generateInventoryReport() {
    try {
        const data = await ipcRenderer.invoke('generate-inventory-report');
        // Trigger CSV download
        await ipcRenderer.invoke('export-to-csv', {
            data,
            filename: `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
        });
    } catch (error) {
        console.error('Error generating inventory report:', error);
    }
}

async function generateTopSellingReport() {
    const range = document.getElementById('topSellingRange').value;
    try {
        const data = await ipcRenderer.invoke('get-top-selling-books', { range });
        updateTopSellingChart(data);
    } catch (error) {
        console.error('Error generating top selling report:', error);
    }
}

function updateSalesChart(data) {
    salesChart.data.labels = data.map(item => item.date);
    salesChart.data.datasets[0].data = data.map(item => item.total_amount);
    salesChart.update();
}

function updateTopSellingChart(data) {
    topSellingChart.data.labels = data.map(item => item.title);
    topSellingChart.data.datasets[0].data = data.map(item => item.total_sold);
    topSellingChart.update();
}