# Next.js GDPR Cookie Consent Audit Example

This example demonstrates how to implement GDPR-compliant cookie consent with audit trail functionality using Next.js.

## Features

- GDPR-compliant cookie consent banner
- Audit trail for all consent changes
- User ID generation via middleware (strictly necessary)
- PostgreSQL storage for audit logs
- Scalable consent tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database and update the connection string in `lib/db.ts`

3. Run the development server:
```bash
npm run dev
```

## Implementation Details

### Middleware (`middleware.ts`)
- Generates unique user IDs for tracking
- Sets user ID cookie (strictly necessary, no consent required)
- Handles IP address extraction

### API Endpoint (`app/api/gdpr/audit/route.ts`)
- Receives consent audit events
- Stores data in PostgreSQL
- Handles validation and error responses

### Database Schema
- `consent_audit_logs` table for storing audit events
- Includes user ID, timestamp, consent state, and metadata

### Component Integration
- Audit configuration in cookie consent setup
- Automatic logging of all consent changes
- Session tracking for user journey analysis

## GDPR Compliance

- **Strictly Necessary**: User ID generation for audit trail
- **Consent Categories**: Analytics and Marketing
- **Audit Trail**: Complete record of consent changes
- **Data Minimization**: Only essential data collected
- **Transparency**: Clear consent options and audit logs
