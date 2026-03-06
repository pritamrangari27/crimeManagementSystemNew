/**
 * Database Layer — Supabase PostgreSQL
 * 
 * Connects to Supabase via SUPABASE_DB_URL (or DATABASE_URL fallback).
 * Provides a callback-based API: db.run(), db.get(), db.all()
 * with automatic ? → $1,$2 placeholder conversion.
 */

const { Pool } = require('pg');

class PgDatabase {
  constructor(pool) {
    this.pool = pool;
    this.type = 'pg';
  }

  /** Convert ? placeholders to $1, $2, etc. Skips ? inside string literals. */
  _convertPlaceholders(sql) {
    let paramIndex = 0;
    let inString = false;
    let stringChar = '';
    let result = '';

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      if (inString) {
        result += char;
        if (char === stringChar && sql[i - 1] !== '\\') inString = false;
      } else if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        result += char;
      } else if (char === '?') {
        paramIndex++;
        result += `$${paramIndex}`;
      } else {
        result += char;
      }
    }
    return result;
  }

  /** Normalize PG errors to consistent messages */
  _normalizeError(err) {
    if (err.code === '23505') {
      err.message = 'UNIQUE constraint failed: ' + (err.detail || err.message);
    } else if (err.code === '23503') {
      err.message = 'FOREIGN KEY constraint failed: ' + (err.detail || err.message);
    }
    return err;
  }

  /** Execute INSERT/UPDATE/DELETE. Callback gets this.lastID and this.changes */
  run(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    let pgSql = this._convertPlaceholders(sql);
    if (/^\s*INSERT/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
      pgSql += ' RETURNING id';
    }
    this.pool.query(pgSql, params || [])
      .then(result => {
        const context = {
          lastID: result.rows && result.rows[0] ? result.rows[0].id : null,
          changes: result.rowCount
        };
        if (callback) callback.call(context, null);
      })
      .catch(err => {
        this._normalizeError(err);
        if (callback) callback.call({ lastID: null, changes: 0 }, err);
      });
  }

  /** Execute SELECT and return a single row */
  get(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    const pgSql = this._convertPlaceholders(sql);
    this.pool.query(pgSql, params || [])
      .then(result => { if (callback) callback(null, result.rows[0] || null); })
      .catch(err => { this._normalizeError(err); if (callback) callback(err); });
  }

  /** Execute SELECT and return all rows */
  all(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    const pgSql = this._convertPlaceholders(sql);
    this.pool.query(pgSql, params || [])
      .then(result => { if (callback) callback(null, result.rows); })
      .catch(err => { this._normalizeError(err); if (callback) callback(err); });
  }

  /** No-op compatibility method */
  serialize(fn) { if (fn) fn(); }

  async close() { await this.pool.end(); }
}

/**
 * Connect to Supabase PostgreSQL
 * Requires SUPABASE_DB_URL or DATABASE_URL environment variable
 */
async function connectDatabase() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error('❌ FATAL: No database URL configured.');
    console.error('   Set SUPABASE_DB_URL in your .env file.');
    console.error('   Get it from: Supabase Dashboard → Connect → Connection String → URI');
    process.exit(1);
  }

  const isSupabase = dbUrl.includes('supabase');

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: isSupabase ? 20 : 10,
    idleTimeoutMillis: isSupabase ? 20000 : 30000,
    connectionTimeoutMillis: isSupabase ? 15000 : 10000,
  });

  pool.on('error', (err) => {
    console.error('Database pool error:', err.message);
  });

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    const label = isSupabase ? 'Supabase PostgreSQL' : 'PostgreSQL';
    console.log(`✓ Connected to ${label}`);
    console.log(`  Server: ${result.rows[0].version.split(',')[0]}`);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }

  return new PgDatabase(pool);
}

module.exports = { connectDatabase, PgDatabase };
