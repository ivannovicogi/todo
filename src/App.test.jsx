import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

beforeEach(() => {
  cleanup();
  localStorage.clear();
});

describe('Todo App', () => {
  test('should add a todo', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    expect(screen.getByText('New Todo')).toBeInTheDocument();
  });

  test('should mark todo complete', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    const todoItem = screen.getByText('New Todo').closest('li');
    const checkbox = within(todoItem).getByRole('checkbox');

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  test('should delete a todo', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    expect(screen.queryByText('New Todo')).not.toBeInTheDocument();
  });

  test('should edit a todo', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'New Todo');
    await user.click(addButton);

    const todoItem = screen.getByText('New Todo').closest('li');
    const editInput = within(todoItem).getByRole('textbox');

    await user.dblClick(screen.getByText('New Todo'));
    await user.type(editInput, 'Updated Todo{enter}');

    expect(screen.getByText('Updated Todo')).toBeInTheDocument();
  });

  test('should filter todos by all, active, or completed', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Todo 1');
    await user.click(addButton);
    await user.type(input, 'Todo 2');
    await user.click(addButton);

    const todoItem1 = screen.getByText('Todo 1').closest('li');
    const checkbox1 = within(todoItem1).getByRole('checkbox');
    await user.click(checkbox1);

    const activeFilter = screen.getByRole('button', { name: 'Active' });
    await user.click(activeFilter);

    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  test('should clear completed todos', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Todo 1');
    await user.click(addButton);
    await user.type(input, 'Todo 2');
    await user.click(addButton);

    const todoItem1 = screen.getByText('Todo 1').closest('li');
    const checkbox1 = within(todoItem1).getByRole('checkbox');
    await user.click(checkbox1);

    const clearButton = screen.getByRole('button', { name: 'Clear completed' });
    await user.click(clearButton);

    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  test('should display count of remaining todos', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Todo 1');
    await user.click(addButton);
    await user.type(input, 'Todo 2');
    await user.click(addButton);

    const todoItem1 = screen.getByText('Todo 1').closest('li');
    const checkbox1 = within(todoItem1).getByRole('checkbox');
    await user.click(checkbox1);

    expect(screen.getByText('1 item left')).toBeInTheDocument();
  });

  test('should toggle all todos as complete or incomplete', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Todo 1');
    await user.click(addButton);
    await user.type(input, 'Todo 2');
    await user.click(addButton);

    const toggleAllCheckbox = screen.getByRole('checkbox', { name: 'Mark all as complete' });
    await user.click(toggleAllCheckbox);

    const todoItem1 = screen.getByText('Todo 1').closest('li');
    const checkbox1 = within(todoItem1).getByRole('checkbox');
    expect(checkbox1).toBeChecked();

    await user.click(toggleAllCheckbox);
    expect(checkbox1).not.toBeChecked();
  });

  test('should persist data across reloads', async () => {
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Add a task…');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await user.type(input, 'Todo 1');
    await user.click(addButton);

    // Simulate a reload
    cleanup();
    render(<App />);

    expect(screen.getByText('Todo 1')).toBeInTheDocument();
  });
});
