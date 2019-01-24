'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const database = mongo.MongoClient;
var cors = require('cors');
const databaseURI = process.env.MONGOLAB_URI;

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/new/:url(*)", (Request, Response) => {
    if(Request.params.url != undefined){
        console.log(databaseURI);
        database.connect(databaseURI, (err, db) => {
            if(err){
                console.log("Oops some error occurred while connecting to database: " + err);
            }

            if(db && Request.params.url.startsWith("https://") || Request.params.url.startsWith("http://")){
                console.log("Succesful connection to database");
                let urlGenerated = generateNewURL(Request.params.url);
                let finalURI = {
                    GENERATED_URI: urlGenerated,
                    ORIGINAL_URI: Request.params.url,
                };
                db.collection("urls").insertOne(finalURI, (err, data) =>{
                    if(err) throw err;
                    Response.send({URI:Request.hostname + "/" + finalURI.GENERATED_URI});
                });
                db.close();
            }else{
                Response.send({error:"Looks like your url not looks valid be sure this includes http:// or https://"})
            }
        });
    }else{
        Response.send("Hey a hint here, you should pass data in order to do something");
    }
    
});

app.get("/:codeURL", (Request, Response) =>{
    let urlForSearch = {
        GENERATED_URI: encodeURI(Request.params.codeURL),
    };
    console.log(urlForSearch);
    database.connect(databaseURI, (err, db) => {
        if(err){
            alert("Ups some error occurred connecting to database you should refresh the page ;)");
        }

        db.collection("urls").findOne(urlForSearch, (err, resources) => {
            if(err) throw err;
            console.log("Founded ;) ", resources);
            if(resources != null){
                Response.redirect(encodeURI(resources.ORIGINAL_URI));
            }else{
                Response.redirect("/");
            }
        });
    });
});

function generateNewURL(uri){
    let dictionary = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    dictionary = dictionary.split("");
    var finalURL = shuffleArr(dictionary).join("");
    return finalURL;
}

function shuffleArr(arr){
    let shufledArr = [];
    var length = 6;
    var i = arr.length - 1, j, temp;
    if ( length === -1 ) return false;
    while ( length-- ) {
       j = Math.floor( Math.random() * ( i + 1 ) );
       temp = arr[i];
       arr[i] = arr[j]; 
       arr[j] = temp;
       shufledArr.push(temp);
    }
    return shufledArr;
}


app.listen(port, function () {
  console.log('Node.js listening ...');
});
