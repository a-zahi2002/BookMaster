const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    show: false // Don't show until ready
  });

  if (isDev) {
    // In development, load from React dev server
    mainWindow.loadURL('http://localhost:3000')
      .then(() => {
        console.log('Successfully loaded React app');
        mainWindow.show();
        mainWindow.webContents.openDevTools();
      })
      .catch((err) => {
        console.error('Failed to load React app:', err);
        // Fallback to built version if dev server is not available
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'))
          .then(() => {
            console.log('Loaded from build directory');
            mainWindow.show();
          })
          .catch((fallbackErr) => {
            console.error('Failed to load from build directory:', fallbackErr);
            mainWindow.show();
            mainWindow.loadURL('data:text/html,<h1>React app not available</h1><p>Please start the React development server with: npm start</p>');
          });
      });
  } else {
    // In production, load from build directory
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'))
      .then(() => {
        console.log('Successfully loaded production build');
        mainWindow.show();
      })
      .catch((err) => {
        console.error('Failed to load production build:', err);
        mainWindow.show();
      });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window ready
  mainWindow.once('ready-to-show', () => {
    console.log('Electron window is ready to show');
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