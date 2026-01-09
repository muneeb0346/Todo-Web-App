import { fetchTodos, addTodo, updateTodo, deleteTodo } from '../api';

global.fetch = jest.fn();

describe('API Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.VITE_API_URL = 'http://localhost:5000';
    });

    describe('fetchTodos', () => {
        it('should fetch all todos', async () => {
            const mockTodos = [
                {
                    id: '1',
                    title: 'Task 1',
                    completed: false,
                    createdAt: new Date(),
                },
            ];

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockTodos,
            });

            const result = await fetchTodos();
            expect(result).toEqual(mockTodos);
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/todos');
        });
    });

    describe('addTodo', () => {
        it('should add a new todo', async () => {
            const newTodo = {
                id: '3',
                title: 'New Task',
                completed: false,
                createdAt: new Date(),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => newTodo,
            });

            const result = await addTodo('New Task');
            expect(result).toEqual(newTodo);
        });
    });

    describe('updateTodo', () => {
        it('should update todo completion status', async () => {
            const updatedTodo = {
                id: '1',
                title: 'Task 1',
                completed: true,
                createdAt: new Date(),
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => updatedTodo,
            });

            const result = await updateTodo('1', { completed: true });
            expect(result).toEqual(updatedTodo);
        });
    });

    describe('deleteTodo', () => {
        it('should delete a todo', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
            });

            await deleteTodo('1');
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:5000/api/todos/1',
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });
    });
});
