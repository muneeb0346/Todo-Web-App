import type { Todo } from '../types/todo';
import { lsFetchTodos, lsAddTodo, lsUpdateTodo, lsDeleteTodo } from './localStorage';

function getUseLocal(): boolean {
    if (typeof process !== 'undefined' && typeof process.env?.VITE_USE_LOCAL_STORAGE !== 'undefined') {
        return process.env.VITE_USE_LOCAL_STORAGE === 'true';
    }
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).VITE_USE_LOCAL_STORAGE !== 'undefined') {
        return String((globalThis as any).VITE_USE_LOCAL_STORAGE) === 'true';
    }
    return false;
}

function getApiUrl(): string {
    if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
        return process.env.VITE_API_URL;
    }

    if (typeof globalThis !== 'undefined' && (globalThis as any).VITE_API_URL) {
        return (globalThis as any).VITE_API_URL;
    }

    return 'http://localhost:5000';
}

const USE_LOCAL = getUseLocal();
const API_URL = getApiUrl();

export async function fetchTodos(): Promise<Todo[]> {
    if (USE_LOCAL) {
        return lsFetchTodos();
    }
    const res = await fetch(`${API_URL}/api/todos`);
    if (!res.ok) throw new Error('Failed to fetch todos');
    const data = await res.json();
    return data as Todo[];
}

export async function addTodo(title: string, description?: string): Promise<Todo> {
    if (USE_LOCAL) {
        return lsAddTodo(title, description);
    }
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
    if (USE_LOCAL) {
        return lsUpdateTodo(id, updates);
    }
    const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    return (await res.json()) as Todo;
}

export async function deleteTodo(id: string): Promise<void> {
    if (USE_LOCAL) {
        return lsDeleteTodo(id);
    }
    const res = await fetch(`${API_URL}/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete todo');
}
