const assert = require('assert');
const user = require('./user')


describe("le serveur devrait", () => {
    it('retourner un code 400 avec le message \'Le mot de passe doit contenir au moins 4 caractères\' quand il reçoit une requête HTTP POST /signup et que password contient moins de 4 caractères', async () => {
        const signupResponse = await user.signup('test', 'tes')
        const signupResponseJson = await signupResponse.json()

        assert.equal(signupResponse.status, 400);
        assert.equal(signupResponseJson.error, 'Le mot de passe doit contenir au moins 4 caractères');
    });

    it('retourner un code 400 avec le message \'Votre identifiant ne doit contenir que des lettres minuscules non accentuées\' quand il reçoit une requête HTTP POST /signup et que username contient un caractère autre que des lettres non accentuées', async () => {
        const signupResponse = await user.signup('test#', 'test')
        const signupResponseJson = await signupResponse.json()

        assert.equal(signupResponse.status, 400);
        assert.equal(signupResponseJson.error, 'Votre identifiant ne doit contenir que des lettres minuscules non accentuées');
    });


    it('retourner un code 400 avec le message \'Votre identifiant doit contenir entre 2 et 20 caractères\' quand il reçoit une requête HTTP POST /signup et que username contient moins de 2 caractères ou plus de 20 caractères', async () => {
        const signupResponse = await user.signup('t', 'test')
        const signupResponseJson = await signupResponse.json()

        assert.equal(signupResponse.status, 400);
        assert.equal(signupResponseJson.error, 'Votre identifiant doit contenir entre 2 et 20 caractères');
    });


});