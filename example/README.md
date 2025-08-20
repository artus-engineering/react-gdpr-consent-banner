# GDPR Cookie Consent Example

This directory contains a complete example of the GDPR Cookie Consent library implemented in a Next.js application.

## Features Demonstrated

- **GDPR-compliant cookie consent banner**
- **Audit trail for all consent changes**
- **User ID generation via middleware (strictly necessary)**
- **PostgreSQL storage for audit logs**
- **Scalable consent tracking**

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database:
   ```bash
   npm run db:init
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

1. Open browser developer tools
2. Go to Network tab
3. Interact with the cookie consent banner
4. Watch for POST requests to `/api/gdpr/audit`
5. Check the database for audit logs

## GDPR Compliance

- **Strictly Necessary**: User ID generation for audit trail
- **Consent Categories**: Analytics and Marketing
- **Audit Trail**: Complete record of consent changes
- **Data Minimization**: Only essential data collected
- **Transparency**: Clear consent options and audit logs
