const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "154254693feli",
  database: "arieldb",
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
