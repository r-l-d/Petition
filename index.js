const express = require("express");
const app = express();
module.exports = app;
const db = require("./utils/db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");
const {
    requireSignature,
    requireNoSignature,
    requireLoggedOutUser,
    requireLoggedInUser
} = require("./public/middleware");

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

app.use(requireLoggedInUser);

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("registration", {
        layout: "main"
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    hash(req.body.password).then(hashedPass => {
        const { first, last, email } = req.body;
        db.addUser(first, last, email, hashedPass)
            .then(({ rows }) => {
                req.session.userId = rows[0].id;
                res.redirect("/profile");
            })
            .catch(err => {
                console.log("error: ", err);
                res.redirect("back");
            });
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    let userId = req.session.userId;
    let { age, city, url } = req.body;
    if (
        url != "" &&
        !url.startsWith("http://") &&
        !url.startsWith("https://")
    ) {
        url = `http://${url}`;
    }
    if (age != "" || city != "" || url != "") {
        db.addProfile(age, city, url, userId)
            .then(() => {
                res.redirect("/petition");
            })
            .catch(err => {
                console.log(err);
                res.redirect("back");
            });
    } else {
        res.redirect("/petition");
    }
});

app.get("/petition", requireNoSignature, (req, res) => {
    res.render("inputForm", {
        layout: "main"
    });
});

app.post("/petition", requireNoSignature, (req, res) => {
    let signature = req.body.signature;
    let userId = req.session.userId;
    db.addSigner(userId, signature)
        .then(({ rows }) => {
            if (req.body.signature !== "") {
                req.session.signatureId = rows[0].id;
                res.redirect("/signed");
            } else {
                res.redirect("back");
            }
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    const { email, password } = req.body;
    db.getPassword(email)
        .then(({ rows }) => {
            const hashPass = rows[0].password;
            const userId = rows[0].id;
            compare(password, hashPass)
                .then(passCheck => {
                    if (passCheck) {
                        req.session.userId = userId;
                        db.hasSigned(email)
                            .then(({ rows }) => {
                                if (
                                    typeof rows[0] === "undefined" ||
                                    rows[0].signature == ""
                                ) {
                                    res.redirect("/petition");
                                } else {
                                    req.session.signatureId =
                                        rows[0].signature_id;
                                    res.redirect("/signed");
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
        })
        .catch(err => {
            console.log(err);
            res.render("login", {
                layout: "main",
                error: true
            });
        });
});

app.get("/signed", requireSignature, (req, res) => {
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

app.get("/signers", requireSignature, (req, res) => {
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

app.get("/signers/:city", requireSignature, (req, res) => {
    let city = req.params.city;
    db.getCitySigners(city)
        .then(({ rows }) => {
            const signerList = rows;
            res.render("signers", {
                layout: "main",
                signerList,
                city
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/profile/edit", (req, res) => {
    let userId = req.session.userId;
    db.getProfile(userId)
        .then(({ rows }) => {
            let { first, last, email, age, city, url } = rows[0];
            res.render("edit", {
                layout: "main",
                first,
                last,
                email,
                age,
                city,
                url
            });
        })
        .catch(err => {
            console.log(err);
        });
});

app.post("/profile/edit", (req, res) => {
    let userId = req.session.userId;
    const { first, last, email, age, city, url } = req.body;
    if (req.body.password) {
        hash(req.body.password)
            .then(hashedPass => {
                db.updateUserPass(first, last, email, hashedPass, userId)
                    .then(() => {
                        db.upsertProfile(age, city, url, userId)
                            .then(() => {
                                db.hasSigned(email).then(({ rows }) => {
                                    if (
                                        typeof rows[0] === "undefined" ||
                                        rows[0].signature == ""
                                    ) {
                                        res.redirect("/petition");
                                    } else {
                                        req.session.signatureId =
                                            rows[0].signature_id;
                                        res.redirect("/signed");
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        db.updateUser(first, last, email, userId)
            .then(() => {
                db.upsertProfile(age, city, url, userId)
                    .then(() => {
                        db.hasSigned(email)
                            .then(({ rows }) => {
                                if (
                                    typeof rows[0] === "undefined" ||
                                    rows[0].signature == ""
                                ) {
                                    res.redirect("/petition");
                                } else {
                                    req.session.signatureId =
                                        rows[0].signature_id;
                                    res.redirect("/signed");
                                }
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }
});

app.post("/delete", (req, res) => {
    db.deleteSig(req.session.signatureId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect("/petition");
        })
        .catch(err => {
            console.log(err);
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => console.log("Listening"));
}
