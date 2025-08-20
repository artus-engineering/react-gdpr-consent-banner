import { useSetStrictlyNecessaryCookiesOnly } from '../../src'

export default function DeleteAllCookiesButton() {
    const setStrictlyNecessaryCookiesOnly = useSetStrictlyNecessaryCookiesOnly()
    return (
        <button
            type="button"
            onClick={setStrictlyNecessaryCookiesOnly}
            className="bg-gray-900 text-white px-3 py-2 rounded-lg font-medium w-full h-full"
        >
            Delete all non-necessary cookies
        </button>
    )
}
