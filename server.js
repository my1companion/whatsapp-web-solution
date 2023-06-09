var express = require('express');
var app = express();
var client = require('./example');
const cors = require('cors');
const bodyParser = require('body-parser');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const puppeteer = require('puppeteer');
const http = require('https');

app.use(cors()); 
app.use(express.static('public'));
app.use(bodyParser.json());


var isReady = false;

client.on('ready', () => {
    console.log('READY');
    isReady = true;

//     try{
//     const sendMessage = client.sendMessage(`2348137757470@c.us`,"Hi Adeyinka");
// }catch(err){
//     console.log(err);
// }
});


// (async () => {
//   const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage',
//         '--single-process']});

//   const page = await browser.newPage();
//   await page.goto('https://web.whatsapp.com');
//   await page.waitFor(3000);
//   // await page.screenshot({ path: 'example.png' });


//         await page.screenshot().then(function(buffer) {
//             res.setHeader('Content-Disposition', 'attachment;filename="mycompanion.png"');
//             res.setHeader('Content-Type', 'image/png');
//             res.send(buffer);
//         });

//   await browser.close();
// })();

app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/', function (req, res) {
//     try{
//     const sendMessage = client.sendMessage(`2348137757470@c.us`,"Hello World!");
// }catch(err){
//     console.log(err);
// }

//   res.send('Hello World');
(async () => {
	try{
        await client.pupPage.screenshot().then(function(buffer) {
            res.setHeader('Content-Disposition', 'attachment;filename="mycompanion.png"');
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        });
        }catch(err){
    console.log(err);
	res.send(err);
}

})();


})

app.post("/sendmessage", (req,res,next) =>{

if(isReady!=true){
	//notify ayrem
		http.get('https://ayrem.net/whatsappdisconnected.php', res=>{
		console.log(res);
		let data = [];
		res.on('data', chunk => {
		    data.push(chunk);
		  });

		  res.on('end', () => {
		    console.log('Response ended: ');

		  });	
				}).on('error', err => {
		  console.log('Error: ', err.message);
		});	

	return res.status(400).json('whatsapp not ready');
}
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

var server = app.listen(4000, function () {
  var host = server.address().address
  var port = server.address().port
   
  console.log("Example app listening at http://%s:%s", host, port)
})

// app.listen(process.env.PORT || 3031, ()=>{
//     console.log(`app is running ${process.env.PORT}`);
// });