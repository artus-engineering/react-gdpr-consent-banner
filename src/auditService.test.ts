import { AuditService, createAuditService } from './auditService'
import { AuditConfig, CookieCategory } from './types'

// Mock fetch
global.fetch = jest.fn()

describe('AuditService', () => {
    let auditService: AuditService
    let mockFetch: jest.MockedFunction<typeof fetch>

    beforeEach(() => {
        mockFetch = fetch as jest.MockedFunction<typeof fetch>
        mockFetch.mockClear()

        const config: AuditConfig = {
            url: '/api/gdpr/audit',
            userId: 'test-user-123',
            additionalData: { source: 'test' }
        }

        auditService = new AuditService(config, 'Test Website', 'test.com')
    })

    describe('logConsentChange', () => {
        it('should send audit event to configured endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            } as Response)

            const currentState = {
                Essential: true,
                Functional: false,
                Analytics: true,
                Marketing: false
            }

            await auditService.logConsentChange('accept', 'Analytics', currentState)

            expect(mockFetch).toHaveBeenCalledWith('/api/gdpr/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: expect.stringContaining('"action":"accept"')
            })
        })

        it('should include all required audit data', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            } as Response)

            const currentState = {
                Essential: true,
                Functional: false,
                Analytics: false,
                Marketing: true
            }

            const previousState = {
                Essential: true,
                Functional: false,
                Analytics: true,
                Marketing: false
            }

            await auditService.logConsentChange('change', 'Marketing', currentState, previousState)

            const callArgs = mockFetch.mock.calls[0]
            const body = JSON.parse(callArgs[1]?.body as string)

            expect(body.event).toMatchObject({
                userId: 'test-user-123',
                action: 'change',
                category: 'Marketing',
                currentState,
                previousState,
                userAgent: expect.any(String),
                sessionId: expect.any(String),
                additionalData: { source: 'test' }
            })

            expect(body.websiteName).toBe('Test Website')
            expect(body.domain).toBe('test.com')
        })

        it('should handle fetch errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            const currentState = {
                Essential: true,
                Functional: false,
                Analytics: true,
                Marketing: false
            }

            // Should not throw error
            await expect(auditService.logConsentChange('accept', 'Analytics', currentState)).resolves.toBeUndefined()
        })

        it('should handle non-ok responses gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            } as Response)

            const currentState = {
                Essential: true,
                Functional: false,
                Analytics: true,
                Marketing: false
            }

            // Should not throw error
            await expect(auditService.logConsentChange('accept', 'Analytics', currentState)).resolves.toBeUndefined()
        })
    })

    describe('createAuditService', () => {
        it('should create audit service when config is valid', () => {
            const config: AuditConfig = {
                url: '/api/gdpr/audit',
                userId: 'test-user-123'
            }

            const service = createAuditService(config, 'Test Website', 'test.com')
            expect(service).toBeInstanceOf(AuditService)
        })

        it('should return null when config is undefined', () => {
            const service = createAuditService(undefined, 'Test Website', 'test.com')
            expect(service).toBeNull()
        })

        it('should return null when url is missing', () => {
            const config = {
                userId: 'test-user-123'
            } as AuditConfig

            const service = createAuditService(config, 'Test Website', 'test.com')
            expect(service).toBeNull()
        })

        it('should return null when userId is missing', () => {
            const config = {
                url: '/api/gdpr/audit'
            } as AuditConfig

            const service = createAuditService(config, 'Test Website', 'test.com')
            expect(service).toBeNull()
        })
    })
})
