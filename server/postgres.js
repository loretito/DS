const postgres = require('postgres');

const sql = postgres('postgres://postgres:postgres@172.21.0.3:5432/ramos')

module.exports = sql;