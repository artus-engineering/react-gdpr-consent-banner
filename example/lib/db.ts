import { Pool } from 'pg'

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Initialize database schema
export async function initDatabase() {
    const client = await pool.connect()

    try {
        // Create consent audit logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS consent_audit_logs (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
                action VARCHAR(50) NOT NULL,
                category VARCHAR(50) NOT NULL,
                previous_state JSONB,
                current_state JSONB NOT NULL,
                user_agent TEXT,
                ip_address VARCHAR(45),
                session_id VARCHAR(255),
                website_name VARCHAR(255) NOT NULL,
                domain VARCHAR(255) NOT NULL,
                additional_data JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `)

        // Create indexes for better query performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_consent_audit_user_id ON consent_audit_logs(user_id)
        `)

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_consent_audit_timestamp ON consent_audit_logs(timestamp)
        `)

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_consent_audit_category ON consent_audit_logs(category)
        `)

        console.log('Database schema initialized successfully')
    } catch (error) {
        console.error('Error initializing database schema:', error)
        throw error
    } finally {
        client.release()
    }
}

// Insert consent audit log
export async function insertConsentAuditLog(data: {
    userId: string
    timestamp: string
    action: string
    category: string
    previousState?: Record<string, boolean>
    currentState: Record<string, boolean>
    userAgent: string
    ipAddress?: string
    sessionId?: string
    websiteName: string
    domain: string
    additionalData?: Record<string, any>
}) {
    const client = await pool.connect()

    try {
        const query = `
            INSERT INTO consent_audit_logs (
                user_id, timestamp, action, category, previous_state, 
                current_state, user_agent, ip_address, session_id, 
                website_name, domain, additional_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id
        `

        const values = [
            data.userId,
            data.timestamp,
            data.action,
            data.category,
            data.previousState ? JSON.stringify(data.previousState) : null,
            JSON.stringify(data.currentState),
            data.userAgent,
            data.ipAddress,
            data.sessionId,
            data.websiteName,
            data.domain,
            data.additionalData ? JSON.stringify(data.additionalData) : null
        ]

        const result = await client.query(query, values)
        return result.rows[0].id
    } catch (error) {
        console.error('Error inserting consent audit log:', error)
        throw error
    } finally {
        client.release()
    }
}

// Get consent audit logs for a user
export async function getConsentAuditLogs(userId: string, limit = 100) {
    const client = await pool.connect()

    try {
        const query = `
            SELECT * FROM consent_audit_logs 
            WHERE user_id = $1 
            ORDER BY timestamp DESC 
            LIMIT $2
        `

        const result = await client.query(query, [userId, limit])
        return result.rows
    } catch (error) {
        console.error('Error fetching consent audit logs:', error)
        throw error
    } finally {
        client.release()
    }
}

// Get consent audit logs for a date range
export async function getConsentAuditLogsByDateRange(startDate: string, endDate: string, limit = 1000) {
    const client = await pool.connect()

    try {
        const query = `
            SELECT * FROM consent_audit_logs 
            WHERE timestamp >= $1 AND timestamp <= $2
            ORDER BY timestamp DESC 
            LIMIT $3
        `

        const result = await client.query(query, [startDate, endDate, limit])
        return result.rows
    } catch (error) {
        console.error('Error fetching consent audit logs by date range:', error)
        throw error
    } finally {
        client.release()
    }
}

export default pool
