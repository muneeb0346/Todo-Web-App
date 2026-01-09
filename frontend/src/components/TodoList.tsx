import { useEffect, useMemo, useRef, useState } from 'react';
import { addTodo, deleteTodo, fetchTodos, updateTodo } from '../services/api';
import type { Todo } from '../types/todo';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';

type Filter = 'all' | 'active' | 'completed';

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<Filter>('all');
    const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [showForm, setShowForm] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchTodos();
                setTodos(data);
            } catch {
                setError('Failed to load todos');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const filteredTodos = useMemo(() => {
        if (filter === 'active') return todos.filter((t) => !t.completed);
        if (filter === 'completed') return todos.filter((t) => t.completed);
        return todos;
    }, [todos, filter]);

    const activeCount = todos.filter((t) => !t.completed).length;
    const completedCount = todos.length - activeCount;

    const handleAdd = async (title: string, description?: string) => {
        setError('');
        const optimistic: Todo = {
            id: crypto.randomUUID(),
            title,
            description,
            completed: false,
            createdAt: new Date(),
        };
        setTodos((prev) => [optimistic, ...prev]);
        try {
            const created = await addTodo(title, description);
            setTodos((prev) => prev.map((t) => (t.id === optimistic.id ? created : t)));
            setShowForm(false);
        } catch {
            setTodos((prev) => prev.filter((t) => t.id !== optimistic.id));
            setError('Failed to add todo');
        }
    };

    const handleToggle = async (id: string, completed: boolean) => {
        setError('');
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
        try {
            await updateTodo(id, { completed });
        } catch {
            setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
            setError('Failed to update todo');
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Pick<Todo, 'title' | 'description'>>) => {
        setError('');
        setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
        try {
            await updateTodo(id, updates);
        } catch {
            setError('Failed to update todo');
        }
    };

    const handleDelete = async (id: string) => {
        setError('');
        const toDelete = todos.find((t) => t.id === id);
        if (!toDelete) return;

        setTodos((prev) => prev.filter((t) => t.id !== id));

        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
        }

        const undo = () => {
            setTodos((prev) => [toDelete, ...prev]);
            setToast(null);
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };

        setToast({ message: 'Todo deleted', undo });

        timerRef.current = window.setTimeout(async () => {
            try {
                await deleteTodo(id);
            } catch {
                setTodos((prev) => [toDelete, ...prev]);
                setError('Failed to delete todo');
            } finally {
                setToast(null);
            }
        }, 4000);
    };

    return (
        <section className="mx-auto max-w-screen-xl px-4 md:px-6 py-12 md:py-16 lg:py-20 gap-4 md:gap-6 lg:gap-8 flex flex-col" aria-labelledby="todo-heading">
            <header className="flex flex-row items-end justify-between">
                <div className="space-y-2">
                    <h1 id="todo-heading" className="font-bold leading-tight text-2xl md:text-3xl lg:text-5xl">Todo List</h1>
                    <p className="text-slate-600 font-semibold" aria-live="polite">{activeCount} active · {completedCount} completed</p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                    <button
                        className="inline-flex items-center rounded-lg sm:rounded-xl bg-blue-600 px-3 py-2 sm:px-4 sm:py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:translate-y-[1px]"
                        type="button"
                        onClick={() => {
                            setShowForm(true);
                            setTimeout(() => titleInputRef.current?.focus(), 50);
                        }}
                        aria-label="Add new todo"
                    >
                        Add new todo
                    </button>
                </div>
            </header>

            <nav className="flex flex-wrap items-center gap-3" aria-label="Filter todos">
                <button
                    className={`rounded-full border px-3 py-1 sm:px-4 sm:py-2 text-sm font-semibold transition ${filter === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200'
                        }`}
                    onClick={() => setFilter('all')}
                    type="button"
                    aria-pressed={filter === 'all'}
                    aria-label="Show all todos"
                >
                    All
                </button>
                <button
                    className={`rounded-full border px-3 py-1 sm:px-4 sm:py-2 text-sm font-semibold transition ${filter === 'active' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200'
                        }`}
                    onClick={() => setFilter('active')}
                    type="button"
                    aria-pressed={filter === 'active'}
                    aria-label="Show active todos"
                >
                    Active
                </button>
                <button
                    className={`rounded-full border px-3 py-1 sm:px-4 sm:py-2 text-sm font-semibold transition ${filter === 'completed' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-800 border-slate-200'
                        }`}
                    onClick={() => setFilter('completed')}
                    type="button"
                    aria-pressed={filter === 'completed'}
                    aria-label="Show completed todos"
                >
                    Completed
                </button>
                <span className="ml-auto text-slate-600 font-semibold" aria-live="polite">Total: {todos.length}</span>
            </nav>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow" role="alert" aria-live="assertive">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="mt-12 flex justify-center text-slate-600" role="status" aria-live="polite">Loading...</div>
            ) : filteredTodos.length === 0 ? (
                <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow" role="status">
                    No todos yet. Add your first task.
                </div>
            ) : (
                <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5 lg:gap-6" role="list">
                    {filteredTodos.map((todo) => (
                        <li key={todo.id} className='grid items-stretch'>
                            <TodoItem
                                todo={todo}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onUpdate={handleUpdate}
                            />
                        </li>
                    ))}
                </ul>
            )}

            {toast && (
                <div className="fixed bottom-5 right-5 z-20 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-2xl" role="status" aria-live="polite">
                    <p>{toast.message}</p>
                    {toast.undo && (
                        <button
                            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                            onClick={toast.undo}
                            type="button"
                            aria-label="Undo delete"
                        >
                            Undo
                        </button>
                    )}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4" role="dialog" aria-modal="true" aria-labelledby="add-todo-dialog">
                    <div className="relative w-full max-w-xl">
                        <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3">
                            <button
                                className="inline-flex items-center justify-center rounded-full bg-white w-8 h-8 text-slate-700 shadow hover:bg-slate-50 transition"
                                onClick={() => setShowForm(false)}
                                type="button"
                                aria-label="Close dialog"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <TodoForm onAdd={handleAdd} titleRef={titleInputRef} />
                    </div>
                </div>
            )}
        </section>
    );
}
