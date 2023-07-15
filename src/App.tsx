import { useAuth } from "oidc-react";
import React, { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Todos } from "./components/Todos";
import { AppProps, Todo, User } from "./interfaces";
import { useTodoService, useUser } from "./todoService";

import "react-toastify/dist/ReactToastify.css";
import "todomvc-app-css/index.css";

export const App: React.FC<AppProps> = (props) => {
  const auth = useAuth();
  const { createTodo, listTodos } = useTodoService();
  const userEmail = props.user.email;
  const [todos, setTodos] = useState<Todo[] | void>([]);
  const [todoTitle, setTodoTitle] = useState<string>("");
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [showActive, setShowActive] = useState<boolean>(true);
  const user: User = useUser(props.user.sub);

  const errorHandler = (errorText: string) => {
    toast.error("Error: " + errorText, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const onTodoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTodoTitle(e.target.value);
  };

  const handleSubmit: () => void = async () => {
    if (userEmail === "" || typeof userEmail === "undefined") {
      errorHandler("No user email found.");
      return;
    }

    if (todoTitle === "") {
      errorHandler("No Todo item entered.");
      return;
    }

    try {
      await createTodo({
        Title: todoTitle,
        Completed: false,
      });
    } catch (e) {
      e instanceof Error && errorHandler(e.message);
    }
    setTodoTitle("");
    refreshTodos();
  };

  const refreshTodos: () => void = useCallback(() => {
    const getTodos = async () => {
      const todos: Todo[] = await listTodos();
      setTodos(todos);
    };

    getTodos();
  }, [listTodos]);

  const enableShowCompleted: () => void = () => {
    setShowCompleted(true);
    setShowActive(false);
  };

  const enableShowActive: () => void = () => {
    setShowActive(true);
    setShowCompleted(false);
  };

  useEffect(() => {
    refreshTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={todoTitle}
            onChange={(e) => onTodoChange(e)}
            onKeyDown={(e) => {
              e.key === "Enter" && handleSubmit();
            }}
          />
        </header>

        <section className="main">
          <input id="toggle-all" className="toggle-all" type="checkbox" />
          <label>Mark all as complete</label>
          <ul className="todo-list">
            <Todos
              todos={todos}
              refreshTodos={refreshTodos}
              showActive={showActive}
              showCompleted={showCompleted}
              errorHandler={errorHandler}
            />
          </ul>
        </section>
        <footer className="footer">
          <span className="todo-count">
            <strong>
              {todos?.filter((todo) => !todo.Completed).length ?? 0}
            </strong>{" "}
            item left
          </span>
          <ul className="filters">
            <li>
              <a
                className={showCompleted && showActive ? "selected" : ""}
                onClick={() => {
                  setShowActive(true);
                  setShowCompleted(true);
                }}
                href="/#"
              >
                All
              </a>
            </li>
            <li>
              <a
                className={showActive && !showCompleted ? "selected" : ""}
                onClick={() => enableShowActive()}
                href="/#"
              >
                Active
              </a>
            </li>
            <li>
              <a
                className={showCompleted && !showActive ? "selected" : ""}
                onClick={() => enableShowCompleted()}
                href="/#"
              >
                Completed
              </a>
            </li>
          </ul>
        </footer>
      </section>
      <footer className="info">
        <div className="user-controls">
          <>
            <div className="user-info">
              <span className="user-name">
                Logged in as: <b>{props.user?.email}</b>
              </span>
              {user?.picture ? (
                <span className="user-picture">
                  <img
                    alt="user"
                    style={{
                      borderRadius: "50%",
                      width: 50,
                      height: 50,
                    }}
                    src={user.picture}
                  />
                </span>
              ) : null}
            </div>
            <div className="seperator"></div>
            <div className="auth-button">
              <div onClick={() => auth.signOut()}>Log Out</div>
            </div>
          </>
        </div>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </footer>
    </div>
  );
};
