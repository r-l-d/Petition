var spicedPg = require("spiced-pg");
var db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

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

exports.getProfile = function editProfile(id) {
    return db.query(
        "SELECT users.id AS users_id, first, last, email, age, city, url FROM users LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id=$1",
        [id]
    );
};

exports.updateUser = function updateUser(first, last, email, id) {
    return db.query(
        "UPDATE users SET first=$1,last=$2, email=$3 WHERE id = $4",
        [first, last, email, id]
    );
};
exports.upsertProfile = function upsertProfile(age, city, url, user_id) {
    return db.query(
        "INSERT INTO user_profiles(age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age=$1, city=$2, url=$3, user_id=$4",
        [age, city, url, user_id]
    );
};

exports.updateUserPass = function updateUserPass(
    first,
    last,
    email,
    password,
    id
) {
    return db.query(
        "UPDATE users SET first=$1, last=$2, email=$3, password=$4 WHERE id = $5",
        [first, last, email, password, id]
    );
};
