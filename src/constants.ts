export const CONSENT_COOKIE_VERSION = 2
export const DEFAULT_CONSENT_COOKIE_NAME = 'artus_consent'
/**
 * Chrome caps cookie lifetimes at 400 days. Consent itself does not expire
 * (re-consent only on material change), so the cookie is re-written on every
 * visit with this max age.
 */
export const CONSENT_COOKIE_MAX_AGE_SECONDS = 400 * 86400
export const PURPOSES_HASH_PREFIX_LENGTH = 16

export const DEFAULT_LANGUAGE = 'enUS'

/** Legacy (v1) cookie format, kept only for the one-time migration to v2. */
export const LEGACY_CONSENT_DIALOG_HAS_BEEN_DISPLAYED = 'cookie_consent_displayed'
export const LEGACY_CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE = 'true'
export const LEGACY_COOKIE_SUFFIX = '_consent'
export const LEGACY_COOKIE_VALUE_TRUE = 'given'
/** @deprecated v1 concept — the v2 cookie has a fixed max age and is refreshed per visit. */
export const DEFAULT_COOKIE_VALIDITY = 183
