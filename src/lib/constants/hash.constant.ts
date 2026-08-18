/** Supported Web Crypto digest algorithms, in display order. */
export const HASH_ALGORITHMS = [
	"SHA-1",
	"SHA-256",
	"SHA-384",
	"SHA-512",
] as const;

/** Union of the supported digest algorithm names. */
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];
