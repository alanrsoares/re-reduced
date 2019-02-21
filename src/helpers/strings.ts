export const isSnakeCase = (s: string) => /^([A-Z]_*)+$/g.test(s);

export const toPascalCase = (s: string) =>
  s.toLowerCase().replace(/_(\w)/g, match => `${match[1].toUpperCase()}`);

export const toSnakeCase = (s: string) =>
  s.replace(/(([a-z])([A-Z]))/g, ([a, b]) => `${a}_${b}`).toUpperCase();
