import { NextRequest, NextResponse } from 'next/server'
import { insertConsentAuditLog } from '../../../../lib/db'
import { ConsentAuditPayload } from '../../../../../src/types'

export async function POST(request: NextRequest) {
    try {
        // Get user ID from headers (set by middleware)
        const userId = request.headers.get('x-gdpr-user-id')
        const ipAddress = request.headers.get('x-client-ip')
        
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID not found' },
                { status: 400 }
            )
        }
        
        // Parse request body
        const body: ConsentAuditPayload = await request.json()
        
        // Validate required fields
        if (!body.event || !body.websiteName || !body.domain) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }
        
        // Validate event data
        const { event } = body
        if (!event.timestamp || !event.action || !event.category || !event.currentState) {
            return NextResponse.json(
                { error: 'Invalid event data' },
                { status: 400 }
            )
        }
        
        // Insert audit log into database
        const auditLogId = await insertConsentAuditLog({
            userId: event.userId,
            timestamp: event.timestamp,
            action: event.action,
            category: event.category,
            previousState: event.previousState,
            currentState: event.currentState,
            userAgent: event.userAgent,
            ipAddress: ipAddress || undefined,
            sessionId: event.sessionId,
            websiteName: body.websiteName,
            domain: body.domain,
            additionalData: event.additionalData
        })
        
        return NextResponse.json({
            success: true,
            auditLogId,
            message: 'Consent audit event logged successfully'
        })
        
    } catch (error) {
        console.error('Error processing consent audit event:', error)
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: 'Failed to log consent audit event'
            },
            { status: 500 }
        )
    }
}

// GET endpoint to retrieve audit logs (for admin purposes)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        
        // In a real application, you would add authentication/authorization here
        // For this example, we'll allow basic querying
        
        if (!userId && (!startDate || !endDate)) {
            return NextResponse.json(
                { error: 'Either userId or date range (startDate, endDate) is required' },
                { status: 400 }
            )
        }
        
        // Import the function dynamically to avoid circular dependencies
        const { getConsentAuditLogs, getConsentAuditLogsByDateRange } = await import('../../../../lib/db')
        
        let logs
        
        if (userId) {
            const limit = parseInt(searchParams.get('limit') || '100')
            logs = await getConsentAuditLogs(userId, limit)
        } else {
            const limit = parseInt(searchParams.get('limit') || '1000')
            logs = await getConsentAuditLogsByDateRange(startDate!, endDate!, limit)
        }
        
        return NextResponse.json({
            success: true,
            logs,
            count: logs.length
        })
        
    } catch (error) {
        console.error('Error retrieving consent audit logs:', error)
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                message: 'Failed to retrieve consent audit logs'
            },
            { status: 500 }
        )
    }
}
