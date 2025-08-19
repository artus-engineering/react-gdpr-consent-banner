import { useSetStrictlyNecessaryCookiesOnly } from '../../src'

export default function DeleteAllCookiesButton() {
    const setStrictlyNecessaryCookiesOnly = useSetStrictlyNecessaryCookiesOnly()
    return (
        <button
            type="button"
            onClick={setStrictlyNecessaryCookiesOnly}
            className="ngcc-tw-bg-gray-900 ngcc-tw-px-3 ngcc-tw-py-2 ngcc-tw-rounded-lg ngcc-tw-font-medium ngcc-tw-w-full ngcc-tw-h-full"
        >
            Delete all non-necessary cookies
        </button>
    )
}
