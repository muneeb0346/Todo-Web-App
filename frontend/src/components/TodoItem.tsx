import { useState } from 'react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
    todo: Todo;
    onToggle: (id: string, completed: boolean) => Promise<void> | void;
    onDelete: (id: string) => Promise<void> | void;
    onUpdate: (id: string, updates: Partial<Pick<Todo, 'title' | 'description'>>) => Promise<void> | void;
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(todo.title);
    const [description, setDescription] = useState(todo.description || '');
    const [saving, setSaving] = useState(false);

    const handleToggle = () => onToggle(todo.id, !todo.completed);

    const handleSave = async () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;
        setSaving(true);
        await onUpdate(todo.id, { title: trimmedTitle, description: description.trim() || undefined });
        setSaving(false);
        setIsEditing(false);
    };

    return (
        <article className="rounded-2xl gap-4 flex flex-col gap-4 border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5" aria-labelledby={`todo-title-${todo.id}`}>
            <div className="flex items-start gap-3">
                <label htmlFor={`todo-checkbox-${todo.id}`} className="sr-only">
                    {todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                </label>
                <input
                    id={`todo-checkbox-${todo.id}`}
                    className="mt-1 h-5 w-5 cursor-pointer accent-blue-600"
                    type="checkbox"
                    checked={todo.completed}
                    onChange={handleToggle}
                    aria-checked={todo.completed}
                />
                <div className="flex-1 space-y-2">
                    {isEditing ? (
                        <>
                            <label htmlFor={`edit-title-${todo.id}`} className="sr-only">Edit title</label>
                            <input
                                id={`edit-title-${todo.id}`}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-base focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                aria-label="Edit title"
                                required
                            />
                            <label htmlFor={`edit-description-${todo.id}`} className="sr-only">Edit description</label>
                            <input
                                id={`edit-description-${todo.id}`}
                                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-base focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description (optional)"
                                aria-label="Edit description"
                            />
                        </>
                    ) : (
                        <>
                            <h2 id={`todo-title-${todo.id}`} className={`text-lg font-semibold text-slate-900 ${todo.completed ? 'line-through text-slate-400' : ''}`}>
                                {todo.title}
                            </h2>
                            {todo.description && <p className="text-sm text-slate-600">{todo.description}</p>}
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-auto">
                <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${todo.completed
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-cyan-200 bg-cyan-50 text-cyan-700'
                        }`}
                >
                    {todo.completed ? 'Completed' : 'Active'}
                </span>
                <div className="flex-1" />
                {isEditing ? (
                    <>
                        <button
                            className="rounded-lg sm:rounded-xl border border-slate-200 bg-white px-2 py-1 sm:px-3 sm:py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                            onClick={() => setIsEditing(false)}
                            disabled={saving}
                            type="button"
                            aria-label="Cancel editing"
                        >
                            Cancel
                        </button>
                        <button
                            className="rounded-lg sm:rounded-xl bg-blue-600 px-2 py-1 sm:px-3 sm:py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:translate-y-[1px]"
                            onClick={handleSave}
                            disabled={saving}
                            type="button"
                            aria-label="Save changes"
                            aria-disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className="rounded-lg sm:rounded-xl border border-slate-200 bg-white px-2 py-1 sm:px-3 sm:py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                            onClick={() => setIsEditing(true)}
                            type="button"
                            aria-label={`Edit ${todo.title}`}
                        >
                            Edit
                        </button>
                        <button
                            className="rounded-lg sm:rounded-xl border border-rose-200 bg-rose-50 px-2 py-1 sm:px-3 sm:py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                            onClick={() => onDelete(todo.id)}
                            type="button"
                            aria-label={`Delete ${todo.title}`}
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}
