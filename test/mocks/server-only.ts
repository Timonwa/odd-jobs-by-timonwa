// The real `server-only` throws outside a React Server Components bundle.
// Vitest imports server modules directly, so the alias in vitest.config.ts
// resolves it to this empty stub instead.
export {};
