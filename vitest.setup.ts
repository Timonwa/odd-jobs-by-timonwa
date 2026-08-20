// Loaded by the `dom` project only — registers jest-dom matchers on Vitest's
// expect, and unmounts between tests (RTL's auto-cleanup needs the globals API,
// which this setup keeps off in favor of explicit imports).
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
	cleanup();
});
