// Deliberately tight — a real visitor subscribes once.
export const NEWSLETTER_DAILY_USER_CAP = 3;
export const NEWSLETTER_DAILY_SHARED_POOL = 500;
export const NEWSLETTER_BURST_CAP = 2;

export const NEWSLETTER_HONEYPOT_FIELD = "company_website";

// Newsletter signup endpoint.
export const NEWSLETTER_SUBSCRIBE_ENDPOINT =
	"https://admin.timonwa.com/api/public/subscribe";
