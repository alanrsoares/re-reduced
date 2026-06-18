declare const store: unknown;
declare function useSelect<T>(s: unknown, sel: (state: any, derived: any) => T): T;

// returns a new array literal every render → defeats bail-out
const pair = useSelect(store, (s) => [s.a.value, s.b.value]);
