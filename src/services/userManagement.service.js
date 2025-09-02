const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserManagementService {
  constructor(db) {
    this.db = db;
    this.initializeUserTables();
  }

  async initializeUserTables() {
    try {
      // Users table with enhanced fields
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier')),
          name TEXT NOT NULL,
          email TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME,
          created_by INTEGER,
          FOREIGN KEY(created_by) REFERENCES users(id)
        )
      `);

      // User activity logs table
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          ip_address TEXT,
          user_agent TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        )
      `);

      // Price history table for tracking book price changes
      await this.db.exec(`
        CREATE TABLE IF NOT EXISTS price_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          book_id INTEGER NOT NULL,
          old_price REAL,
          new_price REAL NOT NULL,
          changed_by INTEGER NOT NULL,
          change_reason TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(book_id) REFERENCES books(id),
          FOREIGN KEY(changed_by) REFERENCES users(id)
        )
      `);

      // Create default admin user if not exists
      await this.createDefaultAdmin();
    } catch (error) {
      console.error('Error initializing user tables:', error);
    }
  }

  async createDefaultAdmin() {
    try {
      const existingAdmin = await this.db.get(
        'SELECT id FROM users WHERE role = ? LIMIT 1',
        ['admin']
      );

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.db.run(
          `INSERT INTO users (uuid, username, password, role, name, email) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), 'admin', hashedPassword, 'admin', 'System Administrator', 'admin@bookmaster.com']
        );
        console.log('Default admin user created');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  async createUser(userData, createdBy) {
    try {
      const { username, password, role, name, email } = userData;
      
      // Check if username already exists
      const existingUser = await this.db.get(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userUuid = uuidv4();

      // Insert new user
      const result = await this.db.run(
        `INSERT INTO users (uuid, username, password, role, name, email, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userUuid, username, hashedPassword, role, name, email, createdBy]
      );

      // Log activity
      await this.logActivity(createdBy, 'CREATE_USER', `Created user: ${username} with role: ${role}`);

      return {
        success: true,
        userId: result.lastID,
        uuid: userUuid
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.db.all(`
        SELECT 
          id, uuid, username, role, name, email, is_active, 
          created_at, updated_at, last_login,
          (SELECT name FROM users u2 WHERE u2.id = users.created_by) as created_by_name
        FROM users 
        ORDER BY created_at DESC
      `);

      return users.map(user => ({
        ...user,
        password: undefined // Never return password
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await this.db.get(
        'SELECT id, uuid, username, role, name, email, is_active, created_at, updated_at, last_login FROM users WHERE id = ?',
        [id]
      );
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData, updatedBy) {
    try {
      const { username, role, name, email, is_active } = updateData;
      
      await this.db.run(
        `UPDATE users 
         SET username = ?, role = ?, name = ?, email = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [username, role, name, email, is_active, userId]
      );

      // Log activity
      await this.logActivity(updatedBy, 'UPDATE_USER', `Updated user: ${username}`);

      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async resetPassword(userId, newPassword, resetBy) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await this.db.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedPassword, userId]
      );

      const user = await this.getUserById(userId);
      await this.logActivity(resetBy, 'RESET_PASSWORD', `Reset password for user: ${user.username}`);

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async toggleUserStatus(userId, toggledBy) {
    try {
      const user = await this.getUserById(userId);
      const newStatus = !user.is_active;
      
      await this.db.run(
        'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, userId]
      );

      await this.logActivity(
        toggledBy, 
        'TOGGLE_USER_STATUS', 
        `${newStatus ? 'Activated' : 'Deactivated'} user: ${user.username}`
      );

      return { success: true, newStatus };
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  async authenticateUser(username, password) {
    try {
      const user = await this.db.get(
        'SELECT id, uuid, username, password, role, name, email, is_active FROM users WHERE username = ?',
        [username]
      );

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.is_active) {
        throw new Error('Account is disabled');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      // Update last login
      await this.db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Log login activity
      await this.logActivity(user.id, 'LOGIN', 'User logged in');

      return {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async logActivity(userId, action, details = null, metadata = {}) {
    try {
      await this.db.run(
        `INSERT INTO user_activity_logs (user_id, action, details, ip_address, user_agent) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, action, details, metadata.ip_address || null, metadata.user_agent || null]
      );
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getUserActivityLogs(userId = null, limit = 100) {
    try {
      let query = `
        SELECT 
          ual.*, 
          u.username, 
          u.name as user_name
        FROM user_activity_logs ual
        JOIN users u ON ual.user_id = u.id
      `;
      let params = [];

      if (userId) {
        query += ' WHERE ual.user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY ual.timestamp DESC LIMIT ?';
      params.push(limit);

      const logs = await this.db.all(query, params);
      return logs;
    } catch (error) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  }

  async trackPriceChange(bookId, oldPrice, newPrice, changedBy, reason = null) {
    try {
      await this.db.run(
        `INSERT INTO price_history (book_id, old_price, new_price, changed_by, change_reason) 
         VALUES (?, ?, ?, ?, ?)`,
        [bookId, oldPrice, newPrice, changedBy, reason]
      );

      await this.logActivity(changedBy, 'PRICE_CHANGE', `Changed price for book ID ${bookId} from ${oldPrice} to ${newPrice}`);
    } catch (error) {
      console.error('Error tracking price change:', error);
      throw error;
    }
  }

  async getPriceHistory(bookId) {
    try {
      const history = await this.db.all(`
        SELECT 
          ph.*, 
          u.username as changed_by_username,
          u.name as changed_by_name,
          b.title as book_title
        FROM price_history ph
        JOIN users u ON ph.changed_by = u.id
        JOIN books b ON ph.book_id = b.id
        WHERE ph.book_id = ?
        ORDER BY ph.timestamp DESC
      `, [bookId]);

      return history;
    } catch (error) {
      console.error('Error getting price history:', error);
      throw error;
    }
  }
}

module.exports = UserManagementService;