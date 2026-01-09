import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoForm from '../TodoForm';

describe('TodoForm', () => {
    it('should render form with title and description inputs', () => {
        const onAdd = jest.fn();
        render(<TodoForm onAdd={onAdd} />);

        expect(screen.getByPlaceholderText('Add a task title...')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Optional description')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
    });

    it('should update title input on change', () => {
        const onAdd = jest.fn();
        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Add a task title...') as HTMLInputElement;
        fireEvent.change(titleInput, { target: { value: 'New Task' } });

        expect(titleInput.value).toBe('New Task');
    });

    it('should update description input on change', () => {
        const onAdd = jest.fn();
        render(<TodoForm onAdd={onAdd} />);

        const descInput = screen.getByPlaceholderText('Optional description') as HTMLInputElement;
        fireEvent.change(descInput, { target: { value: 'Task description' } });

        expect(descInput.value).toBe('Task description');
    });

    it('should call onAdd when form is submitted with valid title', async () => {
        const onAdd = jest.fn().mockResolvedValue(undefined);
        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Add a task title...');
        const submitButton = screen.getByRole('button', { name: /add todo/i });

        fireEvent.change(titleInput, { target: { value: 'Test Task' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(onAdd).toHaveBeenCalledWith('Test Task', undefined);
        });
    });

    it('should call onAdd with title and description', async () => {
        const onAdd = jest.fn().mockResolvedValue(undefined);
        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Add a task title...');
        const descInput = screen.getByPlaceholderText('Optional description');
        const submitButton = screen.getByRole('button', { name: /add todo/i });

        fireEvent.change(titleInput, { target: { value: 'Test Task' } });
        fireEvent.change(descInput, { target: { value: 'Test Description' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(onAdd).toHaveBeenCalledWith('Test Task', 'Test Description');
        });
    });

    it('should clear inputs after successful submit', async () => {
        const onAdd = jest.fn().mockResolvedValue(undefined);
        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Add a task title...') as HTMLInputElement;
        const descInput = screen.getByPlaceholderText('Optional description') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: /add todo/i });

        fireEvent.change(titleInput, { target: { value: 'Test Task' } });
        fireEvent.change(descInput, { target: { value: 'Test Description' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(titleInput.value).toBe('');
            expect(descInput.value).toBe('');
        });
    });

    it('should disable submit button while submitting', async () => {
        const onAdd = jest.fn(
            () => new Promise<void>(resolve => setTimeout(resolve, 100))
        );
        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Add a task title...');
        const submitButton = screen.getByRole('button', { name: /add todo/i }) as HTMLButtonElement;

        fireEvent.change(titleInput, { target: { value: 'Test Task' } });
        fireEvent.click(submitButton);

        expect(submitButton.disabled).toBe(true);
        expect(screen.getByText('Adding...')).toBeInTheDocument();

        await waitFor(() => {
            expect(submitButton.disabled).toBe(false);
        });
    });

    it('should not submit if title is empty', () => {
        const onAdd = jest.fn();
        render(<TodoForm onAdd={onAdd} />);

        const submitButton = screen.getByRole('button', { name: /add todo/i });
        fireEvent.click(submitButton);

        expect(onAdd).not.toHaveBeenCalled();
    });

    it('should trim whitespace from title and description', async () => {
        const onAdd = jest.fn().mockResolvedValue(undefined);
        render(<TodoForm onAdd={onAdd} />);

        const titleInput = screen.getByPlaceholderText('Add a task title...');
        const descInput = screen.getByPlaceholderText('Optional description');
        const submitButton = screen.getByRole('button', { name: /add todo/i });

        fireEvent.change(titleInput, { target: { value: '  Test Task  ' } });
        fireEvent.change(descInput, { target: { value: '  Test Desc  ' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(onAdd).toHaveBeenCalledWith('Test Task', 'Test Desc');
        });
    });
});
