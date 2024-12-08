const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class UserService {
    constructor(db) {
        this.db = db;
    }

    async createUser({ username, password, role }) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                this.db.run(
                    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                    [username, hashedPassword, role],
                    function(err) {
                        if (err) reject(err);
                        resolve({ id: this.lastID, username, role });
                    }
                );
            } catch (error) {
                logger.error('Error creating user:', error);
                reject(error);
            }
        });
    }

    async updateUser(userId, userData) {
        return new Promise(async (resolve, reject) => {
            try {
                const updates = [];
                const values = [];
                
                if (userData.password) {
                    userData.password = await bcrypt.hash(userData.password, 10);
                }

                Object.keys(userData).forEach(key => {
                    updates.push(`${key} = ?`);
                    values.push(userData[key]);
                });

                values.push(userId);

                this.db.run(
                    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                    values,
                    function(err) {
                        if (err) reject(err);
                        resolve({ id: userId, ...userData });
                    }
                );
            } catch (error) {
                logger.error('Error updating user:', error);
                reject(error);
            }
        });
    }

    async checkPermission(userId, action) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT role FROM users WHERE id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    if (!row) reject(new Error('User not found'));

                    const permissions = {
                        admin: ['all'],
                        manager: ['modify_inventory', 'view_reports', 'process_sales'],
                        user: ['process_sales', 'view_inventory']
                    };

                    const hasPermission = permissions[row.role].includes(action) || 
                                        permissions[row.role].includes('all');
                    resolve(hasPermission);
                }
            );
        });
    }
}

module.exports = UserService; 