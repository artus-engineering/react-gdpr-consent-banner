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
            <Dialog open={openModal} onClose={() => setOpenModal(false)} className="ngcc-tw-relative ngcc-tw-z-50">
                <DialogBackdrop className="ngcc-tw-fixed ngcc-tw-inset-0 ngcc-tw-bg-black/30" />
                <div className="ngcc-tw-fixed ngcc-tw-inset-0 ngcc-tw-flex ngcc-tw-w-screen ngcc-tw-items-center ngcc-tw-justify-center">
                    <DialogPanel className="ngcc-tw-max-w-5xl ngcc-tw-mx-auto ngcc-tw-my-auto ngcc-tw-overflow-scroll ngcc-tw-max-h-[80vh] ngcc-tw-relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            onClick={() => setOpenModal(false)}
                            style={{ color: style.textPrimary }}
                            className={'ngcc-tw-absolute ngcc-tw-h-6 ngcc-tw-w-6 ngcc-tw-top-3 ngcc-tw-right-3 '}
                        >
                            <title>Close Icon</title>
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                        <div style={{ backgroundColor: style.bgPrimary, borderColor: style.bgSecondary }} className="ngcc-tw-p-12 ngcc-tw-rounded-lg ngcc-tw-border">
                            <h2 style={{ color: style.textPrimary }} className="ngcc-tw-text-xl ngcc-tw-font-semibold ngcc-tw-mb-4">
                                {getLabel('headings', 'consentGate')}
                            </h2>
                            <p style={{ color: style.textSecondary }} className="ngcc-tw-mb-12">
                                {getLabel('consentGate', 'message')} <b>{cookieProvider.name}.</b>
                            </p>
                            <div style={{ backgroundColor: hexToRGBA(style.bgSecondary, 0.2) }} className="ngcc-tw-mb-12 ngcc-tw-p-8 ngcc-tw-rounded-lg">
                                <CookieCategoryComponent provider={cookieProvider} handleCookieToggle={() => setIsEnabled(!isEnabled)} isEnabled={isEnabled} />
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

    return (
        <>
            <Modal />
            <div onClick={onClick} className={isEnabled ? undefined : 'ngcc-tw-opacity-50'}>
                {children}
            </div>
        </>
    )
}
