// import express to create router for task management routes
const express = require('express');
// import uuid to generate unique task ids
const { v4: uuidv4 } = require('uuid');
// import my database connection pool
const db = require('../config/db');
// import my logger to log task operations
const logger = require('../config/logger');
// import authentication middleware to protect these routes
const authMiddleware = require('../middleware/auth');

// create a new router instance for task routes
const router = express.Router();

// All routes require authentication
// apply auth middleware to all routes in this router
router.use(authMiddleware);

// Get all tasks for logged-in user
// handle fetching all tasks - GET /tasks
router.get('/', async (req, res) => {
  try {
    // query database to get all tasks for the current user, ordered by newest first
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    // log the fetch operation with task count
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'TASKS_FETCHED',
        userId: req.userId,
        count: tasks.length,
      })
    );

    // return the tasks array to the client
    res.json({ tasks });
  } catch (error) {
    // log any errors that occur while fetching tasks
    logger.error('Fetch tasks error:', error.message);
    // return error response
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create new task
// handle creating a new task - POST /tasks
router.post('/', async (req, res) => {
  try {
    // extract task details from request body
    const { title, description, status } = req.body;

    // validate that title is provided
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // generate a unique id for the new task
    const taskId = uuidv4();

    // insert the new task into database with user id and default values
    await db.query(
      'INSERT INTO tasks (id, user_id, title, description, status) VALUES (?, ?, ?, ?, ?)',
      [taskId, req.userId, title, description || '', status || 'pending']
    );

    // log the task creation with task id and operation type
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'TASK_CREATED',
        userId: req.userId,
        taskId: taskId,
        operation: 'INSERT',
      })
    );

    // return success response with the new task id
    res.status(201).json({ message: 'Task created', taskId });
  } catch (error) {
    // log any errors that occur during task creation
    logger.error('Create task error:', error.message);
    // return error response
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
// handle updating an existing task - PUT /tasks/:id
router.put('/:id', async (req, res) => {
  try {
    // extract task id from url parameters
    const { id } = req.params;
    // extract updated task details from request body
    const { title, description, status } = req.body;

    // Verify task belongs to user
    // check if task exists and belongs to the current user
    const [tasks] = await db.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [
      id,
      req.userId,
    ]);

    // if task not found or doesn't belong to user, return error
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // update the task with new values
    await db.query('UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?', [
      title,
      description,
      status,
      id,
    ]);

    // log the update operation
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'TASK_UPDATED',
        userId: req.userId,
        taskId: id,
        operation: 'UPDATE',
      })
    );

    // return success response
    res.json({ message: 'Task updated' });
  } catch (error) {
    // log any errors that occur during task update
    logger.error('Update task error:', error.message);
    // return error response
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
// handle deleting a task - DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    // extract task id from url parameters
    const { id } = req.params;

    // Verify task belongs to user
    // check if task exists and belongs to the current user
    const [tasks] = await db.query('SELECT id FROM tasks WHERE id = ? AND user_id = ?', [
      id,
      req.userId,
    ]);

    // if task not found or doesn't belong to user, return error
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // delete the task from database
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);

    // log the deletion operation
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        action: 'TASK_DELETED',
        userId: req.userId,
        taskId: id,
        operation: 'DELETE',
      })
    );

    // return success response
    res.json({ message: 'Task deleted' });
  } catch (error) {
    // log any errors that occur during task deletion
    logger.error('Delete task error:', error.message);
    // return error response
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
