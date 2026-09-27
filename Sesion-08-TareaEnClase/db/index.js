require('dotenv').config();

const { Sequelize } = require('sequelize');
const { Pool } = require('pg');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');

const DB = process.env.DB;

const sequelize = new Sequelize(DB, { logging: false });

const PGStore = connectPgSimple(session);

const sessionStore = new PGStore({
  pool: new Pool({ connectionString: DB }),
  tableName: 'session',
  createTableIfMissing: true
});

module.exports = { sequelize, sessionStore, DB };
