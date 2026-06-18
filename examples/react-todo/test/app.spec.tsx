import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { App } from "../src/App";

describe("react-todo example", () => {
  afterEach(cleanup);

  it("loads seed todos, adds one, toggles, and filters", async () => {
    render(<App />);

    // load effect resolves and seed todos render (findBy polls for the async result)
    expect(await screen.findByText("Learn re-reduced")).toBeTruthy();
    expect(screen.getByText("Build something")).toBeTruthy();
    expect(screen.getByTestId("count").textContent).toBe("1 left");

    // add a todo
    fireEvent.change(screen.getByTestId("draft"), {
      target: { value: "Ship v2" },
    });
    fireEvent.click(screen.getByTestId("add"));
    expect(screen.getByText("Ship v2")).toBeTruthy();
    expect(screen.getByTestId("count").textContent).toBe("2 left");
    expect((screen.getByTestId("draft") as HTMLInputElement).value).toBe("");

    // toggle the new todo done
    const shipRow = screen.getByText("Ship v2").closest("li") as HTMLElement;
    fireEvent.click(
      shipRow.querySelector("input[type=checkbox]") as HTMLElement,
    );
    expect(screen.getByTestId("count").textContent).toBe("1 left");

    // filter to active → done items hidden
    fireEvent.click(screen.getByTestId("filter-active"));
    expect(screen.queryByText("Ship v2")).toBeNull();
    expect(screen.getByText("Build something")).toBeTruthy();
  });
});
