import { toUpperSnakeCase } from "../../src/helpers/strings";

describe("Helpers - Strings", () => {
  describe("toUpperSnakeCase", () => {
    it("transforms a camelCase string to SNAKE_CASE", () => {
      expect(toUpperSnakeCase("fooBar")).toBe("FOO_BAR");
      expect(toUpperSnakeCase("fooBar_BAZ")).toBe("FOO_BAR_BAZ");
    });
  });
});
