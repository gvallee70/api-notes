const FormData = require('form-data');
const fetch = require("node-fetch");

const user = {}

user.signin = async (username, password) => {
    let testSignIn = new FormData();
    testSignIn.append('username', username);
    testSignIn.append('password', password);

    return await fetch('http://localhost:8080/signin', {
    method: 'POST',
    body: testSignIn
})
}


user.signup = async (username, password) => {
    let testSignUp = new FormData();
    testSignUp.append('username', username);
    testSignUp.append('password', password);

    return await fetch('http://localhost:8080/signup', {
    method: 'POST',
    body: testSignUp
})
}



module.exports = user;