require("dotenv").config();

let keys = require("./keys.js");
const fs = require("fs");
let moment = require('moment');
const axios = require("axios");
const inquirer = require("inquirer");

//let spotify = new Spotify(keys.spotify);

// * * * * * * * main function * * * * * * * //
processUserInputs();
// process user input
function processUserInputs() {
    // get user input
    inquirer
        .prompt([{
                type: 'list',
                message: "Please select a service:",
                name: '_optionSelected',
                choices: [
                    'concert-this',
                    'spotify-this-song',
                    'movie-this',
                    'do-what-it-says'
                ]
            },
            {
                type: 'input',
                message: "Search: ",
                name: "_inputParameter"
            }
        ])
        .then(({
            _optionSelected,
            _inputParameter
        }) => {
            switch (_optionSelected) {
                case 'concert-this':
                    displayConcertInfo(_inputParameter);
                    break;
                case 'spotify-this-song':
                    displaySongInfo(_inputParameter);
                    break;
                case 'movie-this':
                    displayMovieInfo(_inputParameter);
                    break;
                case 'do-what-it-says':
                    displaySomeInfo();
                    break;
                default:
                    console.log("Error: Selection invalid.")
            }
        });

}

function displayConcertInfo(c_inputParam) {
    let queryUrl = "https://rest.bandsintown.com/artists/" + c_inputParam + "/events?app_id=codingbootcamp";
    let _response = "";
    axios.get(queryUrl).then(
        function (response) {
            _response = response;
            let numResults = 5;
            console.log("Here are the next " + numResults + " events:");
            for (let i = 0; i < numResults; i++) {
                if (response.data[i].venue != undefined) {
                    console.log("- - - - - - - - - - - - - - - - - - - - - - - - -");
                    console.log("- Event: " + parseInt(i + 1));
                    console.log("- Veunue: " + response.data[i].venue.name);
                    console.log("- Location: " + response.data[i].venue.city + ", " +
                        response.data[i].venue.country);
                    let date_time = moment(response.data[i].datetime);
                    console.log("- Date/Time: " + date_time.format("dddd, MMMM Do YYYY"));
                } else {
                    console.log("Return: no results.");
                }
            }
        }
    ).catch(function (error) {
        logErrorData(queryUrl, _response, error);
        console.log("Error: no results.");
    });
}

// sends the bad query data with the error to the errorLog.csv
function logErrorData(e_queryUrl, e_response, e_error) {
    let timeStamp = moment().format();
    fs.appendFile("serverLog.csv", timeStamp + "," + e_queryUrl + "," + e_response + "," + e_error + "\n",
        function (err) {
            if (err) {
                console.log(err);
            }
        })
};

function displaySongInfo(_inputParam) {
    console.log("song function called");
}

function displayMovieInfo(m_inputParam) {
    let queryUrl = "http://www.omdbapi.com/?t=" + m_inputParam + "&y=&plot=short&tomatoes=true&apikey=trilogy";
    let _response = "";
    axios.get(queryUrl).then(
        function(response) {
            _response = response;
            if (response.data.Title != undefined) {
                if (m_inputParam === "Mr. Nobody") {
                    console.log("* You didn't enter anything, so here's Mr. Nobody. *");
                }
                console.log("Title: " + response.data.Title);
                console.log("Year: " + response.data.Year);
                console.log("imdbRating: " + response.data.imdbRating);
                console.log("Country: " + response.data.Country);
                console.log("Language: " + response.data.Language);
                console.log("Plot: " + response.data.Plot);
                console.log("Actors: " + response.data.Actors);
                console.log("RottenTomatoes: " + response.data.tomatoRating);
            } 
            else {
                displayMovieInfo("Mr. Nobody");
            }
        } 
    ).catch(function (error) {
        logErrorData(queryUrl, _response, error);
        console.log("Error: no results.");
    });
}

function displaySomeInfo() {
    console.log("other function called");
}