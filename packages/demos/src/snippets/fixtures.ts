// Shared stubs so snippet modules compile against realistic ambient code.
// None of this appears in rendered docs — the extractor hides every fixture
// import/declaration behind twoslash's `---cut---` markers, keeping them for
// type-checking only. Keep it minimal and conflict-free: its whole body is
// injected into *every* generated snippet's twoslash form.

/** A user record some snippets read as if it came from the app's data layer. */
export type User = { id: string; name: string };
