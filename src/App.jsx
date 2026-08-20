import { useEffect, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'todos'

function loadTodos() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (todo) =>
          todo &&
          typeof todo === 'object' &&
          (typeof todo.id === 'string' || typeof todo.id === 'number') &&
          typeof todo.text === 'string' &&
          todo.text.trim() !== '',
      )
      .map((todo) => ({
        id: String(todo.id),
        text: todo.text,
        completed: Boolean(todo.completed),
      }))
  } catch {
    return []
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const skipSaveRef = useRef(false)

  const visible = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const remaining = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.length - remaining
  const allCompleted = todos.length > 0 && remaining === 0

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  function addTodo(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    setTodos((current) => [
      ...current,
      { id: createId(), text, completed: false },
    ])
    setInput('')
  }

  function toggleTodo(id) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
  }

  function deleteTodo(id) {
    const todo = todos.find((item) => item.id === id)
    if (!todo) return
    if (!window.confirm(`Delete “${todo.text}”?`)) return
    setTodos((current) => current.filter((item) => item.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditText('')
    }
  }

  function toggleAll() {
    const shouldComplete = !allCompleted
    setTodos((current) =>
      current.map((todo) => ({ ...todo, completed: shouldComplete })),
    )
  }

  function clearCompleted() {
    if (completedCount === 0) return
    if (!window.confirm('Clear all completed tasks?')) return
    setTodos((current) => current.filter((todo) => !todo.completed))
  }

  function startEdit(todo) {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  function saveEdit(id) {
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }

    const text = editText.trim()
    if (!text) {
      setEditingId(null)
      setEditText('')
      return
    }

    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, text } : todo)),
    )
    setEditingId(null)
    setEditText('')
  }

  function cancelEdit() {
    skipSaveRef.current = true
    setEditingId(null)
    setEditText('')
  }

  return (
    <main className="app">
      <header className="header">
        <h1>todos</h1>
        <p className="subtitle">What needs to be done?</p>
      </header>

      <form className="composer" onSubmit={addTodo}>
        <input
          className="new-todo"
          placeholder="Add a task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!input.trim()}>
          Add
        </button>
      </form>

      {todos.length > 0 && (
        <section className="list-wrap">
          <label className="toggle-all">
            <input
              type="checkbox"
              checked={allCompleted}
              onChange={toggleAll}
            />
            {allCompleted ? 'Unmark all' : 'Mark all as complete'}
          </label>

          {visible.length === 0 ? (
            <p className="empty">No {filter} tasks</p>
          ) : (
            <ul className="todo-list">
              {visible.map((todo) => (
                <li
                  key={todo.id}
                  className={todo.completed ? 'completed' : ''}
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    aria-label={`Mark “${todo.text}” complete`}
                  />

                  {editingId === todo.id ? (
                    <input
                      className="edit"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => saveEdit(todo.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="text"
                      onDoubleClick={() => startEdit(todo)}
                    >
                      {todo.text}
                    </span>
                  )}

                  <button
                    className="destroy"
                    type="button"
                    aria-label={`Delete “${todo.text}”`}
                    onClick={() => deleteTodo(todo.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <footer className="footer">
            <span className="count">
              {remaining} item{remaining === 1 ? '' : 's'} left
            </span>
            <div className="filters">
              <button
                type="button"
                className={filter === 'all' ? 'selected' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={filter === 'active' ? 'selected' : ''}
                onClick={() => setFilter('active')}
              >
                Active
              </button>
              <button
                type="button"
                className={filter === 'completed' ? 'selected' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
            <button
              type="button"
              className="clear"
              onClick={clearCompleted}
              disabled={completedCount === 0}
            >
              Clear completed
            </button>
          </footer>
        </section>
      )}
    </main>
  )
}
