const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres', // change to your postgres user
  host: 'localhost',
  database: 'grocerydb', // change to your database name
  password: 'postgres', // change to your postgres password
  port: 5432,
});

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password, phone, shop_name ,name } = req.body;
  if (!email || !password || !phone || !shop_name || !name) return res.status(400).json({ error: 'All fields are required' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (email, password, phone, shop_name) VALUES ($1, $2, $3, $4)', [email, hashed, phone, shop_name]);
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'User already exists' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret');
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/stock', authenticate, async (req, res) => {
    console.log("inside backend");
  const { product_name, quantity, costprice, sellingprice } = req.body;
  const user_id = req.user.id; // Extracted from JWT
  console.log("user id:", user_id);
  if (!product_name || quantity == null || costprice == null || sellingprice == null)
    return res.status(400).json({ error: 'All fields required' });
  try {
    await pool.query(
      'INSERT INTO stock (user_id, product_name, quantity, costprice, sellingprice) VALUES ($1, $2, $3, $4, $5)',
      [user_id, product_name, quantity, costprice, sellingprice]
    );
    res.status(201).json({ message: 'Stock added' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/stock', authenticate, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT * FROM stock WHERE user_id = $1',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/update', authenticate, async (req, res) => {
  console.log("inside update server");
  console.log(req.body);
  const { id, ...data } = req.body;
  const user_id = req.user.id;
  console.log(user_id);

    try {
      await pool.query(
        'UPDATE stock SET product_name = $1, quantity = $2, costprice = $3, sellingprice = $4 WHERE id = $5 AND user_id = $6',
        [data.product_name, data.quantity, data.costprice, data.sellingprice, id, user_id]
      );
      res.json({ message: 'Stock updated' });
    } catch (err) {
      res.status(500).json({ error: 'Database error' });
    }
})

app.post('/delete', authenticate, async (req, res) => {
  const { id } = req.body;
  const user_id = req.user.id;
  console.log(id,user_id);

  try {
    await pool.query(
      'DELETE FROM stock WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ message: 'Stock deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

//Shop name to display in bill
app.get('/user/shopname', authenticate, async (req, res) => {
    console.log("inside shop name");
  const user_id = req.user.id;
    console.log(user_id);
  try {
    const result = await pool.query('SELECT shop_name FROM users WHERE id = $1', [user_id]);
    if (result.rows.length > 0) {
      res.json({ shop_name: result.rows[0].shop_name });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });

  }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));
