import pg from 'pg';
import dotenv from 'dotenv';
const { Pool, Client } = pg

dotenv.config();

console.log('user', process.env.DB_USER)

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: 5432
});

await pool.connect();

export const query = (text, params) => {
  return pool.query(text, params)
}