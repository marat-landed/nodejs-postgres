const PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();

const { Client, Query } = require('pg');
var colors = require('colors');

var dbOperations = require("./js/dbOperations.js");

const connectString = {
  user: 'postgres',
  password: 'postgres',	
  database: 'postgres'
};

/*
const connectString = {
  connectionString: process.env.DATABASE_URL,
  ssl: true
};
*/

// Configuration
//app.use(express.bodyParser());
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/css/fonts'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/utility/js'));

app.get('/',function(req,res){
  res.sendFile(__dirname + '/pages/index.html');
});

// Main route sends our HTML file
app.get('/get-forecasts-and-stat', function(req, res) {
  // Не используется. Необходима была только для показа всех прогнозов для ручной проверки сбора статистики. Вызывается как http://localhost:3000/get-all-forecasts
  res.sendFile(__dirname + '/utility/pages/get-forecasts-and-stat.html');
})

app.get('/get-forecasts', function(req, res) {
  // Вызываем добавление на страницу всех прогнозов. Используется для контроля всех прогнозов и обработки статистики (сравнении автоматической и ручной обработки). Вызывается из utility/js/statistics.js
  dbOperations.getStat(req,res);
});

app.get('/stat-load', function(req, res) {
  // Загружаем всю статистику из БД с главной страницы home.html.
  //dbOperations.getStatistics(req,res);
  // Возвращает статистику из БД. Вызывается из home-stat.js
  var client = new Client(connectString);
  client.connect();
  const query = client.query(Query("SELECT * from statistic;"));
  query.on("row", function (row, result) { 
    //console.log(row);	
    result.addRow(row);
  });
  query.on('end', function (result) {	  
	res.send(result.rows);	
  });
  query.on('error', (err) => {
    console.log('Select from table statistic error:',err);	
	console.error(err.stack);
  });
});

app.get('/home',function(req,res){
  res.sendFile(__dirname + '/pages/home.html');
});

app.get('/details',function(req,res){
  res.sendFile(__dirname + '/pages/details.html');
});

app.get('/about',function(req,res){
  res.sendFile(__dirname + '/pages/about.html');
});

app.get('/all', function(request, response){
  // Все прогнозы	
  var client = new Client(connectString);
  client.connect();
  const query = client.query(Query("SELECT * from forecasts;"));
  // select * from forecasts where utc_date in (select max(utc_date) from forecasts group by site_id, city_id);
  query.on("row", function (row, result) {  
    result.addRow(row);
	//console.log('row:',row);
  });
  query.on('end', function (result) {	  
    //response.send(JSON.stringify(result.rows));	
	response.send(result.rows);	
  });
  query.on('error', (err) => {
    console.log('Select from table forecasts error:',err);	
	console.error(err.stack);
  });	
});

app.get('/last', function(request, response){
  // Последние прогнозы	
  var client = new Client(connectString);
  client.connect();
  const query = client.query(Query("select * from forecasts where utc_date in (select max(utc_date) from forecasts group by site_id, city_id);"));
  query.on("row", function (row, result) {  
    result.addRow(row);
	//console.log('row:',row);
  });
  query.on('end', function (result) {	  
    //response.send(JSON.stringify(result.rows));	
	response.send(result.rows);	
  });
  query.on('error', (err) => {
    console.log('Select from table forecasts error:',err);	
	console.error(err.stack);
  });	
});

app.listen(PORT, function () {
  console.log(`Express server is listening on ${PORT}`);
});

//app.listen(3000);
//console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);