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
    readonly cookieProvider: CookieProviderConfig
    readonly children: React.ReactNode
}

interface ModalProps {
    readonly openModal: boolean
    readonly setOpenModal: (open: boolean) => void
    readonly style: CookieConsentStyleWithDefaults
    readonly config: CookieConsentBannerConfigWithDefaults
    readonly cookieProvider: CookieProviderConfig
    readonly isEnabled: boolean
    readonly setIsEnabled: (enabled: boolean) => void
    readonly handleAccept: () => void
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

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        const onCancel = (e: Event) => {
            e.preventDefault()
            setOpenModal(false)
        }
        const onClick = (e: MouseEvent) => {
            if (e.target === dialog) {
                setOpenModal(false)
            }
        }
        dialog.addEventListener('cancel', onCancel)
        dialog.addEventListener('click', onClick)
        return () => {
            dialog.removeEventListener('cancel', onCancel)
            dialog.removeEventListener('click', onClick)
        }
    }, [setOpenModal])

    return (
        <dialog
            ref={dialogRef}
            className="relative z-50 max-w-5xl mx-auto my-auto overflow-scroll max-h-[80vh] bg-transparent backdrop:bg-black/30 p-0 open:flex"
        >
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    style={{ color: style.textPrimary }}
                    className="absolute h-6 w-6 top-3 right-3 cursor-pointer border-0 bg-transparent p-0"
                    aria-label="Close"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-6 w-6"
                        aria-hidden
                    >
                        <title>Close Icon</title>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
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
                    <div className="flex justify-end w-full">
                        <Button
                            onClick={handleAccept}
                            disabled={!isEnabled}
                            text={'acceptSelectedCookies'}
                            config={config}
                            className="!w-max max-w-full"
                        />
                    </div>
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

    function onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        if (!isEnabled) {
            event.stopPropagation()
            setOpenModal(true)
            return
        }
        return undefined
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
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
            {isEnabled ? (
                <>{children}</>
            ) : (
                <button
                    type="button"
                    onClick={onClick}
                    onKeyDown={onKeyDown}
                    className="m-0 w-full cursor-pointer border-0 bg-transparent p-0 text-left opacity-50"
                >
                    {children}
                </button>
            )}
        </>
    )
}
