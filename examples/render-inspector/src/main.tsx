import "@re-reduced/demos/life.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (root)
  createRoot(root).render(
    <StrictMode>
      <main className="page">
        <h1>Render Inspector</h1>
        <p className="lede">
          Conway's Game of Life on a grid of DOM nodes, run on two state
          backends at once. The board and controls are shared — only the
          subscription model differs. Watch how many cells each backend
          re-renders per tick.
        </p>
        <App />
      </main>
    </StrictMode>,
  );
