import mariadb from 'mariadb';
import express from 'express';
import { config } from 'dotenv';
config();
import cors from 'cors';

const PORT = process.env.PORT || 3000; // Provide a default value if PORT is not set in .env
const HOST = process.env.HOST || 'localhost'; // Provide a default value if HOST is not set in .env
const app = express();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const data = await connection.query('SELECT * FROM ideas;');
    // Convert BigInt values to strings in the response
    const serializedData = data.map((item) => {
      return {
        ...item,
        id: item.id.toString(), // Assuming 'id' is a BigInt property
        // Convert other BigInt properties if needed
      };
    });

    res.send(serializedData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/ideas/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const prepare = await connection.prepare(
      'SELECT * FROM ideas WHERE id = ?'
    );
    const data = await prepare.execute([req.params.id]);
    // Convert BigInt values to strings in the response
    const serializedData = data.map((item) => {
      return {
        ...item,
        id: item.id.toString(), // Assuming 'id' is a BigInt property
        // Convert other BigInt properties if needed
      };
    });
    res.send(serializedData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .send({ error: 'Title and description are required' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.query(
      'INSERT INTO ideas (title, description, time_created) VALUES (?, ?, NOW())',
      [title, description]
    );
    // Convert BigInt values to strings in the response
    const serializedResult = {
      id: result.insertId.toString(), // Assuming 'id' is a BigInt property
      title,
      description,
    };

    res.status(201).send(serializedResult);
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).send({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/ideas/:id', async (req, res) => {
  const ideaId = req.params.id;

  let connection;
  try {
    connection = await pool.getConnection();
    const statement = await connection.prepare(
      'DELETE FROM ideas WHERE id = ?'
    );
    const result = await statement.execute([ideaId]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: `Idea with ID ${ideaId} not found` });
    }

    res
      .status(200)
      .send({ message: `Idea with ID ${ideaId} deleted successfully` });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).send({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/ideas/:id', async (req, res) => {
  const ideaId = req.params.id;
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .send({ error: 'Tittle and description are required' });
  }
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.query(
      'UPDATE ideas SET title=?, description=? WHERE id=?',
      [title, description, ideaId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send({ error: `Idea with ID ${ideaId} not found` });
    }
    res
      .status(200)
      .send({ message: `Idea with ID ${ideaId} updated succesfully ` });
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).send({ error: error.message });
  } finally {
    if (connection) connection.release();
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://${HOST}:${PORT}`);
});
