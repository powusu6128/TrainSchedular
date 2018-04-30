// Initialize Firebase
var config = {
  apiKey: "AIzaSyCNhaiOr2hGbHkEmp0ap5UOcoPMBQSXZU8",
  authDomain: "train-schedular-d229f.firebaseapp.com",
  databaseURL: "https://train-schedular-d229f.firebaseio.com",
  projectId: "train-schedular-d229f",
  storageBucket: "train-schedular-d229f.appspot.com",
  messagingSenderId: "1032030985011"
};

// Initialize Firebase

firebase.initializeApp(config);

// Create a variable to reference the database.

var database = firebase.database();

// ------------------------------------

// Initial Train Schedule Values.

var trainName = "";

var destination = "";

var frequency = 0;

var firstTrain = "";

var minutesAway = 0;

var schedule = [];

var firstTrainTotalMin = 0;

var trainTime = 0;

var currentTimeTotalMin = 0;

var nextArrivalInMin = 0;

var nextArrival = "";

// total minute in a display
var minuteInDay = (60 * 60 * 24) / 60

// Capture Submit Button Click.

$("#submit-info").on("click", function() {

  // Don't refresh page!

  event.preventDefault();

  // Get train data from DOM.

  trainName = $("#train-name").val().trim();

  destination = $("#destination").val().trim();

  firstTrain = $("#first-train").val().trim();

  frequency = $("#frequency").val().trim();

  // Convert current time to minutes.

  convertCurrentTimeToMinutes();

  // Convert first train time to minutes.

  convertFirstTrainToMinutes(firstTrain);

  // If frequncy is less than a day...

  if (frequency < minuteInDay) {

    // Create train schedule using first train time and frequency.

    createTrainSchedule(firstTrainTotalMin, frequency);

    // Determine next train using current time and schedule.

    determineNextTrain(currentTimeTotalMin, schedule);

    // Determine minutes till next arrival.

    determineMinutesAway(nextArrivalInMin, currentTimeTotalMin);

    // else if the frequency is greater than a day...

  } else {

    // Simply set the next arrival time using first train time

    // And using the remainder of the frequency divided by a day.

    nextArrivalInMin = firstTrainTotalMin + (minuteInDay % frequency);

    // Determine the next train based on current time and next arrival.

    determineNextTrain(currentTimeTotalMin, nextArrivalInMin);

    // Determine minutes away using first train total in minutes and frequency.

    minutesAway = parseFloat(firstTrainTotalMin) + parseFloat(frequency);

  }

  // Convert next train to hours and minutes for display.

  convertNextTrainToHoursMin(nextArrivalInMin);

  // Clear out input text as a courtesy to your user.

  $("#train-name").val("");

  $("#first-train").val("");

  $("#destination").val("");

  $("#frequency").val("");

  // Push data to database.

  database.ref().push({

    name: trainName,

    destination: destination,

    frequency: frequency,

    nextArrival: nextArrival,

    minutesAway: minutesAway

  });

});

database.ref().on("child_added", function(childSnapshot) {

  // Build up train table in DOM.

  var rowTrains = $("<tr>").addClass("tableRow").attr("data-key", childSnapshot.key);

  rowTrains.append(`<td>${childSnapshot.val().name}</td>`)
    .append(`<td>${childSnapshot.val().destination}</td>`)
    .append(`<td>${childSnapshot.val().frequency}</td>`)
    .append(`<td>${childSnapshot.val().nextArrival}</td>`)
    .append(`<td>${childSnapshot.val().minutesAway}</td>`);

  $("#trains").append(rowTrains);



}, function(errorObject) {
  console.log("the read fail" + errorObject.code);
});

// Convert first train time in minutes using moment.js.

function convertFirstTrainToMinutes(firstTrain) {

  firstTrain = moment(firstTrain, "HH:mm");

  firstTrainHours = firstTrain.hours();

  firstTrainMin = firstTrain.minutes();

  // Calculation to add up the minutes.

  firstTrainTotalMin = firstTrainMin + firstTrainHours * 60;

}

//current time with reference to train state

function convertCurrentTimeToMinutes() {

  var currentHours = moment().hours();

  var currentMinutes = moment().minutes();


  console.log(currentHours, currentMinutes);
  // Calculation to add up the minutes.

  currentTimeTotalMin = currentMinutes + currentHours * 60;

}

// Creates an array of train times over 24 hour period.

function createTrainSchedule(firstTrainTotalMin, frequency) {

  // Need to reset these values to create new schedule array.

  trainTime = 0;

  schedule = [];

  for (let i = 0; trainTime < minuteInDay; i++) {

    trainTime = firstTrainTotalMin + (frequency * i);

    if (trainTime > minuteInDay) {

      return schedule;

    } else {
      console.log(trainTime);
      schedule.push(trainTime);

    }

  }

};

// Determine current train using current time and schedule.

function determineNextTrain(currentTimeTotalMin, schedule) {

  //Scheduled train time after current time is next arrival time.

  for (var i = 0; i < schedule.length; i++) {

    console.log(schedule[i]);

    if (schedule[i] > currentTimeTotalMin) {

      console.log(schedule[i]);

      nextArrivalInMin = schedule[i];

      return nextArrivalInMin;

    }

  }

}

// Convert next train to hours and minutes for display.

function convertNextTrainToHoursMin(nextArrivalInMin) {

  var nextArrivalMin = nextArrivalInMin % 60;

  var nextArrivalHours = Math.floor(nextArrivalInMin / 60);

  var stamp = "";

  // Also figure out if time is AM or PM.
  if (nextArrivalHours === 12) {

    nextArrivalHours = nextArrivalHours;

    stamp = "pm";

  }

  if (nextArrivalHours > 12) {

    nextArrivalHours -= 12;

    stamp = "pm";

  } else if (nextArrivalHours < 12) {

    nextArrivalHours = nextArrivalHours;

    stamp = "am";

  }

  if (nextArrivalHours < 10) {

    nextArrivalHours = "0" + nextArrivalHours;

  }

  if (nextArrivalMin < 10) {

    nextArrivalMin = "0" + nextArrivalMin;

  }

  nextArrival = nextArrivalHours + ":" + nextArrivalMin + " " + stamp;
}

// Determine minutes away for next train.

function determineMinutesAway(nextArrivalInMin, currentTotalTimeMin) {

  // Minutes away is simply next arrival minus current time.

  minutesAway = nextArrivalInMin - currentTotalTimeMin;

  return minutesAway;

}
//Cleck on row to delete it from the list
$("#trains").on("click", ".tableRow", function() {
  $(this).closest('tr').remove();

  var tr = $(this).closest('tr');

  var childKey = tr.attr("data-key");

  database.ref().child(childKey).remove();

  tr.remove();
  
});
