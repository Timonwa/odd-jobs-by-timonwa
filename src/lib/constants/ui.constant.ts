/** How long a "Copied" confirmation stays visible. One value so every copy button in the app agrees — four sites previously hardcoded it, one of them at a different number. */
export const COPY_FEEDBACK_MS = 1500;

/** Debounce before writing run history to localStorage, so a fast typist doesn't hammer it. */
export const HISTORY_DEBOUNCE_MS = 600;
