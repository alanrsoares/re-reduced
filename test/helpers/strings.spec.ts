import { toSnakeCase } from "../../src/helpers/strings";

describe("Helpers - Strings", () => {
  describe("toSnakeCase", () => {
    it("transforms a camelCase string to SNAKE_CASE", () => {
      expect(toSnakeCase("fooBar")).toBe("FOO_BAR");
      expect(toSnakeCase("fooBar_BAZ")).toBe("FOO_BAR_BAZ");
    });
  });
});
