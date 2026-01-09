import { useState } from 'react';

interface TodoFormProps {
    onAdd: (title: string, description?: string) => Promise<void> | void;
    titleRef?: React.RefObject<HTMLInputElement | null>;
}

export default function TodoForm({ onAdd, titleRef }: TodoFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const t = title.trim();
        const d = description.trim();
        if (!t) return;
        setSubmitting(true);
        try {
            await onAdd(t, d ? d : undefined);
            setTitle('');
            setDescription('');
            titleRef?.current?.focus();
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <form className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-6" onSubmit={handleSubmit} aria-labelledby="add-todo-dialog">
            <div className="grid grid-cols-1 gap-3">
                <label htmlFor="todo-title" className="sr-only">Todo title (required)</label>
                <input
                    id="todo-title"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="text"
                    placeholder="Add a task title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    ref={titleRef}
                    aria-required="true"
                />
                <label htmlFor="todo-description" className="sr-only">Todo description (optional)</label>
                <input
                    id="todo-description"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    type="text"
                    placeholder="Optional description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    aria-label="Todo description"
                />
                <button
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:translate-y-[1px]"
                    type="submit"
                    disabled={submitting}
                    aria-disabled={submitting}
                >
                    {submitting ? 'Adding...' : 'Add Todo'}
                </button>
            </div>
        </form>
    );
}
