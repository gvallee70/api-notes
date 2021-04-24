const assert = require('assert');
const user = require('./user')
const notes = require('./notes');


describe("le serveur devrait", () => {
    it('retourner un code 401 avec le message \'Utilisateur non connecté\' quand il reçoit une requête HTTP DELETE /notes/:id et que l\'utilisateur n\'est pas connecté', async () => {
        const deleteNoteResponse = await notes.delete(1)
        const deleteNoteResponseJson = await deleteNoteResponse.json()

        assert.equal(deleteNoteResponse.status, 401);
        assert.equal(deleteNoteResponseJson.error, 'Utilisateur non connecté');
    });


    it('retourner un code 404 avec le message \'Cet identifiant est inconnu\' quand il reçoit une requête HTTP DELETE /notes/:id et que :id ne correspond à aucune note stockée dans la base de données', async () => {
        const signinResponse = await user.signin('test', 'test')
        const signinResponseJson = await signinResponse.json()

        const deleteNoteResponse = await notes.delete(1, signinResponseJson.token)
        const deleteNoteResponseJson = await deleteNoteResponse.json()

        assert.equal(deleteNoteResponse.status, 404);
        assert.equal(deleteNoteResponseJson.error,  'Cet identifiant est inconnu');
    });

    


    it('retourner un code 403 avec le message \'Accès non autorisé à cette note\' quand il reçoit une requête HTTP DELETE /notes/:id et que l\'id de la note appartient à un autre utilisateur', async () => {
        const signinResponse = await user.signin('test', 'test')
        const signinResponseJson = await signinResponse.json()

        const getNotesResponse = await notes.getAll(signinResponseJson.token)

        const getNotesResponseJson = await getNotesResponse.json()
        const signinOtherUserResponse = await user.signin('testt', 'testt')
        const signinOtherUserResponseJson = await signinOtherUserResponse.json()

        const deleteNoteResponse = await notes.delete(getNotesResponseJson.notes[0]._id
            ,signinOtherUserResponseJson.token)
        const deleteNoteResponseJson = await deleteNoteResponse.json()

        assert.equal(deleteNoteResponse.status, 403);
        assert.equal(deleteNoteResponseJson.error,  'Accès non autorisé à cette note');
    });


    it('retourner un code 200 avec la propriété error == null quand il reçoit une requête HTTP DELETE /notes/:id et que la note a bien été supprimée', async () => {
        const signinResponse = await user.signin('test', 'test')
        const signinResponseJson = await signinResponse.json()
 
        const getNotesResponse = await notes.getAll(signinResponseJson.token)

        const getNotesResponseJson = await getNotesResponse.json()

        const deleteNoteResponse = await notes.delete(getNotesResponseJson.notes[0]._id
            ,signinResponseJson.token)

        const deleteNoteResponseJson = await deleteNoteResponse.json()

        assert.equal(deleteNoteResponse.status, 200)
        assert.equal(deleteNoteResponseJson.error, null)

    });


});