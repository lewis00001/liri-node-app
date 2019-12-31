require("dotenv").config();

const sKeys = require("./keys.js");
const Spotify = require('node-spotify-api');
const spotify = new Spotify(sKeys.spotify);
const fs = require("fs");
const moment = require('moment');
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
                name: "_inputParameter",
                // causes second prompt to be skipped if do-what-it-says is selected
                when: (name) => name._optionSelected != 'do-what-it-says'
            }
        ])
        .then(({
            _optionSelected,
            _inputParameter
        }) => {
            // logs the search information to the log.txt file
            let timeStamp = moment().format();
            fs.appendFile("log.txt", timeStamp + " option: " + _optionSelected + " - input: " + _inputParameter + "\n***\n",
                function (error) {
                    if (error) {
                        console.log(error);
                    }
                });
            // calls the approprate function based on selection
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

// calls the bandsintown api
function displayConcertInfo(c_inputParam) {
    let queryUrl = "https://rest.bandsintown.com/artists/" + c_inputParam + "/events?app_id=codingbootcamp";
    let _response = "";
    axios.get(queryUrl).then(
        function (response) {
            // sets the response to be used in the catch
            _response = response;
            let numResults = 5;
            // if the response is less then the let length, numResults is updated
            if (response.data.length < numResults) {
                numResults = response.data.length;
            }
            if (response.data[0].venue != undefined) {
                console.log("Here's the next " + numResults + " event(s):");
                for (let i = 0; i < numResults; i++) {
                    if (response.data[i].venue != undefined) {
                        let date_time = moment(response.data[i].datetime);
                        let v_info =
                            "- - - - - - - - - - - - - - - - - - - - - - - - -" +
                            "\n- Event: " + parseInt(i + 1) +
                            "\n- Veunue: " + response.data[i].venue.name +
                            "\n- Location: " + response.data[i].venue.city + ", " +
                            response.data[i].venue.country +
                            "\n- Date/Time: " + date_time.format("dddd, MMMM Do YYYY");
                        console.log(v_info);
                    }
                }
            }
        }
    ).catch(function (error) {
        logErrorData(queryUrl, _response, error);
        console.log("No results.");
    });
}

// calls the spotify api
function displaySongInfo(s_inputParam) {
    let _response = "";
    // if nothing is added, adds The Sign
    if (s_inputParam.trim() === "") {
        s_inputParam = "The Sign";
    }
    spotify
        .search({
            type: 'track',
            query: s_inputParam
        })
        .then(function (response) {
            // sets the response to be used in the catch
            _response = response;
            let numResults = 5;
            // if the response is less then the let length, numResults is updated
            if (response.tracks.items.length < numResults) {
                numResults = response.tracks.items.length;
            }
            // informs user about the auto search
            if (s_inputParam === "The Sign") {
                console.log("* We couldn't find anything based on what you entered, so here's results for 'The Sign' *");
            }
            if (response.tracks != undefined) {
                console.log("Here's a list of " + numResults + " possible matche(s):");
                for (let i = 0; i < numResults; i++) {
                    let s_info =
                        "- - - - - - - - - - - - - - - - - - - - - - - - -" +
                        "\n- Artist(s): " + response.tracks.items[i].artists[0].name +
                        "\n- Song Name: " + response.tracks.items[i].name +
                        "\n- Album Name: " + response.tracks.items[i].album.name +
                        "\n- Preview Link: " + response.tracks.items[i].preview_url;

                    console.log(s_info);
                }
            }
        })
        .catch(function (error) {
            logErrorData(s_inputParam, _response, error);
            console.log("No results.");
        });
}

// calls the ombb api
function displayMovieInfo(m_inputParam) {
    let queryUrl = "http://www.omdbapi.com/?t=" + m_inputParam + "&y=&plot=short&tomatoes=true&apikey=trilogy";
    let _response = "";
    axios.get(queryUrl).then(
        function (response) {
            // sets the response to be used in the catch
            _response = response;
            if (response.data.Title != undefined) {
                // informs user about the auto search
                if (m_inputParam === "Mr. Nobody") {
                    console.log("* We couldn't find anything based on what you entered, so here's Mr. Nobody. *");
                }
                let m_info =
                    "- Title: " + response.data.Title +
                    "\n- Year: " + response.data.Year +
                    "\n- imdbRating: " + response.data.imdbRating +
                    "\n- Country: " + response.data.Country +
                    "\n- Language: " + response.data.Language +
                    "\n- Plot: " + response.data.Plot +
                    "\n- Actors: " + response.data.Actors +
                    "\n- RottenTomatoes: " + response.data.tomatoRating;
                console.log(m_info);
            } else {
                displayMovieInfo("Mr. Nobody");
            }
        }
    ).catch(function (error) {
        logErrorData(queryUrl, _response, error);
        console.log("No results.");
    });
}

function displaySomeInfo() {
    fs.readFile('random.txt', 'utf8', function (error, content) {
        // makes an array from random.txt data
        let song = content.split(','); 
        console.log("This option calls spotify-this-song and searches for 'I want it that way'.");    
        displaySongInfo(song[1]);
        if(error) {
            logErrorData('null', song, error);
        }
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