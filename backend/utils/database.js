/**
 * Database Abstraction Layer
 * 
 * Supports both PostgreSQL (production) and SQLite (local development).
 * When DATABASE_URL is set, uses PostgreSQL. Otherwise falls back to SQLite.
 * 
 * Provides a unified API: db.run(), db.get(), db.all(), db.serialize()
 * compatible with SQLite's callback-based interface.
 */

const path = require('path');

/**
 * PostgreSQL wrapper that mimics SQLite's callback API
 * Converts ? placeholders to $1, $2, etc.
 * Normalizes error messages for compatibility
 */
class PgDatabase {
  constructor(pool) {
    this.pool = pool;
    this.type = 'pg';
  }

  /**
   * Convert SQLite-style ? placeholders to PostgreSQL $1, $2, etc.
   * Skips ? inside string literals.
   */
  _convertPlaceholders(sql) {
    let paramIndex = 0;
    let inString = false;
    let stringChar = '';
    let result = '';

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];

      if (inString) {
        result += char;
        if (char === stringChar && sql[i - 1] !== '\\') {
          inString = false;
        }
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

  /**
   * Normalize PostgreSQL errors to match SQLite error patterns
   */
  _normalizeError(err) {
    if (err.code === '23505') {
      // Unique constraint violation
      err.message = 'UNIQUE constraint failed: ' + (err.detail || err.message);
    } else if (err.code === '23503') {
      // Foreign key violation
      err.message = 'FOREIGN KEY constraint failed: ' + (err.detail || err.message);
    }
    return err;
  }

  /**
   * Execute SQL that modifies data (INSERT, UPDATE, DELETE)
   * Callback receives `this.lastID` and `this.changes` like SQLite
   */
  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    let pgSql = this._convertPlaceholders(sql);

    // Add RETURNING id for INSERT statements to get lastID
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

  /**
   * Execute SQL and return a single row
   */
  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    const pgSql = this._convertPlaceholders(sql);

    this.pool.query(pgSql, params || [])
      .then(result => {
        if (callback) callback(null, result.rows[0] || null);
      })
      .catch(err => {
        this._normalizeError(err);
        if (callback) callback(err);
      });
  }

  /**
   * Execute SQL and return all rows
   */
  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }

    const pgSql = this._convertPlaceholders(sql);

    this.pool.query(pgSql, params || [])
      .then(result => {
        if (callback) callback(null, result.rows);
      })
      .catch(err => {
        this._normalizeError(err);
        if (callback) callback(err);
      });
  }

  /**
   * No-op for PostgreSQL (SQLite uses this for sequential execution)
   */
  serialize(fn) {
    if (fn) fn();
  }

  /**
   * Close the pool
   */
  async close() {
    await this.pool.end();
  }
}

/**
 * Create and return a database connection
 * @returns {Promise<PgDatabase|sqlite3.Database>}
 */
async function connectDatabase() {
  if (process.env.DATABASE_URL) {
    // PostgreSQL mode
    const { Pool } = require('pg');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    // Test connection
    try {
      const client = await pool.connect();
      client.release();
      console.log('✓ Connected to PostgreSQL database');
    } catch (err) {
      console.error('❌ PostgreSQL connection failed:', err.message);
      throw err;
    }

    return new PgDatabase(pool);
  } else {
    // SQLite fallback for local development
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, '..', 'db_crime.sqlite');

    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ SQLite connection failed:', err.message);
          reject(err);
        } else {
          db.type = 'sqlite';
          console.log('✓ Connected to SQLite database');
          resolve(db);
        }
      });
    });
  }
}

module.exports = { connectDatabase, PgDatabase };
