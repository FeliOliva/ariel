const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "154254693feli",
  database: process.env.DB_NAME || "ariel2db",
});

connection.connect((err) => {
  if (err) {
    console.log(err);
    console.log("No se ha podido conectar con la base de datos");
  } else {
    console.log("Conectado a la base de datos");
  }
});

module.exports = connection.promise();
