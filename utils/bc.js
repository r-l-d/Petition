const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const hash = promisify(bcrypt.hash);
const genSalt = promisify(bcrypt.genSalt);

//call this in POST registration route
exports.hash = password => genSalt().then(salt => hash(password, salt));

//call this in post login route
exports.compare = promisify(bcrypt.compare);
//compare takes 2 arguments
//1. the pw that the user sends from the clinet
//2. the hashed pw from the database
//TRUE will be returned if there is a match
