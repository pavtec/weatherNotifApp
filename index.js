/*
 *To get mongodb running, navigate to its
 *bin, then run "net start mongodb".
 *Hit enter, then run, "mongo".
 *Weather API key = &APPID=ccd5b60fb64d15bde59e5f5f62d199cf
 *Metric stuffies = &APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric
 *git add . -> git commit -m <<message>> -> git push |
 *
 *Database = Mongodb, Front end = JQuery, Back end = Node JS, check package.json for more details
 *Author - David Rhoden
 *Not fully complete nor optimized - Repetitive code and files may exist.
 *Remember to edit JQuery sections and use actual JQuery protocol;
 *by extension, edit routes.
 */

//Deals with the weather API
var http = require('http');
var kgnurl = 'http://api.openweathermap.org/data/2.5/forecast?q=Kingston,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric';
var mburl = 'http://api.openweathermap.org/data/2.5/forecast?q=Montego%20Bay,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric';

//Deals with emailing
var nodemailer = require('nodemailer');

//Deals with other modules
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

//Deals with mongodb:= npm install mongojs --save
var mongojs = require('mongojs');
var db = mongojs('notifapp', ['employees']);

//Deals with the express framework
var app = express();

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

//Deals with handling the emails sent, as well as the 
//notes sent along with them.
var request = require('request');
var kdata, kid, kmain, kdesc, kdate;
var mdata, mid, mmain, mdesc, mdate;
var d = new Date();
var hr = d.getHours();
var min = d.getMinutes();
var employees; //to grab the returned employees from the database
var x = db.employees.count(function(err, y){x = y;}); //grabs the amount of employees in database
var notice;

//====================================================================================================
//====================================================================================================
//====================================================================================================

//gets employees from db
function getEmployees(){
	db.employees.find(function(err, docs){
		employees = docs;	
		console.log("Retrieved Employees.");
	})
}

//Gets the weather forecast of Kgn
//Current goal -- To get it to check at 8:00pm (20:00) and send out emails based on the 
//forecast of the next day at every three hours
//GOAL NOT ACHIEVED, LOGIC IS ESTABLISHED
function getkWeather(){
	request(kgnurl, function(err, response, body){
		//console.log(body); //displays json object from API
		kdata = JSON.parse(body);
		kid = kdata.list[0].weather[0].id;
		kmain = kdata.list[0].weather[0].main;
		kdesc = kdata.list[0].weather[0].description;
		kdate = kdata.list[0].dt_txt;
		console.log(kid);
		console.log(kmain);
		console.log(kdesc);
		console.log(kdate);
	})
}

//Gets the weather forecast of Mobay-
//Current goal -- To get it to check at 8:00pm (20:00) and send out emails based on the 
//forecast of the next day at every three hours
//GOAL NOT ACHIEVED, LOGIC IS ESTABLISHED
function getmWeather(){
	request(mburl, function(err, response, body){
		//console.log(body); //displays json object from API
		mdata = JSON.parse(body);
		mid = mdata.list[0].weather[0].id;
		mmain = mdata.list[0].weather[0].main;
		mdesc = mdata.list[0].weather[0].description;
		mdate = mdata.list[0].dt_txt;
		console.log(mid);
		console.log(mmain);
		console.log(mdesc);
		console.log(mdate);		
	})
}

//Deals with automation of email sending
//setInterval(function sendEmail(){ //Interval is set for a day, making the emails be sent once a day; use when deploying
setTimeout(function sendEmail(){ //Use when testing
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'davidr.email.test@gmail.com',
			pass: '****************' //contact author for access
		}
	});

	for(var c = 0; c < x; c++){		
	 	//console.log(employees[c].email);	

	 	//If function may be optimized
	 	//If it's raining tomorrow, everyone works 4 hours and IT people stay off the road
	 	if(employees[c].city == 'Kingston'){
	 		if(kid < 700){ //It's raining or worse
	 			if(employees[c].role == 'IT'){
	 				notice = 'Good evening IT personnel, please be aware that you will be working four hours as well as staying off of the streets due to the unstable weather forecast tomorrow. Bless.';	
	 			}else{
	 				notice = 'Good evening, please be aware that you will be working four hours due to the unstable weather forecast tomorrow. Bless.';
	 			}
	 		}else{ //The weather is fine.
	 			notice = 'Good evening everyone, please be aware that we will all work a full eight hour schedule tomorrow. Bless.';
	 		}
	 	}else{//City is Montego Bay
	 		if(mid < 700){ //It's raining or worse
	 			if(employees[c].role == 'IT'){
	 				notice = 'Good evening IT personnel, please be aware that you will be working four hours as well as staying off of the streets due to the unstable weather forecast tomorrow. Bless.';	
	 			}else{ //They are not IT personnel
	 				notice = 'Good evening, please be aware that you will be working four hours due to the unstable weather forecast tomorrow. Bless.';
	 			}
	 		}else{//The weather is fine.
	 			notice = 'Good evening everyone, please be aware that we will all work a full eight hour schedule tomorrow. Bless.';
	 		}
	 	}

	 	var mailOptions = {
			from: 'davidr.email.test@gmail.com',
			to: employees[c].email,
			subject: 'Schedule Tomorrow :)',
			text: notice
		};

		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log(error);
			}else{
				console.log('Email sent: ' + info.response);
			}
		});
	}
}, 86400000); //Change number inside brackets to change the intervals of email sending.
//Number is in milliseconds, 86,400,000 is one day/24 hours
//Current digit is set to 5000 for testing.
//For actual usage, start app at 8:00pm local time until work around can be provided.

//route for home page in app
app.get('/', function(req, res){
	res.render('index', {
		title: 'Krace Gennedy Weather App',
		mblink: 'http://localhost:3000/mb',
		kgnlink: 'http://localhost:3000/kgn'
	});
});

//kgn page to display kingston weather
app.get('/kgn', function(req, res){
	//console.log('Wah Gwaan Kgn');
	res.render('kgn', {
		kgnurl: 'http://api.openweathermap.org/data/2.5/forecast?q=Kingston,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric',
		kid, 
		kmain,
		kdesc,
		kdate,
		indexurl: 'http://localhost:3000'
	});
	res.end();
});

//mobay page to display montego bay weather
app.get('/mb', function(req, res){
	//console.log("Heya Mobay");
	res.render('mb', {
		mburl: 'http://api.openweathermap.org/data/2.5/forecast?q=Montego%20Bay,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric',
		mid, 
		mmain, 
		mdesc, 
		mdate,
		indexurl: 'http://localhost:3000'
	});
	res.end();
});

//Listening on port 3000 
app.listen(3000, function(){
	console.log('Server started on port 3000...');
	console.log(d); //Displays the date	
	getEmployees();
	getkWeather();
	getmWeather();
})