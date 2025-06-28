# BookMaster POS - Complete Point of Sale System

BookMaster is a comprehensive Point of Sale (POS) system designed for bookstores with both essential business operations and advanced management features.

## 🏪 Core Features

### Point of Sale Operations
- **Fast checkout process** with barcode scanning support
- **Multiple payment methods** (Cash, Card, Mobile payments)
- **Real-time inventory updates** during sales
- **Receipt generation** and transaction logging
- **Cart management** with quantity adjustments

### Inventory Management
- **Book catalog management** with detailed metadata
- **Stock tracking** with real-time updates
- **Low stock alerts** and notifications
- **Search and filtering** by title, author, ISBN, publisher
- **Bulk operations** for efficient management

### User Authentication & Roles
- **Secure login system** with encrypted passwords
- **Role-based access control** (Admin, Manager, Cashier)
- **Automatic dashboard routing** based on user role
- **Session management** with timeout protection

### Basic Reporting
- **Sales analytics** with visual charts
- **Inventory reports** with stock status
- **Daily/weekly/monthly summaries**
- **Export capabilities** (PDF, Excel, CSV)

## 🚀 Advanced Features

### Google Drive Integration
- **Automatic cloud backups** when connected to internet
- **OAuth 2.0 authentication** for secure access
- **Smart backup management** - updates existing files vs creating duplicates
- **Offline backup queue** - uploads automatically when connection restored
- **Role-based backup permissions** (Managers create, Admins delete)

### Enhanced User Management
- **Create and manage users** with granular permissions
- **Comprehensive activity logging** - tracks all user actions with timestamps
- **Password management** - Admins can reset passwords and toggle account status
- **User session monitoring** with login/logout tracking
- **Audit trail** for security and compliance

### Advanced Inventory Features
- **Price change tracking** with historical records
- **Price history preservation** - maintains accurate historical sales data
- **Enhanced stock management** - update quantities without re-registering
- **Detailed metadata tracking** for books
- **Advanced search** with multiple filter criteria

### Analytics & Intelligence
- **Real-time dashboard** with performance metrics
- **Sales trend analysis** with visual charts
- **Top-selling products** identification
- **Revenue vs profit tracking**
- **Inventory health monitoring**

## 👥 Role-Based Access Control

| Feature | Admin | Manager | Cashier |
|---------|-------|---------|---------|
| **Sales Operations** | ✅ | ❌ | ✅ |
| **Inventory Management** | ✅ | ✅ | ❌ |
| **User Management** | ✅ | ❌ | ❌ |
| **Backup Management** | ✅ Full | ✅ Create Only | ❌ |
| **Analytics & Reports** | ✅ | ✅ | ❌ |
| **System Settings** | ✅ | ❌ | ❌ |

## 🛠️ Technical Stack

- **Frontend**: React 18 with modern hooks and context
- **Backend**: Electron with Node.js
- **Database**: SQLite with enhanced schema
- **Authentication**: bcrypt password hashing
- **Cloud Integration**: Google Drive API
- **UI Framework**: Tailwind CSS with custom components
- **Charts**: Custom chart components (no external dependencies)

## 📦 Quick Start

### Installation
```bash
# Clone repository
git clone https://github.com/your-repo/bookmaster-pos.git
cd bookmaster-pos

# Install dependencies
npm install

# Run in development
npm run electron-dev

# Build for production
npm run build && npm run electron
```

### Default Login Credentials
| Username | Password | Role | Dashboard |
|----------|----------|------|-----------|
| `admin` | `admin123` | Admin | Full system access |
| `manager` | `manager123` | Manager | Inventory + analytics |
| `cashier` | `cashier123` | Cashier | POS terminal |

### Optional: Google Drive Setup
1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API
3. Create OAuth 2.0 credentials
4. Add credentials to app settings
5. Connect via admin dashboard

## 🔧 Configuration

### Backup Settings
- **Automatic backups**: Every 6 hours
- **Local storage**: `src/backups/` directory
- **Cloud storage**: Google Drive app folder
- **Network detection**: Auto-upload when online

### Security Features
- **Password encryption**: bcrypt with salt rounds
- **Session management**: Configurable timeout
- **Activity logging**: All user actions tracked
- **Role validation**: Server-side permission checks

## 📊 Key Benefits

### For Small Bookstores
- **Easy to use** POS interface for quick sales
- **Inventory tracking** prevents stockouts
- **Basic reporting** for business insights
- **Affordable** with no monthly fees

### For Growing Businesses
- **User management** for multiple staff members
- **Advanced analytics** for data-driven decisions
- **Cloud backups** for data security
- **Audit trails** for accountability

### For Chain Operations
- **Role-based access** for different staff levels
- **Comprehensive reporting** across locations
- **Centralized user management**
- **Scalable architecture** for growth

## 🚀 Future Roadmap

- **Multi-store support** for chain operations
- **Customer management** with purchase history
- **Supplier integration** for automated ordering
- **Mobile app** for inventory management
- **API integration** for third-party systems

## 📞 Support

For questions or support:
- **Email**: [a.zahi2002@gmail.com]
- **Issues**: Create an issue in the repository
- **Documentation**: Check the wiki for detailed guides

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**BookMaster POS** - From simple sales to advanced business intelligence, all in one powerful system.