import type { Todo } from '../types/todo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function fetchTodos(): Promise<Todo[]> {
    const res = await fetch(`${API_URL}/api/todos`);
    if (!res.ok) throw new Error('Failed to fetch todos');
    const data = await res.json();
    return data as Todo[];
}

export async function addTodo(title: string, description?: string): Promise<Todo> {
    const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
    });
    if (!res.ok) throw new Error('Failed to add todo');
    return (await res.json()) as Todo;
}

export async function updateTodo(
    id: string,
    updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>,
): Promise<Todo> {
    const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    return (await res.json()) as Todo;
}

export async function deleteTodo(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete todo');
}
