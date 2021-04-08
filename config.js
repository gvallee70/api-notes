module.exports = {
    port: process.env.PORT || 8080,
    db: {
        name: "notes-api",
        uri: "mongodb+srv://admin:admin@notes-api.ezzrd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    },
};