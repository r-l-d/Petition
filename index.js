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
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("x-frame-options", "DENY");
    // res.locals.first = req.session.first;
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
    let firstname = req.body.first;
    let lastname = req.body.last;
    let signature = req.body.signature;
    db.addSigner(firstname, lastname, signature)
        .then(() => {
            res.redirect("/petition/signed");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/petition/signed", (req, res) => {
    db.getNumber()
        .then(({ rows }) => {
            const signerCount = rows[0].count;
            res.render("signed", {
                layout: "main",
                signerCount
            });
        })
        .catch(err => {
            console.log(err);
        });
    // TODO: do this
});

app.get("/petition/signers", (req, res) => {
    db.getSigners()
        .then(({ rows }) => {
            const signerList = rows;
            res.render("signers", {
                layout: "main",
                signerList
            });
        })
        .catch(err => {
            console.log(err);
        });
    //// TODO:fix this ;
});

app.listen(8080, () => console.log("Listening"));

//rows is the only thing in the results object we care about
//rows is ALWAYS an array

//once we get the data we went, send the array to express.handlebars to render it on screen
