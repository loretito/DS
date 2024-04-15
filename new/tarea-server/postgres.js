const postgres = require('postgres');

const sql = postgres('postgres://postgres:postgres@192.168.16.3:5432/ramos')

module.exports = sql;