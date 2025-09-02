const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class AuthService {
    constructor() {
        // Predefined users with roles
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            },
            {
                id: 2,
                username: 'manager',
                password: 'manager123',
                role: 'manager'
            },
            {
                id: 3,
                username: 'user',
                password: 'user123',
                role: 'user'
            }
        ];
    }

    async login(username, password) {
        try {
            const user = this.users.find(u => 
                u.username === username && 
                u.password === password
            );
            
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Return user data without password
            const { password: _, ...userData } = user;
            return userData;
        } catch (error) {
            throw error;
        }
    }

    async checkPermission(userId, action) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('User not found');
            }

            return user.permissions.includes('all') || user.permissions.includes(action);
        } catch (error) {
            logger.error('Permission check failed:', error);
            throw error;
        }
    }

    async getUserRole(userId) {
        const user = this.users.find(u => u.id === userId);
        return user ? user.role : null;
    }

    async getAllUsers() {
        // Return users without passwords
        return this.users.map(({ password, ...user }) => user);
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== oldPassword) {
            throw new Error('Invalid current password');
        }

        user.password = newPassword;
        return true;
    }
}

module.exports = AuthService;