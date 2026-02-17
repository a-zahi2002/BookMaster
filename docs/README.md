# BookMaster POS System - Documentation

Welcome to the BookMaster Point of Sale (POS) System documentation. This comprehensive guide covers all aspects of the system from setup to deployment.

## Documentation Overview

### 📚 Quick Start
- [Setup & Installation Guide](./guides/SETUP.md) - Get BookMaster running locally
- [Development Guide](./guides/DEVELOPMENT.md) - Start developing features

### 🏗️ System Design
- [Architecture Overview](./architecture/ARCHITECTURE.md) - System design and component structure
- [Database Schema](./architecture/DATABASE.md) - Database tables and relationships
- [Project Structure](./architecture/PROJECT_STRUCTURE.md) - Directory layout and organization

### 🔌 API & Integration
- [Backend API Documentation](./api/BACKEND_API.md) - Available endpoints and services
- [Frontend Components](./api/COMPONENTS.md) - React component reference

### 🚀 Deployment & Operations
- [Deployment Guide](./guides/DEPLOYMENT.md) - Production build and deployment
- [Environment Configuration](./guides/ENVIRONMENT.md) - Configuration and environment variables
- [Troubleshooting](./guides/TROUBLESHOOTING.md) - Common issues and solutions

### 📋 Contributing & Maintenance
- [Contributing Guidelines](./guides/CONTRIBUTING.md) - How to contribute to the project
- [Testing Guide](./guides/TESTING.md) - Running and writing tests
- [Database Migrations](./guides/DATABASE_MIGRATIONS.md) - Managing database schema changes

## Key Features

- **Multi-user Role Management** - Admin, Manager, Cashier roles with specific permissions
- **Inventory Management** - Real-time stock tracking and management
- **Sales & Analytics** - Comprehensive reporting and business insights
- **POS Terminal** - Fast checkout and transaction processing
- **Backup & Recovery** - Automated database backups
- **Print Integration** - Receipt and report printing
- **AI Insights** - Smart analytics and forecasting (beta)

## Project Stack

- **Frontend**: React.js with Tailwind CSS
- **Desktop**: Electron for cross-platform desktop app
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Build**: webpack (via react-scripts)
- **Package Manager**: npm

## Quick Links

| Document | Purpose |
|----------|---------|
| [SETUP.md](./guides/SETUP.md) | Local development environment setup |
| [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) | System design patterns |
| [DATABASE.md](./architecture/DATABASE.md) | Database schema reference |
| [DEPLOYMENT.md](./guides/DEPLOYMENT.md) | Production deployment steps |
| [TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md) | Common problems & solutions |

## System Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **OS**: Windows, macOS, or Linux
- **RAM**: Minimum 4GB
- **Storage**: 500MB available space

## Getting Help

- Check [TROUBLESHOOTING.md](./guides/TROUBLESHOOTING.md) for common issues
- Review existing code in the `src/` directory
- Check the main [README.md](../README.md) in the project root

## Document Maintenance

These documents are maintained alongside the codebase. When making changes:
1. Update relevant documentation
2. Keep examples and code snippets current
3. Update version numbers and dates as needed

---

**Last Updated**: February 17, 2026  
**Version**: 1.0.0
