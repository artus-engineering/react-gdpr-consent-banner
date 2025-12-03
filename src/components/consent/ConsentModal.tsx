import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import React from 'react'
import { getLabel, hexToRGBA, persistCookieSelection } from '../../functions'
import { useConfig, useCookieState, useStyle } from '../../hooks'
import { CookieProviderConfig } from '../../types'
import { CookieCategoryComponent } from '../cookies'
import { Button } from '../general'

interface IConsentModalProps {
    cookieProvider: CookieProviderConfig
    children: React.ReactNode
}

export function CookieConsentModal({ cookieProvider, children }: IConsentModalProps): JSX.Element {
    const style = useStyle()
    const config = useConfig()
    const { isEnabled, setIsEnabled } = useCookieState({ cookieProvider })
    const [openModal, setOpenModal] = React.useState(false)

    function handleAccept() {
        persistCookieSelection(cookieProvider, isEnabled, config.domain, config.cookiesValidForDays)
        setOpenModal(false)
    }

    function Modal() {
        return (
            <Dialog open={openModal} onClose={() => setOpenModal(false)} className="relative z-50">
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 flex w-screen items-center justify-center">
                    <DialogPanel className="max-w-5xl mx-auto my-auto overflow-scroll max-h-[80vh] relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            onClick={() => setOpenModal(false)}
                            style={{ color: style.textPrimary }}
                            className={'absolute h-6 w-6 top-3 right-3 '}
                        >
                            <title>Close Icon</title>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        <div
                            style={{ backgroundColor: style.bgPrimary, borderColor: style.bgSecondary }}
                            className="p-12 rounded-lg border"
                        >
                            <h2 style={{ color: style.textPrimary }} className="text-xl font-semibold mb-4">
                                {getLabel('headings', 'consentGate', config)}
                            </h2>
                            <p style={{ color: style.textSecondary }} className="mb-12">
                                {getLabel('consentGate', 'message', config)} <b>{cookieProvider.name}.</b>
                            </p>
                            <div
                                style={{ backgroundColor: hexToRGBA(style.bgSecondary, 0.2) }}
                                className="mb-12 p-8 rounded-lg"
                            >
                                <CookieCategoryComponent
                                    provider={cookieProvider}
                                    handleCookieToggle={() => setIsEnabled(!isEnabled)}
                                    isEnabled={isEnabled}
                                />
                            </div>
                            <Button onClick={handleAccept} disabled={!isEnabled} text={'acceptSelectedCookies'} />
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        )
    }

    function onClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
        if (!isEnabled) {
            event.stopPropagation()
            setOpenModal(true)
            return
        }
        return undefined
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (!isEnabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            event.stopPropagation()
            setOpenModal(true)
        }
    }

    return (
        <>
            <Modal />
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={onKeyDown}
                className={isEnabled ? undefined : 'opacity-50'}
            >
                {children}
            </div>
        </>
    )
}
