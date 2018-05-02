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
 */

//Deals with the weather API
var request = require('request');
var kgnurl = 'http://api.openweathermap.org/data/2.5/forecast?q=Kingston,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric';
var mburl = 'http://api.openweathermap.org/data/2.5/forecast?q=Montego%20Bay,JM&APPID=ccd5b60fb64d15bde59e5f5f62d199cf&units=metric';
var iconlink = 'http://openweathermap.org/img/w/';
//Variables for data grabbing
var kdata, kid = [], kmain = [], kdesc = [], kdate = [], khour = [], kday = [], ktemp = [], kicon = [];
var mdata, mid = [], mmain = [], mdesc = [], mdate = [], mhour = [], mday = [], mtemp = [], micon = [];
//Used to grab 9am specifically
var k9id, k9main, k9desc, k9date, k9hour, k9day, k9temp, k9icon;
var m9id, m9main, m9desc, m9date, m9hour, m9day, m9temp, m9icon;

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
var now = new Date();
var hr = now.getHours();
var min = now.getMinutes();
var sec = now.getSeconds();
var day = now.getDay();
var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var employees; //to grab the returned employees from the database
var x = db.employees.count(function(err, y){x = y;}); //grabs the amount of employees in database

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
function getkWeather(){
	request(kgnurl, function(err, response, body){
		//console.log(body); //displays json object from API
		kdata = JSON.parse(body);

		//Iterates 8 times to get the next 8 forecasts (24 hours, Forecast/3hr)
		for(var c = 0; c < 9; c++){	

			kid[c] = kdata.list[c].weather[0].id; //Grabs weather ID for emailing
			kmain[c] = kdata.list[c].weather[0].main; 
			kdesc[c] = kdata.list[c].weather[0].description;
			ktemp[c] = kdata.list[c].main.temp;
			kicon[c] = iconlink + kdata.list[c].weather[0].icon + '.png'; //Object for weather icon
			kdate[c] = kdata.list[c].dt_txt; //Grabs the date for manipulation
			khour[c] = kdate[c].substring(11, 13); //Grabs hour for display
			
			//If statements to output a more readable format
			if(khour[c] == '00'){
				khour[c] = '12 AM';
			}else if(khour[c] < '12'){
				khour[c] = parseInt(khour[c]) + ' AM';
			}else if(khour[c] == '12'){
				khour[c] = '12 PM';
			}else{
				khour[c] = parseInt(khour[c]) - 12 + ' PM';
			}

			//If statements to increment day where necessary
			if(kdate[c].substring(8, 10) > kdate[0].substring(8, 10)){
				var tmrw = now.getDay() + 1;
				kday[c] = days[tmrw];
			}else{
				kday[c] = days[day];
			}

			if(khour[c] == '9 AM'){
				k9id = kid[c];
				k9main = kmain[c];
				k9desc = kdesc[c];
				k9temp = ktemp[c];
				k9icon = kicon[c];
				k9date = kdate[c];
				k9hour = khour[c];
				k9day = kday[c];
			}
		}
	})
}

//Gets the weather forecast of Mobay
function getmWeather(){
	request(mburl, function(err, response, body){
		//console.log(body); //displays json object from API
		mdata = JSON.parse(body);

		//Iterates 8 times to get the next 8 forecasts (24 hours, Forecast/3hr)
		for(var c = 0; c < 9; c++){	

			mid[c] = mdata.list[c].weather[0].id; //Grabs weather ID for emailing
			mmain[c] = mdata.list[c].weather[0].main; 
			mdesc[c] = mdata.list[c].weather[0].description;
			mtemp[c] = mdata.list[c].main.temp;
			micon[c] = iconlink + mdata.list[c].weather[0].icon + '.png'; //Object for weather icon
			mdate[c] = mdata.list[c].dt_txt; //Grabs the date for manipulation
			mhour[c] = mdate[c].substring(11, 13); //Grabs hour for display
			
			//If statements to output a more readable format
			if(mhour[c] == '00'){
				mhour[c] = '12 AM';
			}else if(mhour[c] < '12'){
				mhour[c] = parseInt(mhour[c]) + ' AM';
			}else if(mhour[c] == '12'){
				mhour[c] = '12 PM';
			}else{
				mhour[c] = parseInt(mhour[c]) - 12 + ' PM';
			}

			//If statements to increment day where necessary
			if(mdate[c].substring(8, 10) > mdate[0].substring(8, 10)){
				var tmrw = now.getDay() + 1;
				mday[c] = days[tmrw];
			}else{
				mday[c] = days[day];
			}

			if(mhour[c] == '9 AM'){
				m9id = mid[c];
				m9main = mmain[c];
				m9desc = mdesc[c];
				m9temp = mtemp[c];
				m9icon = micon[c];
				m9date = mdate[c];
				m9hour = mhour[c];
				m9day = mday[c];
			}
		}	
	})
}

//Deals with automation of email sending
//setInterval(function sendEmail(){ //Interval is set for a day, making the emails be sent once a day; use when deploying
setTimeout(function sendEmail(){ //Use when testing

	var notice;

	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'davidr.email.test@gmail.com',
			pass: 'DavidRhoden12345' //contact author for access
		}
	});

	for(var c = 0; c < x; c++){		
	 	//If it's raining tomorrow, everyone works 4 hours and IT people stay off the road
	 	if(employees[c].city == 'Kingston'){
	 		if(k9id < 700){ //It's raining or worse
	 			if(employees[c].role == 'IT'){
	 				notice = '(KIT) Good evening IT personnel, please be aware that you will be working four hours as well as staying off of the streets due to the unstable weather forecast tomorrow. Bless.';	
	 			}else{
	 				notice = '(KNO) Good evening, please be aware that you will be working four hours due to the unstable weather forecast tomorrow. Bless.';
	 			}
	 		}else{ //The weather is fine.
	 			notice = '(K) Good evening everyone, please be aware that we will all work a full eight hour schedule tomorrow. Bless.';
	 		}
	 	}else{//City is Montego Bay
	 		if(m9id < 700){ //It's raining or worse
	 			if(employees[c].role == 'IT'){
	 				notice = '(MBIT) Good evening IT personnel, please be aware that you will be working four hours as well as staying off of the streets due to the unstable weather forecast tomorrow. Bless.';	
	 			}else{ //They are not IT personnel
	 				notice = '(MBNO) Good evening, please be aware that you will be working four hours due to the unstable weather forecast tomorrow. Bless.';
	 			}
	 		}else{//The weather is fine.
	 			notice = '(MB) Good evening everyone, please be aware that we will all work a full eight hour schedule tomorrow. Bless.';
	 		}
	 	}

	 	var mailOptions = {
			from: 'davidr.email.test@gmail.com',
			//to: employees[c].email,
			to: 'rhodendavid123@gmail.com',
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
}, 10000); //Change number inside brackets to change the intervals of email sending.
//Number is in milliseconds, 86400000 is one day/24 hours
//Current digit is set to 10000 (10secs) for testing.
//For actual usage, start server at 8:00pm local time until work around can be provided.

//route for home page in app
app.get('/', function(req, res){
	res.render('index', {
		//Kingston variables
		kday, //Passes the day of this forecast
		kdesc, //Passes description of forecast
		kgnurl, //Passes API url
		khour, //Passes hour to display
		kicon, //Passes string for icon to be displayed
		kmain, //Passes main weather condition
		ktemp, //Passes temperature of forecast

		//Passes weather in Kgn at 9 AM of the next day specifically
		//As this is used to determine the schedule of the next day
		k9day,
		k9desc,
		k9hour,
		k9icon,
		k9main,
		k9temp,

		//Montego Bay page variables
		mday, //Passes the day of this forecast
		mdesc, //Passes description of forecast
		mburl, //Passes API url
		mhour, //Passes hour to display
		micon, //Passes string for icon to be displayed
		mmain, //Passes main weather condition
		mtemp, //Passes temperature of forecast	

		//Passes weather in Mobay at 9 AM of the next day specifically
		//As this is used to determine the schedule of the next day
		m9day,
		m9desc,
		m9hour,
		m9icon,
		m9main,
		m9temp,
	});
});

//Listening on port 3000 
app.listen(3000, function(){
	console.log('Server started on port 3000...');
	console.log("Emailing module is in test mode.");
	//console.log("Emailing module is not in test mode.");
	console.log(now); //Displays current date in console
	getEmployees(); //Get this to be called only when the sendEmail function is called. 
	getkWeather();
	getmWeather();
})