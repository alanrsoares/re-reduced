declare const store: unknown;
declare function useSelect<T>(s: unknown, sel: (state: any, derived: any) => T): T;

// primitive reads are stable — fine
const a = useSelect(store, (s) => s.a.value);
const count = useSelect(store, (_s, d) => d.count.value);
