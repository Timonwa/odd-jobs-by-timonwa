/** Signup quota. A real visitor subscribes once, so these are deliberately tight — the cap exists to stop list poisoning and subscribe-bombing, not to ration a feature. */
export const NEWSLETTER_DAILY_USER_CAP = 3;
export const NEWSLETTER_DAILY_SHARED_POOL = 500;
/** Per burst window (60s). One submission is the normal case; the rest is slack for a double-click or a retry. */
export const NEWSLETTER_BURST_CAP = 2;

/** Honeypot field name — deliberately plausible so a bot fills it, and unrelated to any real field so a human never sees it. */
export const NEWSLETTER_HONEYPOT_FIELD = "company_website";
