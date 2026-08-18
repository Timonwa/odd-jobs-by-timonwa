import { describe, expect, it } from "vitest";

import { splitTitle } from "./split-title.utils";

describe("splitTitle", () => {
	it("splits lead and accent when the title ends with the accent", () => {
		expect(
			splitTitle({ title: "Ship faster with tools", titleAccent: "tools" }),
		).toEqual({ lead: "Ship faster with ", accent: "tools" });
	});

	it("falls back to an all-accent title when the accent does not match", () => {
		expect(
			splitTitle({ title: "Ship faster", titleAccent: "nothing" }),
		).toEqual({ lead: "", accent: "Ship faster" });
	});

	it("falls back when the accent is empty", () => {
		expect(splitTitle({ title: "Ship faster", titleAccent: "" })).toEqual({
			lead: "",
			accent: "Ship faster",
		});
	});
});
