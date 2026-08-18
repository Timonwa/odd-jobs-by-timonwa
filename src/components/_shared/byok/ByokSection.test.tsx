import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_BYOK_MODEL } from "@/lib/config/byok";

// next/link needs the app-router context; a plain anchor is enough here.
vi.mock("next/link", () => ({
	default: ({
		href,
		children,
		...rest
	}: {
		href: string;
		children: ReactNode;
	}) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}));

import { ByokSection } from "./ByokSection";

const KEY = "AIzaSyFakeUserKey1234567890123456789";

const onSave = vi.fn();
const onClear = vi.fn();
const onModelChange = vi.fn();

const renderSection = (props?: Partial<ComponentProps<typeof ByokSection>>) =>
	render(
		<ByokSection
			savedKey={null}
			byokModel={DEFAULT_BYOK_MODEL}
			onSave={onSave}
			onClear={onClear}
			onModelChange={onModelChange}
			{...props}
		/>,
	);

beforeEach(() => {
	onSave.mockReset().mockReturnValue({ type: "success", message: "Saved." });
	onClear.mockReset().mockReturnValue({ type: "success", message: "Cleared." });
	onModelChange.mockReset();
});

describe("ByokSection", () => {
	it("masks the key input by default and reveals on demand", async () => {
		const user = userEvent.setup();
		renderSection();
		const input = screen.getByLabelText("Google API key");
		expect(input).toHaveAttribute("type", "password");
		await user.click(screen.getByRole("button", { name: "Show key" }));
		expect(input).toHaveAttribute("type", "text");
		await user.click(screen.getByRole("button", { name: "Hide key" }));
		expect(input).toHaveAttribute("type", "password");
	});

	it("saves the trimmed key and announces the result", async () => {
		const user = userEvent.setup();
		renderSection();
		await user.type(screen.getByLabelText("Google API key"), `  ${KEY}  `);
		await user.click(screen.getByRole("button", { name: "Save key" }));
		expect(onSave).toHaveBeenCalledWith(KEY);
		expect(screen.getByRole("status")).toHaveTextContent("Saved.");
	});

	// The full key must not linger as an input value in the DOM after saving —
	// the masked "Using your key" panel is the confirmation.
	it("clears the input after a successful save", async () => {
		const user = userEvent.setup();
		renderSection();
		const input = screen.getByLabelText("Google API key");
		await user.type(input, KEY);
		await user.click(screen.getByRole("button", { name: "Save key" }));
		expect(input).toHaveValue("");
	});

	it("keeps the input on a failed save so it can be corrected", async () => {
		onSave.mockReturnValue({ type: "error", message: "Could not save." });
		const user = userEvent.setup();
		renderSection();
		const input = screen.getByLabelText("Google API key");
		await user.type(input, KEY);
		await user.click(screen.getByRole("button", { name: "Save key" }));
		expect(input).toHaveValue(KEY);
	});

	it("never pre-fills the input from the saved key", () => {
		renderSection({ savedKey: KEY });
		expect(screen.getByLabelText("Google API key")).toHaveValue("");
	});

	it("announces a failed save as an alert", async () => {
		onSave.mockReturnValue({ type: "error", message: "Could not save." });
		const user = userEvent.setup();
		renderSection();
		await user.type(screen.getByLabelText("Google API key"), KEY);
		await user.click(screen.getByRole("button", { name: "Save key" }));
		expect(screen.getByRole("alert")).toHaveTextContent("Could not save.");
	});

	// The saved key is shown masked — the full key must never be re-rendered
	// into the DOM as text.
	it("shows only a masked form of the saved key", () => {
		const { container } = renderSection({ savedKey: KEY });
		expect(
			screen.getByText(`${KEY.slice(0, 6)}…${KEY.slice(-4)}`),
		).toBeVisible();
		expect(container.innerHTML).not.toContain(`>${KEY}<`);
	});

	it("clears the key and empties the input", async () => {
		const user = userEvent.setup();
		renderSection({ savedKey: KEY });
		await user.click(screen.getByRole("button", { name: "Clear key" }));
		expect(onClear).toHaveBeenCalledOnce();
		expect(screen.getByLabelText("Google API key")).toHaveValue("");
	});

	it("offers the model picker only once a key is saved", () => {
		renderSection();
		expect(screen.queryByText("Model")).not.toBeInTheDocument();
	});

	it("switches models through the picker", async () => {
		const user = userEvent.setup();
		renderSection({ savedKey: KEY });
		await user.click(screen.getByRole("button", { name: /^Pro/ }));
		expect(onModelChange).toHaveBeenCalledWith("gemini-pro-latest");
	});

	it("marks the active model as pressed", () => {
		renderSection({ savedKey: KEY, byokModel: "gemini-flash-latest" });
		expect(
			screen.getByRole("button", { name: /^Flash Better/ }),
		).toHaveAttribute("aria-pressed", "true");
	});
});
