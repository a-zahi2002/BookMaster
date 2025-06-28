const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for authentication
ipcMain.handle('login', async (event, credentials) => {
  const users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    { id: 2, username: 'manager', password: 'manager123', role: 'manager', name: 'Manager' },
    { id: 3, username: 'cashier', password: 'cashier123', role: 'cashier', name: 'Cashier' }
  ];

  const user = users.find(u => 
    u.username === credentials.username && 
    u.password === credentials.password
  );

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const { password, ...userData } = user;
  return userData;
});

ipcMain.handle('logout', async () => {
  return { success: true };
});

// Mock database operations for demo
let mockBooks = [
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    price: 1500,
    stock_quantity: 25,
    publisher: "Scribner"
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    price: 1200,
    stock_quantity: 18,
    publisher: "J.B. Lippincott & Co."
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    price: 1350,
    stock_quantity: 30,
    publisher: "Secker & Warburg"
  }
];

ipcMain.handle('get-inventory', async () => {
  return mockBooks;
});

ipcMain.handle('add-book', async (event, bookData) => {
  const newBook = {
    id: Date.now(),
    ...bookData
  };
  mockBooks.push(newBook);
  return { success: true, id: newBook.id };
});

ipcMain.handle('update-book', async (event, id, bookData) => {
  const index = mockBooks.findIndex(book => book.id === id);
  if (index !== -1) {
    mockBooks[index] = { ...mockBooks[index], ...bookData };
    return { success: true };
  }
  return { success: false, error: 'Book not found' };
});

ipcMain.handle('delete-book', async (event, id) => {
  const index = mockBooks.findIndex(book => book.id === id);
  if (index !== -1) {
    mockBooks.splice(index, 1);
    return { success: true };
  }
  return { success: false, error: 'Book not found' };
});