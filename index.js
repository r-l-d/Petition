const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
// const session_secret
const csurf = require("csurf");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("x-frame-options", "DENY");
    next();
});

app.get("/", (req, res) => {
    console.log("req.session before: ", req.session);
    req.session.habanero = "hello";
    console.log("req.session after: ", req.session);

    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("inputForm", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    console.log("req.body: ", req.body);
    let firstname = req.body.first;
    let lastname = req.body.last;
    let signature = req.body.signature;
    db.addSigner(firstname, lastname, signature)
        .then(({ rows }) => {
            console.log("rows:", rows);
            res.redirect("/petition/signed");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/petition/signed", (req, res) => {
    db.getSigners()
        .then(() => {
            res.render("signed", {
                layout: "main"
            });
        })
        .catch(err => {
            console.log(err);
        });
    // TODO: do this
});

app.get("/petition/signers", (req, res) => {
    db.getNumber()
        .then()
        .catch(err => {
            console.log(err);
        });
    //// TODO:fix this ;
    res.render("signers", {
        layout: "main"
    });
});

app.listen(8080, () => console.log("Listening"));

// app.post("/add-city", (req, res) => {
//     db.addCity("Sarajevo", 700000)
//     .then(() => {
//         console.log("Success");
//     })
//     .catch(err => {
//         console.log(err);
//     });
// });
// app.get("/cities", (req, res) => {
//     db.getCities()
//     .then(({ rows }) => {
//         console.log("rows: ", rows);
//     })
//     .catch(err => {
//         console.log(err);
//     });
// });

//rows is the only thing in the results object we care about
//rows is ALWAYS an array

//once we get the data we went, send the array to express.handlebars to render it on screen
