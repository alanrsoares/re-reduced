export interface Tree<Leaf> {
  [k: string]: Leaf | Tree<Leaf>;
}

export interface TraverseQuery<TLeft, TRight> {
  transformKey?: (key: string, value: TLeft) => string;
  transformValue?: (value: TLeft, key: string) => TRight;
}

export const mapObjectValues = <TLeft, TRight>(
  fn: (k: string, v: TLeft) => { [k: string]: TRight }
) => (obj: Tree<TLeft>): Tree<TRight> =>
  Object.keys(obj).reduce(
    (acc, k) => ({ ...acc, ...fn(k, obj[k] as TLeft) }),
    {}
  );

export const transformTree = <TLeft, TRight>(
  query: TraverseQuery<TLeft, TRight>
) => {
  const transformKey = query.transformKey || ((k: string, _: TLeft) => k);
  const transformValue = query.transformValue || ((v: TLeft, _: string) => v);

  function mapper(
    key: string,
    value: TLeft | Tree<TLeft>
  ): { [k: string]: TRight | Tree<TRight> } {
    if (typeof value === "object") {
      return {
        [key]: transformTree(query)(value as Tree<TLeft>) as Tree<TRight>
      };
    }

    return { [transformKey(key, value)]: transformValue(value, key) as TRight };
  }

  return mapObjectValues(mapper);
};
