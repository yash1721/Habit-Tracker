const Habit = require("../models/habits");
// homepage controller

const express = require('express');
const app = express();

app.use((req, res, next) => {
  // Existing CSP middleware code

  module.exports.home = function (req, res) {
    Habit.find({}, function (err, habits) {
      if (err) {
        Console.log("Error in fetching the habits");
        return;
      }
      return res.render("home", {
        title: "Habit Tracker App",
        habit_list: habits,
      });
    });
  };
  // controller to create a habit
  module.exports.createHabit = function (req, res) {
    let days = {
      one: "none",
      two: "none",
      three: "none",
      four: "none",
      five: "none",
      six: "none",
      seven: "none",
    };
    Habit.create(
      {
        habit: req.body.habit,
        end: req.body.end,
        description: req.body.description,
        frequency: req.body.frequency,
        date: Date(),
        time: req.body.time,
        days: days,
      },
      function (err, newHabit) {
        if (err) {
          console.log("Error in creating habit", err);
          return;
        }
        return res.redirect("back");
      }
    );
  };
  // controller to delete a habit
  module.exports.deleteHabit = function (req, res) {
    let id = req.query.id;
    Habit.findByIdAndDelete(id, function (err) {
      if (err) {
        console.log("Error in deleting Habit");
        return;
      }
      return res.redirect("back");
    });
  };

  // Add the CSP code here
  res.setHeader("Content-Security-Policy", "default-src 'none'; font-src 'self'");

  next();
});