/*
 *To get mongodb running, navigate to its
 *bin, then run "net start mongodb".
 *Hit enter, then run, "mongo".
 *Weather API key = &APPID=ccd5b60fb64d15bde59e5f5f62d199cf
 *Metric stuffies = &APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric
 */

//Deals with the weather API
var http = require('http');
var kgnurl = 'http://api.openweathermap.org/data/2.5/weather?q=Kingston,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric';
var mburl = 'http://api.openweathermap.org/data/2.5/weather?q=Montego%20Bay,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric';



//Deals with other modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

//Ensure you remember to install mongojs --save
var mongojs = require('mongojs');
var db = mongojs('notifapp', ['employees']);


var app = express();

//Object employees
var employees = [
	{
		id: 1,
		fnm: "Dave",
		lnm: "Raidlein",
		email: "rhodendavid123@gmail.com"
	},
	{
		id: 2,
		fnm: "David",
		lnm: "Rhoden",
		email: "rhodendavid@live.com"
	},
	{
		id: 3,
		fnm: "Tiffany",
		lnm: "Fisher",
		email: "tif.red.carter@gmail.com"
	}
]


//Middlewares - order of middleware is important,
//it must come before the route handler
//Body-Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Ejs Middleware/View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Static Path
//File in static folder HAS to be named index.html
app.use(express.static(path.join(__dirname, 'public')));

//route for app
app.get('/', function(req, res){
	/*
	//res.json(people);
	//res.send("Wah gwaan?");
	var data = JSON.parse(body);

	//Weather logic stuffies here
	var request = require('request');
	request(kgnurl, function(err, res, body){
		console.log(body);
		response.render();
		res.end();
	});
	*/

	res.render('index', {
		title: 'Employees',
		kgnurl: 'http://api.openweathermap.org/data/2.5/weather?q=Kingston,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric',
		mburl: 'http://api.openweathermap.org/data/2.5/weather?q=Montego%20Bay,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric',
		employees: employees
	});
});

//Listening on port 3000 
app.listen(3000, function(){
	console.log('Server started on port 3000...');
	/*
	var request = require('request');
	request(kgnurl, function(err, res, body){
		console.log(body);
		response.render();
		res.end();
	});
	*/
})

//var server = http.createServer(function(req, res){}).listen(3001);