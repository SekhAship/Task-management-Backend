const pool = require('../db/db');

const getAllTasks = async (req, res) => {
    try {
        console.log('GET /api/tasks request. Query:', req.query); 
        const { status } = req.query;
        let query = 'SELECT * FROM tasks';
        const params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const createTask = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const newTask = await pool.query(
            `INSERT INTO tasks (title, description)
             VALUES ($1, $2)
             RETURNING *`,
            [title, description || null]
        );

        const task = newTask.rows[0];

        // Emit socket event
        req.io.emit('taskCreated', task);

        res.status(201).json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const update = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (update.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const task = update.rows[0];
        req.io.emit('taskUpdated', task);

        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteOp = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);

        if (deleteOp.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        req.io.emit('taskDeleted', id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAllTasks,
    createTask,
    updateTaskStatus,
    deleteTask
};
