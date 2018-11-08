import * as React from "react";

import { connectWithActions } from "../../src";

import actions from "./actions";
import * as selectors from "./selectors";
import { ToDo, Filter, FILTERS } from "./types";

import "./styles.css";

interface Props {
  todos: ToDo[];
  activeTodos: ToDo[];
  completedTodos: ToDo[];
  isLoading: boolean;
  isAdding: boolean;
  actions: typeof actions;
}

interface State {
  filter: Filter;
  edditingId: string;
}

class App extends React.Component<Props, State> {
  public state: State = {
    filter: "All",
    edditingId: null
  };

  constructor(props: Props) {
    super(props);

    props.actions.todos.fetch();
  }

  get filteredItems() {
    switch (this.state.filter) {
      case FILTERS.Active:
        return this.props.activeTodos;
      case FILTERS.Completed:
        return this.props.completedTodos;
      default:
        return this.props.todos;
    }
  }

  public handleSelectFilter = (filter: Filter) => e => {
    e.preventDefault();
    this.setState({ filter });
  };

  public handleSelectForEdit = (todo: ToDo) => e => {
    e.preventDefault();
    this.setState({ edditingId: todo.id });
  };

  public handleToDoKeyDown = e => {
    if (e.key === "Enter") {
      this.props.actions.todos.add({
        title: e.target.value
      });
    }
  };

  public handleEditingItemKeyDown = (todo: ToDo) => e => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.props.actions.todos.update({
        ...todo,
        title: e.target.value
      });
      this.setState({ edditingId: undefined });
    }
  };

  public handleToggleAll = () => {
    return;
  };

  public handleClearCompleted = () => {
    return;
  };

  public handleToggleToDo = (todo: ToDo) => () => {
    this.props.actions.todos.update({
      ...todo,
      isCompleted: !todo.isCompleted
    });
  };

  public render() {
    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>

          <input
            autoFocus
            className="new-todo"
            placeholder="What needs to be done?"
            onKeyDown={this.handleToDoKeyDown}
          />
        </header>
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={this.handleToggleAll}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          {this.renderList()}
        </section>
        {this.renderFooter()}
      </section>
    );
  }

  public renderList() {
    if (this.props.isLoading) {
      return <div className="view">Loading todos...</div>;
    }

    return (
      <ul className="todo-list">
        {this.filteredItems.map(todo => (
          <li
            key={todo.id}
            className={
              todo.isCompleted
                ? "completed"
                : this.state.edditingId === todo.id
                  ? "editing"
                  : undefined
            }
          >
            <div className="view">
              <input
                readOnly
                className="toggle"
                type="checkbox"
                checked={todo.isCompleted}
                onChange={this.handleToggleToDo(todo)}
              />
              <label onDoubleClick={this.handleSelectForEdit(todo)}>
                {todo.title}
              </label>
              <button className="destroy" />
            </div>
            <input
              className="edit"
              defaultValue={todo.title}
              onKeyDown={this.handleEditingItemKeyDown(todo)}
            />
          </li>
        ))}
      </ul>
    );
  }

  public renderFooter() {
    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>
            {this.props.todos.length - this.props.completedTodos.length}
          </strong>{" "}
          item left
        </span>

        <ul className="filters">
          {Object.keys(FILTERS).map((filter: Filter) => (
            <li key={filter}>
              <a
                className={
                  this.state.filter === filter ? "selected" : undefined
                }
                href="#"
                onClick={this.handleSelectFilter(filter)}
              >
                {filter}
              </a>
            </li>
          ))}
        </ul>
        <button className="clear-completed" onClick={this.handleClearCompleted}>
          Clear completed
        </button>
      </footer>
    );
  }
}

const enhance = connectWithActions<Props>(actions, {
  todos: selectors.getToDos,
  activeTodos: selectors.getActiveToDos,
  completedTodos: selectors.getCompletedToDos,
  isLoading: selectors.getToDosIsFetching,
  isAdding: selectors.getToDosIsAdding
});

export default enhance(App);
