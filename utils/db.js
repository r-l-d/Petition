var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSigner = function addSigner(first, last, signature) {
    return db.query(
        "INSERT INTO signatures(first, last, signature) VALUES ($1, $2, $3) RETURNING id",
        [first, last, signature]
    );
};

exports.getSigners = function getSigners() {
    return db.query("SELECT * FROM signatures");
};

exports.getNumber = function getNumber() {
    return db.query("SELECT COUNT (*) FROM signatures");
};
