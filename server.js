var restify = require('restify');
var app = restify.createServer();
const { uri, dbName, client } = require('./mongodb-connection')

const PORT = 8080 || process.env.PORT

app.get('/', (req,res) => {
  res.send("Hello world")
  console.log(uri)
})

app.listen(PORT, function() {
  console.log(`App listening on PORT ${PORT}`);
});