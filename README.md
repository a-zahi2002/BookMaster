# BookMaster POS - Advanced Features

BookMaster is a comprehensive Point of Sale (POS) system designed for bookstores with advanced features including user management, Google Drive integration, and enhanced inventory tracking.

## 🚀 New Advanced Features

### 1. Google Drive Integration for Automatic Backups
- **Automatic cloud backups** when connected to the internet
- **OAuth integration** with Google Drive
- **Smart backup management** - updates existing files instead of creating duplicates
- **Offline backup queue** - automatically uploads when connection is restored
- **Role-based permissions** - Managers can create backups, only Admins can delete

### 2. Enhanced User Management System
- **Create and manage users** with different roles (Admin, Manager, Cashier)
- **Role-based dashboard routing** - users automatically redirected to appropriate dashboard
- **User activity logging** - tracks all user actions with timestamps
- **Password management** - Admins can reset passwords and enable/disable accounts
- **Comprehensive audit trail** for security and compliance

### 3. Advanced Inventory Management
- **Enhanced book registration** with detailed metadata tracking
- **Stock quantity updates** without re-registering books
- **Price change tracking** with historical records
- **Price history preservation** - maintains pricing data for historical sales accuracy
- **Low stock alerts** with visual indicators
- **Bulk operations** and advanced filtering

### 4. Role-Based Access Control

| Feature | Admin | Manager | Cashier |
|---------|-------|---------|---------|
| User Management | ✅ Full Access | ❌ | ❌ |
| Inventory Management | ✅ Full Access | ✅ Full Access | ❌ |
| Backup Management | ✅ Full Access | ✅ Create Only | ❌ |
| Sales Operations | ✅ | ❌ | ✅ |
| Analytics & Reports | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ |

## 🛠️ Technical Implementation

### Database Schema Enhancements
- **Enhanced Users Table** with roles, activity tracking, and account status
- **User Activity Logs** for comprehensive audit trails
- **Price History Table** for tracking all price changes
- **Improved Books Table** with timestamps and metadata

### Google Drive Integration
- **OAuth 2.0 authentication** for secure access
- **Automatic token refresh** for seamless operation
- **Intelligent backup scheduling** with network detection
- **Conflict resolution** for backup file management

### Security Features
- **bcrypt password hashing** for secure authentication
- **Role-based route protection** in React components
- **Activity logging** for all sensitive operations
- **Session management** with automatic logout

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- SQLite3
- Google Drive API credentials (for cloud backup)

### Installation Steps

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-repo/bookmaster-pos.git
   cd bookmaster-pos
   npm install
   ```

2. **Google Drive Setup (Optional)**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Drive API
   - Create OAuth 2.0 credentials
   - Copy `src/config/google-credentials.example.json` to `src/config/google-credentials.json`
   - Add your credentials to the file

3. **Environment Variables**
   ```bash
   # Create .env file
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

4. **Run the Application**
   ```bash
   # Development mode
   npm run electron-dev
   
   # Production build
   npm run build
   npm run electron
   ```

## 👥 Default User Accounts

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| admin | admin123 | Admin | Full System Access |
| manager | manager123 | Manager | Inventory + Reports |
| cashier | cashier123 | Cashier | Sales Only |

## 🔧 Configuration

### Backup Settings
- **Automatic backups** run every 6 hours
- **Local backups** stored in `src/backups/` directory
- **Cloud backups** stored in Google Drive app folder
- **Retention policy** configurable per user role

### User Management
- **Password complexity** can be configured
- **Session timeout** adjustable in settings
- **Activity log retention** customizable
- **Role permissions** easily modifiable

## 📊 Features Overview

### Enhanced Inventory
- Real-time stock tracking
- Price history with change reasons
- Low stock alerts and notifications
- Bulk import/export capabilities
- Advanced search and filtering

### User Activity Monitoring
- Login/logout tracking
- Inventory changes
- Price modifications
- Backup operations
- System configuration changes

### Backup & Recovery
- Automated cloud synchronization
- Manual backup creation
- Point-in-time recovery
- Cross-platform compatibility
- Encrypted data transmission

## 🚀 Future Enhancements

- **Multi-store support** for chain operations
- **Advanced reporting** with custom date ranges
- **Integration APIs** for third-party systems
- **Mobile app companion** for inventory management
- **Barcode scanning** for faster operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or support, please contact [a.zahi2002@gmail.com] or create an issue in the repository.

---

**BookMaster POS** - Empowering bookstores with modern technology and comprehensive management tools.