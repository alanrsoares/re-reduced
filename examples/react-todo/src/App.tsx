import { useSelect } from "@re-reduced/react";
import { type FormEvent, useEffect } from "react";
import type { Filter } from "./todos.container";
import { useTodos } from "./useTodos";

const FILTERS: Filter[] = ["all", "active", "done"];

export function App() {
	const store = useTodos();
	const draft = useSelect(store, (s) => s.draft.value);
	const filter = useSelect(store, (s) => s.filter.value);
	const status = useSelect(store, (s) => s.status.value);
	const error = useSelect(store, (s) => s.error.value);
	const visible = useSelect(store, (_s, d) => d.visible.value);
	const activeCount = useSelect(store, (_s, d) => d.activeCount.value);
	const canSubmit = useSelect(store, (_s, d) => d.canSubmit.value);

	// load once on mount (emits a query intent → results re-enter as `loaded`)
	useEffect(() => {
		store.actions.load();
	}, [store]);

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		store.actions.submit();
	};

	return (
		<main className="app">
			<h1>todos</h1>

			<form onSubmit={onSubmit}>
				<input
					data-testid="draft"
					className={error ? "draft error" : "draft"}
					placeholder="What needs to be done?"
					value={draft}
					onChange={(e) => store.actions.draftChanged(e.target.value)}
				/>
				<button type="submit" data-testid="add" disabled={!canSubmit}>
					Add
				</button>
			</form>

			{error && (
				<p className="banner" data-testid="error">
					{error}
				</p>
			)}
			{status === "loading" && <p>Loading…</p>}

			<ul className="list">
				{visible.map((todo) => (
					<li key={todo.id} className={todo.done ? "done" : undefined}>
						<input
							type="checkbox"
							checked={todo.done}
							onChange={() => store.actions.toggled({ id: todo.id })}
						/>
						<span>{todo.title}</span>
						<button
							type="button"
							className="destroy"
							onClick={() => store.actions.removed({ id: todo.id })}
						>
							×
						</button>
					</li>
				))}
			</ul>

			<footer className="footer">
				<span data-testid="count">{activeCount} left</span>
				<span className="filters">
					{FILTERS.map((f) => (
						<button
							type="button"
							key={f}
							data-testid={`filter-${f}`}
							className={f === filter ? "selected" : undefined}
							onClick={() => store.actions.filterChanged(f)}
						>
							{f}
						</button>
					))}
				</span>
			</footer>
		</main>
	);
}
