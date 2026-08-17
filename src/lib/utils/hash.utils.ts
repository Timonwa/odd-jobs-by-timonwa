// Browser-side text hashing via Web Crypto (the Hash Generator tool).

import type { HashAlgorithmType } from "@/lib/constants";

/** Browser-side text hasher — uses `crypto.subtle` (secure context only) so input never leaves the device; returns a lowercase hex digest. */
export async function hashText(
	text: string,
	algorithm: HashAlgorithmType,
): Promise<string> {
	const data = new TextEncoder().encode(text);
	const digest = await crypto.subtle.digest(algorithm, data);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
}
