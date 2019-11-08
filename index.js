const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
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
        secret: `SPICY food is the best`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    res.setHeader("x-frame-options", "DENY");
    res.locals.first = req.session.first;
    next();
});

app.get("/", (req, res) => {
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
        .then(({ rows }) => {
            req.session.signatureId = rows[0].id;
            req.session.first = firstname;
            res.redirect("/petition/signed");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/petition/signed", (req, res) => {
    db.getSignature(req.session.signatureId).then(({ rows }) => {
        let sig = rows[0].signature;
        db.getNumber()
            .then(({ rows }) => {
                const signerCount = rows[0].count;
                res.render("signed", {
                    layout: "main",
                    signerCount,
                    sig
                });
            })
            .catch(err => {
                console.log(err);
            });
    });
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
});

app.listen(8080, () => console.log("Listening"));

//rows is the only thing in the results object we care about
//rows is ALWAYS an array

//once we get the data we went, send the array to express.handlebars to render it on screen
