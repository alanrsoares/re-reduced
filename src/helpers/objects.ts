export interface Tree<Leaf> {
  [k: string]: Leaf | Tree<Leaf>;
}

interface TraverseQuery<V, R> {
  transformKey?: (key: string, value: V) => string;
  transformValue?: (value: V, key: string) => R;
}

export const mapObjectValues = <V, R>(
  fn: (k: string, v: V) => { [k: string]: R }
) => (obj: Tree<V>): Tree<R> =>
  Object.keys(obj).reduce((acc, k) => ({ ...acc, ...fn(k, obj[k] as V) }), {});

export const transformTree = <V, R>(query: TraverseQuery<V, R>) => {
  const transformKey = query.transformKey || ((k: string, v: V) => k);
  const transformValue = query.transformValue || ((v: V, k: string) => k);

  function mapper(k: string, v: V | Tree<V>): { [k: string]: R } {
    if (typeof v === "object") {
      // @ts-ignore
      return { [k]: transformTree(query)(v as Tree<V>) };
    }

    // @ts-ignore
    return { [transformKey(k, v)]: transformValue(v, k) };
  }

  return mapObjectValues(mapper);
};
