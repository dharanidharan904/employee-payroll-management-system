import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "payroll_db",
  password: "dharani392006",   // change this
  port: 5432
});

pool.connect()
  .then(() => console.log("PostgreSQL connected successfully"))
  .catch((err) => console.error("DB connection failed:", err));

export default pool;