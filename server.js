var express = require('express');
var app = express();
var client = require('./example');
const cors = require('cors');
const bodyParser = require('body-parser');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const puppeteer = require('puppeteer');

app.use(cors()); 
app.use(express.static('public'));
app.use(bodyParser.json());


(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
        '--single-process']});

  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com');
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/', function (req, res) {
    try{
    const sendMessage = client.sendMessage(`2348137757470@c.us`,"Hello World!");
}catch(err){
    console.log(err);
}

   res.send('Hello World');

})

app.post("/sendmessage", (req,res,next) =>{

	const {body: {message, recepient}} = req;

	if(!message || !recepient){
		return res.status(400).json('incomplete credentials');
	}
	var receiver = recepient+"@c.us";
	
    try{
    const sendMessage = client.sendMessage(receiver,message);
}catch(err){
    console.log(err);
	res.send(err);
}

   res.send('Sent');
	
})

//var server = app.listen(8081, function () {
//   var host = server.address().address
//   var port = server.address().port
   
//   console.log("Example app listening at http://%s:%s", host, port)
//})

app.listen(process.env.PORT || 3031, ()=>{
    console.log(`app is running ${process.env.PORT}`);
});