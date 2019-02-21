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
  title: string;
  actions: typeof actions;
}

interface State {
  filter: Filter;
  newToDoTitle: string;
  editingId: string | undefined;
}

class App extends React.Component<Props, State> {
  public state: State = {
    filter: "All",
    editingId: undefined,
    newToDoTitle: ""
  };

  constructor(props: Props) {
    super(props);

    props.actions.fetch();
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
    e.stopPropagation();
    if (!todo.isCompleted) {
      this.setState({ editingId: todo.id });
    } else {
      this.setState({ editingId: undefined });
    }
  };

  public handleDelete = (todo: ToDo) => () => {
    this.props.actions.delete(todo.id);
  };

  public handleNewToDoChange = e => {
    this.setState({ newToDoTitle: e.target.value });
  };

  public handleNewToDoKeyDown = e => {
    if (e.key === "Enter") {
      this.props.actions.add({
        title: e.target.value
      });
      this.setState({ newToDoTitle: "" });
    }
  };

  public handleEditingToDoKeyDown = (todo: ToDo) => e => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.props.actions.update({
        ...todo,
        title: e.target.value
      });
      this.setState({ editingId: undefined });
    }
  };

  public handleEditingToDoBlur = () => {
    this.setState({ editingId: undefined });
  };

  public handleToggleAll = () => {
    const everyCompleted = this.filteredItems.every(todo => todo.isCompleted);

    this.setState({ editingId: undefined });
    this.filteredItems.forEach(todo =>
      this.props.actions.update({
        ...todo,
        isCompleted: !everyCompleted
      })
    );
  };

  public handleClearCompleted = () => {
    this.props.completedTodos.forEach(todo =>
      this.props.actions.delete(todo.id)
    );
  };

  public handleToggleToDo = (todo: ToDo) => () => {
    if (this.state.editingId === todo.id) {
      return;
    }

    this.props.actions.update({
      ...todo,
      isCompleted: !todo.isCompleted
    });

    this.setState({ editingId: undefined });
  };

  public render() {
    return (
      <section className="todoapp">
        <header className="header">
          <h1>{this.props.title}</h1>
          <input
            autoFocus
            className="new-todo"
            placeholder="What needs to be done?"
            value={this.state.newToDoTitle}
            onChange={this.handleNewToDoChange}
            onKeyDown={this.handleNewToDoKeyDown}
          />
        </header>
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            onChange={this.handleToggleAll}
            defaultChecked={this.filteredItems.every(todo => todo.isCompleted)}
          />
          <label htmlFor="toggle-all">Mark all as complete</label>
          {this.renderList()}
        </section>
        {this.renderFooter()}
      </section>
    );
  }

  public renderList() {
    return (
      <ul className="todo-list">
        {this.filteredItems.map(this.renderItem)}
        {(this.props.isLoading || this.props.isAdding) && (
          <li>
            <div className="view">
              <label className="loading">
                {this.props.isLoading ? "Loading todos" : "Adding new todo"}
              </label>
            </div>
          </li>
        )}
      </ul>
    );
  }

  public renderItem = (todo: ToDo) => {
    const className = todo.isCompleted
      ? "completed"
      : this.state.editingId === todo.id
        ? "editing"
        : undefined;

    return (
      <li key={todo.id} className={className}>
        <div className="view">
          <input
            readOnly
            id={`checkbox-${todo.id}`}
            className="toggle"
            type="checkbox"
            checked={todo.isCompleted}
            onChange={this.handleToggleToDo(todo)}
          />
          <label
            htmlFor={`checkbox-${todo.id}`}
            onDoubleClick={this.handleSelectForEdit(todo)}
          >
            {todo.title}
          </label>
          <button className="destroy" onClick={this.handleDelete(todo)} />
        </div>
        <input
          className="edit"
          defaultValue={todo.title}
          onKeyDown={this.handleEditingToDoKeyDown(todo)}
          onBlur={this.handleEditingToDoBlur}
        />
      </li>
    );
  };

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

interface OwnProps {
  title: string;
}

const enhance = connectWithActions<Props, OwnProps>(actions, {
  todos: selectors.getToDos,
  activeTodos: selectors.getActiveToDos,
  completedTodos: selectors.getCompletedToDos,
  isLoading: selectors.getToDosIsFetching,
  isAdding: selectors.getToDosIsAdding
});

export default enhance(App);
