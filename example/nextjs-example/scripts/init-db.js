const { Pool } = require('pg')
require('dotenv').config()

async function initDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })

    const client = await pool.connect()
    
    try {
        console.log('Initializing database schema...')
        
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
        
        console.log('✅ Database schema initialized successfully!')
        console.log('📊 Table: consent_audit_logs')
        console.log('🔍 Indexes: user_id, timestamp, category')
        
    } catch (error) {
        console.error('❌ Error initializing database schema:', error)
        process.exit(1)
    } finally {
        client.release()
        await pool.end()
    }
}

// Run the initialization
initDatabase()
