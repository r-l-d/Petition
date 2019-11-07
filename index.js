const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));

app.get("/cities", (req, res) => {
    db.getCities()
        .then(({ rows }) => {
            console.log("rows: ", rows);
        })
        .catch(err => {
            console.log(err);
        });
});

app.post("/add-city", (req, res) => {
    db.addCity("Sarajevo", 700000)
        .then(() => {
            console.log("Success");
        })
        .catch(err => {
            console.log(err);
        });
});

//rows is the only thing in the results object we care about
//rows is ALWAYS an array

//once we get the data we went, send the array to express.handlebars to render it on screen

app.get("/petition", (req, res) => {
    // let context = document.getElementById("canv").getContext("2d");
    res.render("inputForm", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    db.addSigner({ firstName });
    // TODO: fix this
});

app.get("/petition/signed", (req, res) => {
    db.getSigners().then;
    // TODO: do this
    res.render("signed", {
        layout: "main"
    });
});

app.get("/petition/signers", (req, res) => {
    db.getNumber().then;
    //// TODO:fix this ;
    res.render("signers", {
        layout: "main"
    });
});

app.listen(8080, () => console.log("Listening"));
