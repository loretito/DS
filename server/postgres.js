const postgres = require('postgres');

const sql = postgres('postgres://postgres:postgres@192.168.32.2:5432/ramos')

module.exports = sql;