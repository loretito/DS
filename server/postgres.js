const postgres = require('postgres');

const sql = postgres('postgres://postgres:postgres@173.40.0.10:5432/ramos')

module.exports = sql;