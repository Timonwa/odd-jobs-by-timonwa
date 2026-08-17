"use client";
// sessionStorage-backed store for the user's BYOK Gemini key and model choice.

import {
	BYOK_MODELS,
	type ByokModel,
	DEFAULT_BYOK_MODEL,
} from "@/lib/config/byok";
import { BYOK_CHANGE_EVENT, STORAGE_KEYS } from "@/lib/constants";
import { isBrowser } from "@/lib/utils/is-browser.utils";

const BYOK_API_KEY = STORAGE_KEYS.byokApiKey;
const BYOK_MODEL_KEY = STORAGE_KEYS.byokModel;

const emitByokChange = () => {
	if (isBrowser()) window.dispatchEvent(new Event(BYOK_CHANGE_EVENT));
};

/** Subscribe to BYOK changes — same-tab writes and cross-tab storage events. */
export function subscribeByok(onChange: () => void) {
	if (!isBrowser()) return () => {};
	window.addEventListener(BYOK_CHANGE_EVENT, onChange);
	window.addEventListener("storage", onChange);
	return () => {
		window.removeEventListener(BYOK_CHANGE_EVENT, onChange);
		window.removeEventListener("storage", onChange);
	};
}

/** sessionStorage accessor for the user's raw Gemini API key; clears when the tab closes. */
export const byokStorage = {
	get(): string | null {
		if (!isBrowser()) return null;
		try {
			return window.sessionStorage.getItem(BYOK_API_KEY);
		} catch {
			return null;
		}
	},
	// Both report whether the write landed. sessionStorage throws where it is
	// unavailable or full (Safari private browsing, partitioned embeds, hardened
	// privacy settings) — swallowing that let the UI claim a key was saved, or
	// worse, cleared, when it wasn't.
	set(key: string): boolean {
		if (!isBrowser()) return false;
		try {
			window.sessionStorage.setItem(BYOK_API_KEY, key);
			emitByokChange();
			return true;
		} catch {
			return false;
		}
	},
	clear(): boolean {
		if (!isBrowser()) return false;
		try {
			window.sessionStorage.removeItem(BYOK_API_KEY);
			emitByokChange();
			return true;
		} catch {
			return false;
		}
	},
};

/** sessionStorage accessor for the BYOK model preference; get never returns null — falls back to DEFAULT_BYOK_MODEL. */
export const byokModelStorage = {
	get(): ByokModel {
		if (!isBrowser()) return DEFAULT_BYOK_MODEL;
		try {
			const raw = window.sessionStorage.getItem(BYOK_MODEL_KEY);
			if (!raw) return DEFAULT_BYOK_MODEL;
			return BYOK_MODELS.some((m) => m.value === raw)
				? (raw as ByokModel)
				: DEFAULT_BYOK_MODEL;
		} catch {
			return DEFAULT_BYOK_MODEL;
		}
	},
	set(model: ByokModel) {
		if (!isBrowser()) return;
		try {
			window.sessionStorage.setItem(BYOK_MODEL_KEY, model);
			emitByokChange();
		} catch {}
	},
	clear() {
		if (!isBrowser()) return;
		try {
			window.sessionStorage.removeItem(BYOK_MODEL_KEY);
			emitByokChange();
		} catch {}
	},
};
