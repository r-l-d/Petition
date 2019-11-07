var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.getCities = function getCities() {
    return db.query("SELECT * FROM cities");
};

module.exports.addCity = function addCity(city, population) {
    return db.query("INSERT INTO cities (city, population) VALUES ($1, $2)", [
        city,
        population
    ]);
};

module.exports.addSigner = function addSigner(firstName, lastName, signature) {
    return db.query(
        "INSERT INTO signatures(firstname, lastname, signature) VALUES ($1, $2, $3)",
        [firstName, lastName, signature]
    );
};

exports.getSigners = function getSigners() {
    return db.query("SELECT * FROM signatures");
};

exports.getNumber = function getNumber() {
    return db.query("SELECT COUNT (*) FROM signatures");
};
