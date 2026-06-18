/** @jsxImportSource preact */
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { App } from "../src/App";

describe("preact-todo example", () => {
  afterEach(cleanup);

  it("loads seed todos, adds one, toggles, and filters", async () => {
    render(<App />);

    expect(await screen.findByText("Learn re-reduced")).toBeTruthy();
    expect(screen.getByTestId("count").textContent).toBe("1 left");

    fireEvent.input(screen.getByTestId("draft"), {
      target: { value: "Ship v2" },
    });
    fireEvent.click(screen.getByTestId("add"));
    expect(screen.getByText("Ship v2")).toBeTruthy();
    expect(screen.getByTestId("count").textContent).toBe("2 left");

    const shipRow = screen.getByText("Ship v2").closest("li") as HTMLElement;
    fireEvent.click(
      shipRow.querySelector("input[type=checkbox]") as HTMLElement,
    );
    expect(screen.getByTestId("count").textContent).toBe("1 left");

    fireEvent.click(screen.getByTestId("filter-active"));
    expect(screen.queryByText("Ship v2")).toBeNull();
    expect(screen.getByText("Build something")).toBeTruthy();
  });
});
