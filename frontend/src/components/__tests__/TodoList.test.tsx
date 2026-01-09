import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoList from '../TodoList';
import * as api from '../../services/api';

jest.mock('../../services/api');

const mockTodos = [
    {
        id: '1',
        title: 'Task 1',
        description: 'Desc 1',
        completed: false,
        createdAt: new Date('2024-01-01'),
    },
    {
        id: '2',
        title: 'Task 2',
        completed: true,
        createdAt: new Date('2024-01-02'),
    },
];

describe('TodoList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (api.fetchTodos as jest.Mock).mockResolvedValue(mockTodos);
    });

    it('should load and display todos on mount', async () => {
        render(<TodoList />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
            expect(screen.getByText('Task 2')).toBeInTheDocument();
        });
    });

    it('should display error message on fetch failure', async () => {
        (api.fetchTodos as jest.Mock).mockRejectedValueOnce(new Error('Failed'));

        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load todos')).toBeInTheDocument();
        });
    });

    it('should display empty state when no todos', async () => {
        (api.fetchTodos as jest.Mock).mockResolvedValueOnce([]);

        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('No todos yet. Add your first task.')).toBeInTheDocument();
        });
    });

    it('should show correct active and completed counts', async () => {
        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('1 active · 1 completed')).toBeInTheDocument();
        });
    });

    it('should filter todos by active status', async () => {
        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const activeButton = screen.getByRole('button', { name: /show active todos/i });
        fireEvent.click(activeButton);

        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    it('should add new todo', async () => {
        const newTodo = {
            id: '3',
            title: 'New Task',
            completed: false,
            createdAt: new Date(),
        };

        (api.addTodo as jest.Mock).mockResolvedValueOnce(newTodo);

        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const addButton = screen.getByRole('button', { name: /add new todo/i });
        fireEvent.click(addButton);

        const titleInput = screen.getByPlaceholderText('Add a task title...');
        fireEvent.change(titleInput, { target: { value: 'New Task' } });

        const submitButton = screen.getByRole('button', { name: /add todo/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(api.addTodo).toHaveBeenCalledWith('New Task', undefined);
        });
    });

    it('should toggle todo completion', async () => {
        (api.updateTodo as jest.Mock).mockResolvedValueOnce({ ...mockTodos[0], completed: true });

        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const checkbox = screen.getAllByRole('checkbox')[0];
        fireEvent.click(checkbox);

        await waitFor(() => {
            expect(api.updateTodo).toHaveBeenCalledWith('1', { completed: true });
        });
    });

    it('should delete todo with undo option', async () => {
        (api.deleteTodo as jest.Mock).mockResolvedValueOnce(undefined);

        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText('Todo deleted')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /undo delete/i })).toBeInTheDocument();
    });

    it('should show total count', async () => {
        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('Total: 2')).toBeInTheDocument();
        });
    });

    it('should show modal when add new todo button is clicked', async () => {
        render(<TodoList />);

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });

        const addButton = screen.getByRole('button', { name: /add new todo/i });
        fireEvent.click(addButton);

        expect(screen.getByPlaceholderText('Add a task title...')).toBeInTheDocument();
    });
});
