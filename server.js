var express = require('express');
var app = express();
var client = require('./example');
//whatsapp();

app.use(express.static('public'));


app.get('/', function (req, res) {
    try{
    const sendMessage = client.sendMessage(`2348137757470@c.us`,"Hello World!");
}catch(err){
    console.log(err);
}

   res.send('Hello World');

})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})