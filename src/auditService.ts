import { isServer } from './functions'
import { AuditConfig, ConsentAuditEvent, ConsentAuditPayload, CookieCategory } from './types'

/**
 * GDPR Audit Service for tracking consent changes
 */
export class AuditService {
    private config: AuditConfig
    private websiteName: string
    private domain: string

    constructor(config: AuditConfig, websiteName: string, domain: string) {
        this.config = config
        this.websiteName = websiteName
        this.domain = domain
    }

    /**
     * Log a consent change event
     */
    async logConsentChange(
        action: 'accept' | 'reject' | 'change',
        category: CookieCategory,
        currentState: Record<CookieCategory, boolean>,
        previousState?: Record<CookieCategory, boolean>
    ): Promise<void> {
        if (isServer()) {
            return // Don't log on server side
        }

        try {
            const event: ConsentAuditEvent = {
                userId: this.config.userId,
                timestamp: new Date().toISOString(),
                action,
                category,
                previousState,
                currentState,
                userAgent: navigator.userAgent,
                sessionId: this.getSessionId(),
                additionalData: this.config.additionalData
            }

            const payload: ConsentAuditPayload = {
                event,
                websiteName: this.websiteName,
                domain: this.domain
            }

            await this.sendAuditEvent(payload)
        } catch (error) {
            // Silently fail in production to not break user experience
            console.warn('Failed to log consent audit event:', error)
        }
    }

    /**
     * Send audit event to the configured endpoint
     */
    private async sendAuditEvent(payload: ConsentAuditPayload): Promise<void> {
        const response = await fetch(this.config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`Audit endpoint returned ${response.status}: ${response.statusText}`)
        }
    }

    /**
     * Get or create a session ID for tracking
     */
    private getSessionId(): string {
        const sessionKey = 'gdpr_audit_session_id'
        let sessionId = sessionStorage.getItem(sessionKey)

        if (!sessionId) {
            sessionId = this.generateSessionId()
            sessionStorage.setItem(sessionKey, sessionId)
        }

        return sessionId
    }

    /**
     * Generate a unique session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    }
}

/**
 * Create an audit service instance if audit is configured
 */
export function createAuditService(auditConfig: AuditConfig | undefined, websiteName: string, domain: string): AuditService | null {
    if (!auditConfig || !auditConfig.url || !auditConfig.userId) {
        return null
    }

    return new AuditService(auditConfig, websiteName, domain)
}
