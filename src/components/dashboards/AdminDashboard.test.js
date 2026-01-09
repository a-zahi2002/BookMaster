
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Ensure jest-dom matchers are available
import AdminDashboard from './AdminDashboard';

// Mock contexts
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { name: 'Test Admin', role: 'admin' },
        logout: jest.fn(),
    }),
}));

jest.mock('../../contexts/BookContext', () => ({
    useBooks: () => ({
        books: [],
        getBooks: jest.fn(),
    }),
}));

jest.mock('../../contexts/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: jest.fn(),
    }),
}));

// Mock child components to isolate AdminDashboard testing
jest.mock('../common/Sidebar', () => ({ items, onSectionChange }) => (
    <div data-testid="sidebar">
        {items.map(item => (
            <button key={item.id} onClick={() => onSectionChange(item.id)}>
                {item.label}
            </button>
        ))}
    </div>
));
jest.mock('../EnhancedInventory', () => () => <div data-testid="enhanced-inventory">Inventory Component</div>);
jest.mock('../UserManagement', () => () => <div data-testid="user-management">User Management Component</div>);
jest.mock('../BackupManagement', () => () => <div data-testid="backup-management">Backup Component</div>);
jest.mock('../Analytics/AnalyticsDashboard', () => () => <div data-testid="analytics-dashboard">Analytics Component</div>);
jest.mock('../Analytics/ReportsView', () => () => <div data-testid="reports-view">Reports Component</div>);
jest.mock('../AI/AIInsightsPanel', () => () => <div data-testid="ai-insights">AI Component</div>);
jest.mock('lucide-react', () => ({
    Menu: () => <span>Menu</span>,
    X: () => <span>X</span>,
    CheckCircle: () => <span>Check</span>,
}));

// Mock Electron API
beforeAll(() => {
    window.electronAPI = {
        getBackupHistory: jest.fn().mockResolvedValue([
            { created_at: new Date().toISOString() }
        ]),
        createManualBackup: jest.fn().mockResolvedValue({ success: true }),
        getDetailedSalesReport: jest.fn().mockResolvedValue([]),
        optimizeDb: jest.fn().mockResolvedValue({ success: true }),
    };
});

describe('AdminDashboard Component', () => {
    test('renders dashboard with system overview by default', async () => {
        render(<AdminDashboard />);

        // Check header
        expect(screen.getByText(/System Overview/i)).toBeInTheDocument();

        // Check welcome message
        expect(screen.getByText(/Welcome back, Test Admin/i)).toBeInTheDocument();

        // Check system stats (mocked data presence)
        expect(screen.getByText(/System Status/i)).toBeInTheDocument();
        expect(screen.getByText(/Database/i)).toBeInTheDocument();
    });

    test('navigates to Inventory section', () => {
        render(<AdminDashboard />);

        // Simulate clicking Inventory in Sidebar
        const inventoryButton = screen.getByText('Inventory Management');
        fireEvent.click(inventoryButton);

        // Check if EnhancedInventory component is rendered
        expect(screen.getByTestId('enhanced-inventory')).toBeInTheDocument();
        expect(screen.queryByText('System Overview')).not.toBeInTheDocument();
    });

    test('navigates to Analytics section', () => {
        render(<AdminDashboard />);

        const analyticsButton = screen.getByText('Analytics');
        fireEvent.click(analyticsButton);

        expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    });

    test('toggles notifications panel', () => {
        render(<AdminDashboard />);

        // Find notification bell (looking for the accessible name or icon content if accessible)
        // In our component code: <button ...><span className="text-xl">🔔</span>...</button>
        // We can find by text "🔔"
        const bellButton = screen.getByText('🔔');
        fireEvent.click(bellButton);

        // Check if dropdown appears
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    test('calls Electron API for system maintenance', async () => {
        render(<AdminDashboard />);

        // Navigate to Settings
        fireEvent.click(screen.getByText('Settings'));

        // Find System Maintenance button and click
        const maintenanceButton = screen.getByText('System Maintenance');
        fireEvent.click(maintenanceButton);

        await waitFor(() => {
            expect(window.electronAPI.optimizeDb).toHaveBeenCalled();
        });
    });
});
