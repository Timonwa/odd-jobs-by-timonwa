// Tight by design: the caps stop list poisoning and subscribe-bombing, not feature use.
export const NEWSLETTER_DAILY_USER_CAP = 3;
export const NEWSLETTER_DAILY_SHARED_POOL = 500;
export const NEWSLETTER_BURST_CAP = 2;

// Plausible enough that a bot fills it, and matches no real field, so no human sees it.
export const NEWSLETTER_HONEYPOT_FIELD = "company_website";

export const SENDER_SUBSCRIBERS_URL = "https://api.sender.net/v2/subscribers";

// "All customers" (account-wide) and "Odd Jobs".
export const SENDER_GROUP_IDS = ["b6VOlQ", "dw5jLr"];
