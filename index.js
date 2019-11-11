const express = require("express");
const app = express();
const db = require("./utils/db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");

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
    res.redirect("/register");
});

app.get("/petition", (req, res) => {
    let userId = req.session.userId;
    console.log("userId: ", userId);
    res.render("inputForm", {
        layout: "main"
    });
    // db.hasSigned(userId)
    //     .then(({ rows }) => {
    //         console.log("rows[0]:", rows[0]);
    //         if (rows[0] !== "undefined") {
    //             res.redirect("/petition/signed");
    //         } else {
    //             //res.render inputform was here
    //         }
    //     })
    // .catch(err => {
    //     console.log(err);
    // });
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;
    let userId = req.session.userId;
    db.addSigner(userId, signature)
        .then(({ rows }) => {
            if (req.body.signature !== "") {
                req.session.signatureId = rows[0].id;
                res.redirect("/petition/signed");
            } else {
                res.redirect("back");
            }
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main"
    });
});

app.post("/register", (req, res) => {
    hash(req.body.password).then(hashedPass => {
        const { first, last, email } = req.body;
        db.addUser(first, last, email, hashedPass)
            .then(({ rows }) => {
                req.session.userId = rows[0].id;
                res.redirect("/petition");
            })
            .catch(err => {
                console.log("error: ", err);
                res.redirect("back");
            });
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.getPassword(email).then(({ rows }) => {
        const hashPass = rows[0].password;
        const userId = rows[0].id;
        compare(password, hashPass)
            .then(passCheck => {
                if (passCheck) {
                    req.session.userid = userId;
                    db.hasSigned(userId)
                        .then(({ rows }) => {
                            if (rows[0] !== undefined) {
                                console.log("rows[0].id: ", rows[0].id);
                                console.log("redirecting to signed");
                                req.session.signatureId = rows[0].id;
                                res.redirect("/petition/signed");
                            } else {
                                res.redirect("/petition");
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        });
                } else {
                    res.redirect("back");
                    //// TODO: need an error message here
                }
            })
            .catch(err => {
                console.log(err);
            });
    });
});

app.get("/petition/signed", (req, res) => {
    db.getSignature(req.session.signatureId).then(({ rows }) => {
        let sig = rows[0].signature;
        db.getNumber()
            .then(({ rows }) => {
                const signerCount = rows[0].count;
                //// TODO: join tables to only get users that have signed
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
