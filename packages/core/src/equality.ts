/** Shallow equality for plain objects and arrays. Pass as `useSelect`'s `equals` argument. */
export const shallow = <T>(a: T, b: T): boolean => {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== "object" ||
    typeof b !== "object" ||
    a === null ||
    b === null ||
    Array.isArray(a) !== Array.isArray(b)
  )
    return false;
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every(
    (k) =>
      Object.hasOwn(b, k) &&
      Object.is(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
  );
};
