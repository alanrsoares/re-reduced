declare const store: unknown;
declare function useSelect<T>(s: unknown, sel: (state: any, derived: any) => T): T;

// returns a new object literal every render → defeats bail-out
const view = useSelect(store, (s) => ({ a: s.a.value, b: s.b.value }));
