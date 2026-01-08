import type { Request, Response } from 'express';
import type { Todo } from '../types/todo.js';

let todos: Todo[] = [];

export const getTodos = (req: Request, res: Response) => {
    res.status(200).json(todos);
};

export const addTodo = (req: Request, res: Response) => {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        description,
        completed: false,
        createdAt: new Date(),
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
};

export const updateTodo = (req: Request, res: Response) => {
    const { id } = req.params;
    const { completed, title, description } = req.body;

    const todo = todos.find((t) => t.id === id);
    if (!todo) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    if (completed !== undefined) todo.completed = completed;
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;

    res.status(200).json(todo);
};

export const deleteTodo = (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = todos.length;
    todos = todos.filter((t) => t.id !== id);

    if (todos.length === initialLength) {
        return res.status(404).json({ error: 'Todo not found' });
    }

    res.status(200).send();
};
