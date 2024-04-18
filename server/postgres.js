const postgres = require('postgres');

const sql = postgres('postgres://postgres:postgres@172.23.0.2:5432/ramos')

module.exports = sql;