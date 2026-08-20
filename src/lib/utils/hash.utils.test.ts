import { describe, expect, it } from "vitest";

import { hashText } from "./hash.utils";

describe("hashText", () => {
	// Known digests, so a Web Crypto regression is caught against fixed values.
	it("computes SHA-256 as lowercase hex", async () => {
		await expect(hashText("hello", "SHA-256")).resolves.toBe(
			"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
		);
	});

	it("computes SHA-1", async () => {
		await expect(hashText("hello", "SHA-1")).resolves.toBe(
			"aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
		);
	});

	it("hashes the empty string", async () => {
		await expect(hashText("", "SHA-256")).resolves.toBe(
			"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		);
	});

	it("produces the right digest lengths", async () => {
		await expect(hashText("x", "SHA-384")).resolves.toHaveLength(96);
		await expect(hashText("x", "SHA-512")).resolves.toHaveLength(128);
	});

	it("encodes multi-byte input as UTF-8 before hashing", async () => {
		const a = await hashText("é", "SHA-256");
		const b = await hashText("e", "SHA-256");
		expect(a).not.toBe(b);
	});
});
