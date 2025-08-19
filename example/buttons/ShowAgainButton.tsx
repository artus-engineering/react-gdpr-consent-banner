import { useOpenCookieBanner } from '../../src'

export default function ShowAgainButton() {
    const handleOpenCookieBanner = useOpenCookieBanner()
    return (
        <button
            type="button"
            onClick={handleOpenCookieBanner}
            className="ngcc-tw-bg-gray-900 ngcc-tw-px-3 ngcc-tw-py-2 ngcc-tw-rounded-lg ngcc-tw-font-medium ngcc-tw-w-full ngcc-tw-h-full"
        >
            Show Banner again
        </button>
    )
}
