// store sensitive information externally
require("dotenv").config();

// require node modules
var fs = require("fs");
var request = require("request");
var keys = require("./keys.js");
var Twitter = require("twitter");
var Spotify = require ("node-spotify-api");
var lineReader = require('line-reader');

// carriage return ascii codes
const CR = "\r\n";

// process command line arguments
const liriArgv = process.argv[2];

// activate different features
switch(liriArgv) {
    case "my-tweets": myTweets(); break;
    case "spotify-this-song": spotifyThisSong(); break;
    case "movie-this": movieThis(); break;
    case "do-what-it-says": doWhatItSays(); break;
    // default user help
    default: console.log(CR + "Try typing one of the following options: " + CR +
        "my-tweets 'any twitter name' " + CR +
        "spotify-this-song 'any song name' " + CR +
        "movie-this 'any movie name' " + CR +
        "do-what-it-says." + CR);
    }

// call the Twitter api
function myTweets() {

    // get Twitter keys from external environment
    var client = new Twitter({
        consumer_key: keys.twitterKeys.consumer_key,
        consumer_secret: keys.twitterKeys.consumer_secret,
        access_token_key: keys.twitterKeys.access_token_key,
        access_token_secret: keys.twitterKeys.access_token_secret
    });

    // user information
    var twitterUsername = process.argv[3];
    if (!twitterUsername) { twitterUsername = "LarryfPaul"; }

    // api parameters & method
    params = {screen_name: twitterUsername};
    client.get("statuses/user_timeline/", params, function(error, data, response){
        if (!error) {
            for (var i=0; i < data.length; i++) {
                //console.log(response);
                var twitterData = 
                    "User: " + data[i].user.screen_name + " (" + data[i].created_at + ")" + CR + 
                    "Tweet: " + data[i].text + CR
                console.log(twitterData);
                log(twitterData);
            }
        }  else {
            console.log("Error :"+ error);
            return;
        }
    });
}

// call the Spotify API
function spotifyThisSong(songName) {

    // console.log(songName);

    // check for command line options
    if (!songName) {
        
        var nodeArgs = process.argv;

        // create an empty string for holding song info
        songName = "";

        // gather all the words in the song request
        for (var i=3; i<nodeArgs.length; i++) {
        // Build a string with song terms
        songName = songName + " " + nodeArgs[i];
        }
    }

    if (!songName) { songName = "What's my age again"; }

    // get external environment
    var spotify = new Spotify({
        id: keys.spotifyKeys.id,
        secret: keys.spotifyKeys.secret
      });

    // api parameters and method
    params = songName;
    // console.log(params);

    spotify.search({ type: "track", query: params }, function(err, data) {
        if (!err) {
            var songInfo = data.tracks.items;
            // console.log(songInfo)
            for (var i=0; i<5; i++) {
                if (songInfo[i] != undefined) {
                    var spotifyData =
                    "Artist: " + songInfo[i].artists[0].name + CR +
                    "Song: " + songInfo[i].name + CR +
                    "Album: " + songInfo[i].album.name + CR +
                    "Web: " + songInfo[i].preview_url + CR;
                    console.log(spotifyData);
                    log(spotifyData);
                }
            }
        } else {
            console.log("Error: " + err);
            return;
        }
    });
};

// call the OMDB API 
function movieThis(movie) {

    // console.log(movie);

    // if (!movie) {movie = process.argv[3]; }

    if (!movie) {
        // var movie = process.argv[3];
        var nodeArgs = process.argv;

        // create an empty string for holding movie info
        movie = "";

        // gather all the words in the movie request
        for (var i=3; i<nodeArgs.length; i++) {
        // Build a string with movie terms
        movie = movie + " " + nodeArgs[i];
        }
    }

    if (!movie) { movie = "mr+nobody"; }

    var omdbKey = process.env.OMDB_API_KEY;
    params = movie + "&apikey=" + omdbKey;
    // console.log(params)

    request("http://www.omdbapi.com/?t=" + params +
        "&y=&plot=short&r=json&tomatoes=true", 
        function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var movieObject = JSON.parse(body);
            // console.log(movieObject);
            var movieData =
            "Title: " + movieObject.Title + CR +
            "Year: " + movieObject.Year + CR +
            "IMDB Rating: " + movieObject.imdbRating + CR +
            "Rotten Tomatoes Rating: " + movieObject.tomatoRating + CR + 
            "Country: " + movieObject.Country + CR +
            "Language: " + movieObject.Language + CR +
            "Plot: " + movieObject.Plot + CR +
            "Actors: " + movieObject.Actors + CR;
            console.log(movieData);
            log(movieData); // calling log function
        } else {
            console.log("Error: " + error);
            return;
        }
    });
};

// reads commands from file: random.txt
function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function(error, data) {
        if (!error) {
            doWhatData = data.split(",");
            switch(doWhatData[0]) {
                case "my-tweets": myTweets(doWhatData[1]); break;
                case "spotify-this-song": spotifyThisSong(doWhatData[1]); break;
                case "movie-this": movieThis(doWhatData[1]); break;
                // default: console.log(data + CR);
            }
            
            // spotifyThisSong(doWhatItSaysData[0], doWhatItSaysData[1]);
        } else {
            console.log("Error occurred: " + error);
        }
    });
};

// save results to a log file
function log(logResults) {
    fs.appendFile("log.txt", logResults, (error) => {
      if(error) {
        throw error;
      }
    });
  }
