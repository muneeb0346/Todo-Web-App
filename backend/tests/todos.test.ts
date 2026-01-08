import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Todo API', () => {
    beforeEach(async () => {
        const response = await request(app).get('/api/todos');
        const todos = response.body;
        for (const todo of todos) {
            await request(app).delete(`/api/todos/${todo.id}`);
        }
    });

    describe('GET /api/todos', () => {
        it('should return empty array initially', async () => {
            const response = await request(app).get('/api/todos');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('should return all todos', async () => {
            await request(app)
                .post('/api/todos')
                .send({ title: 'Todo 1' });
            await request(app)
                .post('/api/todos')
                .send({ title: 'Todo 2' });

            const response = await request(app).get('/api/todos');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].title).toBe('Todo 1');
            expect(response.body[1].title).toBe('Todo 2');
        });
    });

    describe('POST /api/todos', () => {
        it('should create a new todo with title only', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe('Test Todo');
            expect(response.body.completed).toBe(false);
            expect(response.body).toHaveProperty('createdAt');
        });

        it('should create a new todo with title and description', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({
                    title: 'Test Todo',
                    description: 'Description'
                });

            expect(response.status).toBe(201);
            expect(response.body.title).toBe('Test Todo');
            expect(response.body.description).toBe('Description');
            expect(response.body.completed).toBe(false);
        });

        it('should return 400 if title is missing', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toBe('Title is required');
        });

        it('should return 400 if title is empty string', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: '' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Title is required');
        });

        it('should return 400 if title is only whitespace', async () => {
            const response = await request(app)
                .post('/api/todos')
                .send({ title: ' ' });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Title is required');
        });
    });

    describe('PUT /api/todos/:id', () => {
        it('should update todo completion status', async () => {
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' });

            const todoId = createResponse.body.id;

            const updateResponse = await request(app)
                .put(`/api/todos/${todoId}`)
                .send({ completed: true });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.id).toBe(todoId);
            expect(updateResponse.body.completed).toBe(true);
        });

        it('should update todo title and description', async () => {
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Original Title' });

            const todoId = createResponse.body.id;

            const updateResponse = await request(app)
                .put(`/api/todos/${todoId}`)
                .send({
                    title: 'Updated Title',
                    description: 'Updated Description'
                });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.title).toBe('Updated Title');
            expect(updateResponse.body.description).toBe('Updated Description');
        });

        it('should update only specified fields', async () => {
            const createResponse = await request(app)
                .post('/api/todos')
                .send({
                    title: 'Original Title',
                    description: 'Original Description'
                });

            const todoId = createResponse.body.id;

            const updateResponse = await request(app)
                .put(`/api/todos/${todoId}`)
                .send({ completed: true });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.completed).toBe(true);
            expect(updateResponse.body.title).toBe('Original Title');
            expect(updateResponse.body.description).toBe('Original Description');
        });

        it('should return 404 for non-existent todo', async () => {
            const response = await request(app)
                .put('/api/todos/000000')
                .send({ completed: true });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Todo not found');
        });
    });

    describe('DELETE /api/todos/:id', () => {
        it('should delete a todo', async () => {
            const createResponse = await request(app)
                .post('/api/todos')
                .send({ title: 'Test Todo' });

            const todoId = createResponse.body.id;

            const deleteResponse = await request(app)
                .delete(`/api/todos/${todoId}`);

            expect(deleteResponse.status).toBe(204);
            expect(deleteResponse.body).toEqual({});

            const getResponse = await request(app).get('/api/todos');
            expect(getResponse.body).toHaveLength(0);
        });

        it('should return 404 when deleting non-existent todo', async () => {
            const response = await request(app)
                .delete('/api/todos/000000');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Todo not found');
        });

        it('should only delete the specified todo', async () => {
            const todo1 = await request(app)
                .post('/api/todos')
                .send({ title: 'Todo 1' });
            const todo2 = await request(app)
                .post('/api/todos')
                .send({ title: 'Todo 2' });

            await request(app).delete(`/api/todos/${todo1.body.id}`);

            const response = await request(app).get('/api/todos');
            expect(response.body).toHaveLength(1);
            expect(response.body[0].id).toBe(todo2.body.id);
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete workflow: create, update, delete', async () => {
            const createResponse = await request(app)
                .post('/api/todos')
                .send({
                    title: 'Learn Vitest',
                    description: 'Write comprehensive tests'
                });

            expect(createResponse.status).toBe(201);
            const todoId = createResponse.body.id;

            let getResponse = await request(app).get('/api/todos');
            expect(getResponse.body).toHaveLength(1);

            const updateResponse = await request(app)
                .put(`/api/todos/${todoId}`)
                .send({ completed: true });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.completed).toBe(true);

            const deleteResponse = await request(app)
                .delete(`/api/todos/${todoId}`);

            expect(deleteResponse.status).toBe(204);

            getResponse = await request(app).get('/api/todos');
            expect(getResponse.body).toHaveLength(0);
        });

        it('should handle multiple todos correctly', async () => {
            const todos = await Promise.all([
                request(app).post('/api/todos').send({ title: 'Todo 1' }),
                request(app).post('/api/todos').send({ title: 'Todo 2' }),
                request(app).post('/api/todos').send({ title: 'Todo 3' })
            ]);

            await request(app)
                .put(`/api/todos/${todos[1].body.id}`)
                .send({ completed: true });

            const response = await request(app).get('/api/todos');
            expect(response.body).toHaveLength(3);
            expect(response.body[1].completed).toBe(true);
            expect(response.body[0].completed).toBe(false);
            expect(response.body[2].completed).toBe(false);
        });
    });
});
