
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedInventory from './EnhancedInventory';

// Mock contexts
jest.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({
        user: { role: 'admin' },
    }),
}));

const mockDeleteBook = jest.fn();
const mockBooks = [
    { id: 1, title: 'Book One', author: 'Author A', isbn: '111', stock_quantity: 5, price: 100 },
    { id: 2, title: 'Book Two', author: 'Author B', isbn: '222', stock_quantity: 15, price: 200 },
];

jest.mock('../contexts/BookContext', () => ({
    useBooks: () => ({
        books: mockBooks,
        deleteBook: mockDeleteBook,
    }),
}));

// Mock Modals
jest.mock('./modals/RegisterBookModal', () => () => <div data-testid="register-modal">Register Modal</div>);
jest.mock('./modals/RestockModal', () => () => <div data-testid="restock-modal">Restock Modal</div>);
jest.mock('./modals/EditBookModal', () => () => <div data-testid="edit-modal">Edit Modal</div>);

// Mock Electron API
beforeAll(() => {
    window.electronAPI = {
        getPriceHistory: jest.fn().mockResolvedValue([]),
    };
    // Mock window.confirm
    window.confirm = jest.fn().mockReturnValue(true);
});

describe('EnhancedInventory Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders book list correctly', () => {
        render(<EnhancedInventory />);
        expect(screen.getByText('Book One')).toBeInTheDocument();
        expect(screen.getByText('Book Two')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument(); // Stock
    });

    test('filters books by search term', () => {
        render(<EnhancedInventory />);
        const searchInput = screen.getByPlaceholderText(/Search books/i);

        fireEvent.change(searchInput, { target: { value: 'Book One' } });

        expect(screen.getByText('Book One')).toBeInTheDocument();
        expect(screen.queryByText('Book Two')).not.toBeInTheDocument();
    });

    test('opens register modal on button click', () => {
        render(<EnhancedInventory />);
        const registerButton = screen.getByText('Register New Book');
        fireEvent.click(registerButton);
        expect(screen.getByTestId('register-modal')).toBeInTheDocument();
    });

    test('calls deleteBook when delete button is clicked and confirmed', async () => {
        render(<EnhancedInventory />);
        // Find delete button for first book. 
        // The component has multiple delete buttons. We grab all buttons with title "Delete Book"
        const deleteButtons = screen.getAllByTitle('Delete Book');
        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
        await waitFor(() => {
            expect(mockDeleteBook).toHaveBeenCalledWith(1);
        });
    });
});
