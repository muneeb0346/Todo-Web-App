import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoItem from '../TodoItem';
import type { Todo } from '../../types/todo';

const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date('2024-01-01'),
};

describe('TodoItem', () => {
    it('should render todo item with title and description', () => {
        const onToggle = jest.fn();
        const onDelete = jest.fn();
        const onUpdate = jest.fn();

        render(
            <TodoItem
                todo={mockTodo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
            />
        );

        expect(screen.getByText('Test Todo')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should toggle todo completion status', () => {
        const onToggle = jest.fn();
        const onDelete = jest.fn();
        const onUpdate = jest.fn();

        render(
            <TodoItem
                todo={mockTodo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(onToggle).toHaveBeenCalledWith('1', true);
    });

    it('should call onDelete when delete button is clicked', () => {
        const onToggle = jest.fn();
        const onDelete = jest.fn();
        const onUpdate = jest.fn();

        render(
            <TodoItem
                todo={mockTodo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
            />
        );

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('should enter edit mode when edit button is clicked', () => {
        const onToggle = jest.fn();
        const onDelete = jest.fn();
        const onUpdate = jest.fn();

        render(
            <TodoItem
                todo={mockTodo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
            />
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);

        expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });

    it('should update todo when save is clicked', async () => {
        const onToggle = jest.fn();
        const onDelete = jest.fn();
        const onUpdate = jest.fn().mockResolvedValue(undefined);

        render(
            <TodoItem
                todo={mockTodo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
            />
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        fireEvent.click(editButton);

        const titleInput = screen.getByDisplayValue('Test Todo') as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: 'Updated Todo' } });

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(onUpdate).toHaveBeenCalledWith('1', {
                title: 'Updated Todo',
                description: 'Test Description',
            });
        });
    });
});
