var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSigner = function addSigner(firstName, lastName, signature) {
    return db.query(
        "INSERT INTO signatures(first, last, signature) VALUES ($1, $2, $3) RETURNING ID",
        [firstName, lastName, signature]
    );
};

exports.getSigners = function getSigners() {
    return db.query("SELECT * FROM signatures");
};

exports.getNumber = function getNumber() {
    return db.query("SELECT COUNT (*) FROM signatures");
};

// exports.getCities = function getCities() {
//     return db.query("SELECT * FROM cities");
// };

// module.exports.addCity = function addCity(city, population) {
//     return db.query("INSERT INTO cities (city, population) VALUES ($1, $2)", [
//         city,
//         population
//     ]);
// };
