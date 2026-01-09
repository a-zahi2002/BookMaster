
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock Lucide icons to avoid rendering issues
jest.mock('lucide-react', () => ({
    Menu: () => <span>MenuIcon</span>,
    X: () => <span>XIcon</span>,
    CheckCircle: () => <span>CheckIcon</span>,
    Plus: () => <span>PlusIcon</span>,
    Search: () => <span>SearchIcon</span>,
    Edit: () => <span>EditIcon</span>,
    Trash2: () => <span>TrashIcon</span>,
    Package: () => <span>PackageIcon</span>,
    PackagePlus: () => <span>PackagePlusIcon</span>,
    History: () => <span>HistoryIcon</span>,
    DollarSign: () => <span>DollarIcon</span>,
    LogOut: () => <span>LogoutIcon</span>,
    Settings: () => <span>SettingsIcon</span>,
    User: () => <span>UserIcon</span>,
    Moon: () => <span>MoonIcon</span>,
    Sun: () => <span>SunIcon</span>,
    Cloud: () => <span>CloudIcon</span>,
    BarChart3: () => <span>ChartIcon</span>,
    BrainCircuit: () => <span>BrainIcon</span>,
    FileText: () => <span>FileIcon</span>,
}));

// Mock Recharts (Analytics usually uses it and it breaks in JSDOM often)
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: () => <div>Line Chart</div>,
    BarChart: () => <div>Bar Chart</div>,
    PieChart: () => <div>Pie Chart</div>,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Line: () => null,
    Bar: () => null,
    Pie: () => null,
    Cell: () => null,
}));

// Mock specific components that might cause issues or are not focus of this test
jest.mock('../components/AI/AIInsightsPanel', () => () => <div>AI Insights Panel</div>);

describe('App Integration Test', () => {
    test('User can login and view dashboard', async () => {
        render(<App />);

        // 1. Check if we are on Login Screen
        // Login screen usually has "Sign in to BookMaster" or similar
        // Assuming Login component structure based on context
        const loginHeading = await screen.findByRole('heading', { level: 2 });
        // Adjust expectation based on actual Login.js text. 
        // If we don't know, we look for username/password inputs
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();

        // 2. Perform Login
        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'admin123' } });

        const loginButton = screen.getByRole('button', { name: /sign in|login/i });
        fireEvent.click(loginButton);

        // 3. Verify Dashboard Load
        // Dashboard (AdminDashboard) has "System Overview"
        await waitFor(() => {
            expect(screen.getByText(/System Overview/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // 4. Verification
        expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });

    test('Navigate to Inventory and see mock books', async () => {
        render(<App />);

        // Login again (state is fresh per test)
        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'admin123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in|login/i }));

        await waitFor(() => expect(screen.getByText(/System Overview/i)).toBeInTheDocument());

        // Select "Inventory Management" from sidebar
        // Sidebar items have text "Inventory Management"
        const inventoryLink = screen.getByText('Inventory Management');
        fireEvent.click(inventoryLink);

        // Check for Inventory Header
        await waitFor(() => {
            expect(screen.getByText('Enhanced Inventory Management')).toBeInTheDocument();
        });

        // Check for Mock Books (The Great Gatsby is in BookContext mock)
        expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
    });
});
