const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const migrationSql = `
  ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS has_alarm BOOLEAN DEFAULT FALSE;
`;

console.log('Connecting to database...');

pool.connect()
    .then(client => {
        console.log('Connected. Running migration...');
        return client.query(migrationSql)
            .then(() => {
                console.log('Migration applied successfully!');
                client.release();
                pool.end();
            })
            .catch(err => {
                console.error('Error applying migration:', err);
                client.release();
                pool.end();
                process.exit(1);
            });
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
        process.exit(1);
    });
