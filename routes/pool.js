var mysql = require("mysql");
var pool = mysql.createPool({
  host: "localhost",
  port: 3310,
  user: "root",
  password: "",
  database: "grip_bank",
  connectionLimit: 100,
});

module.exports = pool;
