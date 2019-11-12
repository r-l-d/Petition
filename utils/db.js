var spicedPg = require("spiced-pg");
var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSigner = function addSigner(userId, signature) {
    return db.query(
        "INSERT INTO signatures(user_id, signature) VALUES ($1, $2) RETURNING id",
        [userId, signature]
    );
};

exports.getSigners = function getSigners() {
    return db.query(
        "SELECT * FROM users JOIN signatures ON  users.id = signatures.user_id  LEFT OUTER JOIN user_profiles ON signatures.user_id = user_profiles.user_id"
    );
};

exports.getCitySigners = function getCitySigners(city) {
    return db.query(
        "SELECT * FROM users LEFT OUTER JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(city) = LOWER($1)",
        [city]
    );
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

exports.hasSigned = function hasSigned(email) {
    return db.query(
        "SELECT signatures.id AS signature_id, signature, user_id FROM signatures JOIN users ON signatures.user_id = users.id WHERE email=$1",
        [email]
    );
};

exports.addProfile = function addProfile(age, city, url, user_id) {
    return db.query(
        "INSERT INTO user_profiles(age, city, url, user_id) VALUES ($1, $2, $3, $4)",
        [age || null, city, url, user_id]
    );
};
