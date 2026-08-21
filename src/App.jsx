import { useEffect, useState } from 'react'
import './App.css'

function loadTodos() {
  return JSON.parse(localStorage.getItem('todos') || '[]')
}

export default function App() {
  const [todos, setTodos] = useState(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editText, setEditText] = useState('')

  const visible = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  function addTodo(e) {
    e.preventDefault()
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false,
    };
    setTodos([...todos, newTodo])
    setInput('')
  }

  function toggleTodo(index) {
    const updatedTodos = todos.map((todo, i) => 
      i === index ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
  }

  function deleteTodo(index) {
    setTodos(todos.filter((_, i) => i !== index))
  }

  function toggleAll() {
    const shouldComplete = !todos.every((todo) => todo.completed)
    const updatedTodos = todos.map(todo => ({ ...todo, completed: shouldComplete }));
    setTodos(updatedTodos)
  }

  function clearCompleted() {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  function startEdit(index, text) {
    setEditingIndex(index)
    setEditText(text)
  }

  function saveEdit(index) {
    const updatedTodos = todos.map((todo, i) => 
      i === index ? { ...todo, text: editText } : todo
    );
    setTodos(updatedTodos);
    setEditingIndex(-1)
  }

  const remaining = todos.filter((todo) => !todo.completed).length

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
        <button type="submit" onClick={addTodo}>
          Add
        </button>
      </form>

      {todos.length > 0 && (
        <section className="list-wrap">
          <label className="toggle-all">
            <input
              type="checkbox"
              checked={todos.every((todo) => todo.completed)}
              onChange={toggleAll}
            />
            Mark all as complete
          </label>

          <ul className="todo-list">
            {visible.map((todo, index) => (
              <li key={index} className={todo.completed ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(index)}
                />

                {editingIndex === index ? (
                  <input
                    className="edit"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(index)
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className="text"
                    onDoubleClick={() => startEdit(index, todo.text)}
                    dangerouslySetInnerHTML={{ __html: todo.text }}
                  />
                )}

                <button
                  className="destroy"
                  type="button"
                  aria-label="Delete"
                  onClick={() => deleteTodo(index)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

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
            <button type="button" className="clear" onClick={clearCompleted}>
              Clear completed
            </button>
          </footer>
        </section>
      )}
    </main>
  )
}