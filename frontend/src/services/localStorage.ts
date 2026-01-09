import type { Todo } from '../types/todo';

const STORAGE_KEY = 'todos';

function read(): Todo[] {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return [];
    try {
        const arr = JSON.parse(raw) as Array<Omit<Todo, 'createdAt'> & { createdAt: string }>;
        return arr.map(t => ({ ...t, createdAt: new Date(t.createdAt) }));
    } catch {
        return [];
    }
}

function write(todos: Todo[]): void {
    if (typeof window === 'undefined') return;
    const serializable = todos.map(t => ({ ...t, createdAt: t.createdAt.toISOString() }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
}

function uuid(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return (crypto as any).randomUUID();
    }
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function lsFetchTodos(): Promise<Todo[]> {
    return read();
}

export async function lsAddTodo(title: string, description?: string): Promise<Todo> {
    const todos = read();
    const newTodo: Todo = {
        id: uuid(),
        title,
        description,
        completed: false,
        createdAt: new Date(),
    };
    todos.push(newTodo);
    write(todos);
    return newTodo;
}

export async function lsUpdateTodo(
    id: string,
    updates: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>,
): Promise<Todo> {
    const todos = read();
    const idx = todos.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Todo not found');
    const updated: Todo = { ...todos[idx], ...updates };
    todos[idx] = updated;
    write(todos);
    return updated;
}

export async function lsDeleteTodo(id: string): Promise<void> {
    const todos = read();
    const next = todos.filter(t => t.id !== id);
    write(next);
}
