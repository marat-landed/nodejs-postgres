const PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
const pg = require('pg');
const { Client, Query } = require('pg');

//const connectString = process.env.DATABASE_URL || 'postgres://localhost:5432/todo';
/*
const connectString = {
  user: 'postgres',
  password: 'postgres',	
  database: 'postgres'
};
*/
console.log(process.env.POSTGRESQL_USER,process.env.POSTGRESQL_PASSWORD,process.env.POSTGRESQL_DATABASE);
if (process.env.POSTGRESQL_USER) {
  var connectString = {
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,	
    database: process.env.POSTGRESQL_DATABASE
  }
  var postgresqlServiceHost = process.env["POSTGRESQL_SERVICE_HOST"];
  var postgresqlServicePort = process.env["POSTGRESQL_SERVICE_PORT"];
  var postgresqlDatabase = process.env["POSTGRESQL_DATABASE"];
  var postgresqlUser = process.env["POSTGRESQL_USER"];
  var postgresqlPassword = process.env["POSTGRESQL_PASSWORD"];

  var connectString = "postgresql://" + postgresqlUser + ":" + postgresqlPassword + "@" + postgresqlServiceHost + "/" + postgresqlDatabase;
  var connectString = "postgresql://" + postgresqlUser + ":" + postgresqlPassword + "@" + postgresqlServiceHost + ":" + postgresqlServicePort;	
  // const connectString = postgresql://user:password@host:port
  // const connectString = postgres://user:password@hostname/database	
	
  /*	
  //mongodb configuration
  var mongoHost = process.env.OPENSHIFT_MONGODB_DB_HOST || 'localhost';
  var mongoPort = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
  var mongoUser = ''; //mongodb username
  var mongoPass = ''; //mongodb password
  var mongoDb   = ''; //mongodb database name

  //mysql configuration
  var mysqlHost = process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost';
  var mysqlPort = process.env.OPENSHIFT_MYSQL_DB_PORT || 3306;
  var mysqlUser = ''; //mysql username
  var mysqlPass = ''; //mysql password
  var mysqlDb   = ''; //mysql database name
  */

  //postgresql configuration
  var postgresqlHost = process.env.OPENSHIFT_POSTGRESQL_DB_HOST || 'localhost'; 
  var postgresqlPort = process.env.OPENSHIFT_POSTGRESQL_DB_PORT || 5432;
  var postgresqlUser = process.env["POSTGRESQL_USER"]; //mysql username
  var postgresqlPass = process.env["POSTGRESQL_PASSWORD"]; //mysql password
  var postgresqlDb   = process.env["POSTGRESQL_DATABASE"]; //mysql database name	
  // Connection URL: postgresql://$OPENSHIFT_POSTGRESQL_DB_HOST:$OPENSHIFT_POSTGRESQL_DB_PORT/
  // echo $OPENSHIFT_POSTGRESQL_DB_PORT ----> 5432	
  // Connection URL: postgresql://$OPENSHIFT_POSTGRESQL_DB_HOST:$OPENSHIFT_POSTGRESQL_DB_PORT	
	
  //connection strings
  //var mongoString = 'mongodb://' + mongoUser + ':' + mongoPass + '@' + mongoHost + ':' + mongoPort + '/' + mongoDb;
  //var mysqlString = 'mysql://' + mysqlUser + ':' + mysqlPass + '@' + mysqlHost + ':' + mysqlPort + '/' + mysqlDb;
  var connectString = 'postgresql://' + postgresqlUser + ':' + postgresqlPass + '@' + postgresqlHost + ':' + postgresqlPort + '/' + postgresqlDb;	
	
} else {
  var connectString = {
    user: 'postgres',
    password: 'postgres',	
    database: 'postgres'
  };	
}	



console.log(connectString);

/*
const connectString = {
  connectionString: process.env.DATABASE_URL, // Heroku DATABASE_URL = OpenShift OPENSHIFT_POSTGRESQL_DB_URL это v.2, а не v.3
  ssl: true
};
*/
/*
Документация OpenShift показывает, что строка соединения PostgreSQL должна выглядеть так:
	const connectString = postgresql://user:password@host:port
Однако документация DataMapper показывает, что строка подключения PostgreSQL должна выглядеть так:
	const connectString = postgres://user:password@hostname/database
	
POSTGRESQL_USER
POSTGRESQL_PASSWORD
POSTGRESQL_DATABASE

mongoURL = mongoUser + ':' + mongoPassword + '@' + mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
*/
app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/postgres', function(req, res) {
  var client = new Client(connectString);
  client.connect();
  var query = client.query(Query('CREATE TABLE IF NOT EXISTS items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)'));
  query.on('end', () => {
	console.log("Table items created");  
  });
	
  //await	
  const data = {text: "test", complete: false};	
  client.query('INSERT INTO items(text, complete) values($1, $2)', [data.text, data.complete], function(err, result) {
    if (err) {
      console.log(err);
    } else {
	  console.log(result.rowCount);	
    }
    console.log('Client will end now!!!');
  });  

  client.query('SELECT * FROM items ORDER BY id ASC', (err, res2) => {
	var str = "";  
	res2.rows.forEach(row => {
      str+= row.id + " " + row.text + " " + row.complete + "</br>";
    });
	res.send(str);  
    client.end();  
  });
});

app.listen(PORT, function () {
  console.log(`Express server is listening on ${PORT}`);
});