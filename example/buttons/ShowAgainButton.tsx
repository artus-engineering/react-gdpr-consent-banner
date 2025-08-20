import { useOpenCookieBanner } from '../../src'

export default function ShowAgainButton() {
    const handleOpenCookieBanner = useOpenCookieBanner()
    return (
        <button type="button" onClick={handleOpenCookieBanner} className="bg-gray-900 text-white px-3 py-2 rounded-lg font-medium w-full h-full">
            Show Banner again
        </button>
    )
}
