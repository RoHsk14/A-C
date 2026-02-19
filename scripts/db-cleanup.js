const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres";

async function runCleanup() {
    const client = new Client({
        connectionString: DATABASE_URL,
    });

    try {
        await client.connect();

        const sqlPath = path.join(__dirname, '../migration_cleanup_filtering.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running SQL from migration_cleanup_filtering.sql...');
        await client.query(sql);
        console.log('Cleanup completed successfully.');

    } catch (err) {
        console.error('Error running cleanup:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runCleanup();
