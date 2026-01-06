const { Pool } = require('pg');
const fs = require('fs');
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

const schemaPath = path.join(__dirname, '../src/db/schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

console.log('Connecting to database...');

pool.connect()
    .then(client => {
        console.log('Connected. Running schema...');
        return client.query(schemaSql)
            .then(() => {
                console.log('Schema applied successfully!');
                client.release();
                pool.end();
            })
            .catch(err => {
                console.error('Error applying schema:', err);
                client.release();
                pool.end();
                process.exit(1);
            });
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
        process.exit(1);
    });
