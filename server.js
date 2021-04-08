var restify = require('restify');
var app = restify.createServer();

const PORT = 8080 || process.env.PORT

app.get('/', (req,res) => {
  res.send("Hello world")
})

app.listen(PORT, function() {
  console.log(`App listening on PORT ${PORT}`);
});