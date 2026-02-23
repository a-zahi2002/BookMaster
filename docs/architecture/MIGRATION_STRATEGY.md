# Migration Strategy: Multi-Store & Server-Backed Mode

This document outlines the proposed strategy for migrating BookMaster POS from its current single-store, local SQLite, thick-client architecture to a multi-store, centralized server-backed platform.

## Current State
- **Architecture:** Electron thick client
- **Database:** Local SQLite (WAL mode)
- **State Management:** React Context API + IPC calls to Node.js backend
- **Authentication:** Local session-based
- **Backups:** Local files pushed to Google Drive

## Target State
- **Architecture:** Centralized Cloud API (Node.js/Express) + Thin Clients (Electron POS Terminals + React Web Apps)
- **Database:** Managed Cloud PostgreSQL (e.g., AWS RDS, Supabase)
- **Multi-tenant:** Data partitioned by `store_id` (or `organization_id`)
- **Authentication:** Centralized Auth System (e.g., JWT, OAuth2, Auth0, Supabase Auth)
- **Offline Reliability:** Offline-first synchronization using local IndexedDB/PouchDB

## Phased Migration Plan

### Phase 1: API Decoupling
1. **Extract Services:** Move business logic from Electron's `main.js` and `*.service.js` files into a standalone Node.js REST API (or GraphQL).
2. **Local API Gateway:** Temporarily run the local Express server inside the Electron app and have the React frontend communicate via standard HTTP (`axios`/`fetch`) instead of Electron IPC. This proves the decoupling works without changing the deployment model yet.

### Phase 2: Centralized Database & Identity
1. **Schema Updates:** Add `store_id` (foreign key to a new `stores` table) to all relevant entities (books, sales, backups, users).
2. **PostgreSQL Migration:** Migrate the SQLite schema to PostgreSQL. Implement database migrations using tools like Prisma, TypeORM, or knex.js.
3. **Data Import script:** Develop a script to transition the local `database.sqlite` contents into the cloud database under a specific `store_id`.
4. **Auth Switch:** Incorporate robust identity management. Remove local password hashing and migrate users to the centralized authentication provider.

### Phase 3: Cloud Deployment & Thin Client Switch
1. **Cloud Hosting:** Deploy the Node.js API and PostgreSQL database to a cloud provider (AWS, GCP, Vercel, Heroku).
2. **Frontend Update:** Update the `REACT_APP_API_URL` environment variables on the client to point to the remote cloud API instead of the local server.
3. **Strip Electron:** Remove the backend database and services from the Electron wrapper. The Electron app's remaining purpose will primarily be hardware integration (receipt printers, barcode scanners) and auto-updating.

### Phase 4: Multi-Store Features
1. **Admin Panel:** Introduce a Super-Admin layer to manage multiple stores, subscriptions, and global configuration.
2. **Cross-Store Inventory:** Allow managers to check book availability across different branch locations and initiate stock transfers.
3. **Aggregated Reporting:** Develop sales and inventory reports that aggregate data across all stores or compare performance branch-by-branch.

### Phase 5: Offline-First Synchronization
To retain the POS terminal's high reliability even during internet outages (a core requirement for retail):
1. **Local Caching:** Introduce local IndexedDB caching for the catalog and prices.
2. **Offline Transactions:** Queue sales locally when the connection drops.
3. **Sync Engine:** Implement a background synchronization engine to flush queued transactions to the cloud database once connectivity is restored.

---
*This document serves as the roadmap for scaling the BookMaster POS as the business requirements evolve to a franchise or multi-branch model.*
