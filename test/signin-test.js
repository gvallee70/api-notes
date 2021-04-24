const assert = require('assert');
const user = require('./user')


describe("le serveur devrait", () => {
    it('retourner un code 400 avec le message \'Le mot de passe doit contenir au moins 4 caractères\' quand il reçoit une requête HTTP POST /signin et que password contient moins de 4 caractères', async () => {
        const signinResponse = await user.signin('test', 'tes')
        const signinResponseJson = await signinResponse.json()

        assert.equal(signinResponse.status, 400);
        assert.equal(signinResponseJson.error, 'Le mot de passe doit contenir au moins 4 caractères');
    });

    it('retourner un code 400 avec le message \'Votre identifiant ne doit contenir que des lettres minuscules non accentuées\' quand il reçoit une requête HTTP POST /signin et que username contient un caractère autre que des lettres non accentuées', async () => {
        const signinResponse = await user.signin('test#', 'test')
        const signinResponseJson = await signinResponse.json()

        assert.equal(signinResponse.status, 400);
        assert.equal(signinResponseJson.error, 'Votre identifiant ne doit contenir que des lettres minuscules non accentuées');
    });


    it('retourner un code 400 avec le message \'Votre identifiant doit contenir entre 2 et 20 caractères\' quand il reçoit une requête HTTP POST /signin et que username contient moins de 2 caractères ou plus de 20 caractères', async () => {
        const signinResponse = await user.signin('t', 'test')
        const signinResponseJson = await signinResponse.json()

        assert.equal(signinResponse.status, 400);
        assert.equal(signinResponseJson.error, 'Votre identifiant doit contenir entre 2 et 20 caractères');
    });


});