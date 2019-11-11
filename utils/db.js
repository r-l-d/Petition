var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSigner = function addSigner(userId, signature) {
    return db.query(
        "INSERT INTO signatures(user_id, signature) VALUES ($1, $2) RETURNING id",
        [userId, signature]
    );
};

exports.getSigners = function getSigners() {
    return db.query("SELECT * FROM users");
    //// TODO: need to join signers with users to get only list of names that have signed
};

exports.getNumber = function getNumber() {
    return db.query("SELECT COUNT (*) FROM signatures");
};

exports.getSignature = function getSignature(id) {
    return db.query("SELECT signature FROM signatures WHERE id=$1", [id]);
};

exports.addUser = function addUser(first, last, email, password) {
    return db.query(
        "INSERT INTO users(first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
        [first, last, email, password]
    );
};

exports.getPassword = function getPassword(email) {
    return db.query("SELECT password, id FROM users WHERE email=$1", [email]);
};

exports.hasSigned = function hasSigned(user_id) {
    return db.query("SELECT id FROM signatures WHERE user_id=$1", [user_id]);
};
