import React, { useEffect, useRef } from 'react'
import { getLabel, hexToRGBA, persistCookieSelection } from '../../functions'
import { useConfig, useCookieState, useStyle } from '../../hooks'
import {
    CookieConsentBannerConfigWithDefaults,
    CookieConsentStyleWithDefaults,
    CookieProviderConfig
} from '../../types'
import { CookieCategoryComponent } from '../cookies'
import { Button } from '../general'

interface IConsentModalProps {
    cookieProvider: CookieProviderConfig
    children: React.ReactNode
}

interface ModalProps {
    openModal: boolean
    setOpenModal: (open: boolean) => void
    style: CookieConsentStyleWithDefaults
    config: CookieConsentBannerConfigWithDefaults
    cookieProvider: CookieProviderConfig
    isEnabled: boolean
    setIsEnabled: (enabled: boolean) => void
    handleAccept: () => void
}

function Modal({
    openModal,
    setOpenModal,
    style,
    config,
    cookieProvider,
    isEnabled,
    setIsEnabled,
    handleAccept
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (openModal) {
            dialog.showModal()
        } else {
            dialog.close()
        }
    }, [openModal])

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        const handleClose = () => setOpenModal(false)
        dialog.addEventListener('close', handleClose)
        return () => dialog.removeEventListener('close', handleClose)
    }, [setOpenModal])

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) {
            setOpenModal(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
        if (e.key === 'Escape' && e.target === dialogRef.current) {
            setOpenModal(false)
        }
    }

    return (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: native dialog handles backdrop click and Escape
        <dialog
            ref={dialogRef}
            className="relative z-50 max-w-5xl mx-auto my-auto overflow-scroll max-h-[80vh] bg-transparent backdrop:bg-black/30 p-0 open:flex"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
        >
            <div className="relative">
                {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative close control */}
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: paired with dialog Escape handling */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    onClick={() => setOpenModal(false)}
                    style={{ color: style.textPrimary }}
                    className="absolute h-6 w-6 top-3 right-3 cursor-pointer"
                >
                    <title>Close Icon</title>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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
            </div>
        </dialog>
    )
}

export function CookieConsentModal({ cookieProvider, children }: IConsentModalProps): React.ReactElement {
    const style = useStyle()
    const config = useConfig()
    const { isEnabled, setIsEnabled } = useCookieState({ cookieProvider })
    const [openModal, setOpenModal] = React.useState(false)

    function handleAccept() {
        persistCookieSelection(cookieProvider, isEnabled, config.domain, config.cookiesValidForDays)
        setOpenModal(false)
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
            <Modal
                openModal={openModal}
                setOpenModal={setOpenModal}
                style={style}
                config={config}
                cookieProvider={cookieProvider}
                isEnabled={isEnabled}
                setIsEnabled={setIsEnabled}
                handleAccept={handleAccept}
            />
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
