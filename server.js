var express = require('express');
var app = express();
var client = require('./example');
const { MessageMedia} = require('./index');

const cors = require('cors');
const bodyParser = require('body-parser');
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const puppeteer = require('puppeteer');
const http = require('https');

app.use(cors()); 
app.use(express.static('public'));
app.use(bodyParser.json());


var isReady = false;
var newsletterMessage ="";
client.on('ready', () => {
    console.log('READY');
    isReady = true;

//     try{
//     const sendMessage = client.sendMessage(`2348137757470@c.us`,"Hi Adeyinka");
// }catch(err){
//     console.log(err);
// }
});


client.on('message', async msg => {
    console.log('MESSAGE RECEIVED', msg);
//change this for whatsapp client
    if(msg.from.includes("7069205659")){

      newsletterMessage = msg.body;
    }
    console.log("newsletterMessage: "+newsletterMessage)
    return;
//     http.get('http://mycompanion.com.ng/whatsapp.php', res=>{
//     console.log(res);
// let data = [];
// res.on('data', chunk => {
//     data.push(chunk);
//   });

//   res.on('end', () => {
//     console.log('Response ended: ');

//   });  
//     }).on('error', err => {
//   console.log('Error: ', err.message);
// });

    //notifiy sociallender
    // var data = {phone:msg.from, body:msg.body}
    // data = JSON.stringify(data);

    // var config = {
    //   method: 'post',
    //   url: 'http://sociallenderng.com/apisl/v3/callbacks/whatsappwebapi',
    //   headers: { 
    //     'Content-Type': 'text/plain'
    //   },
    //   data : data
    // };

    // axios(config)
    // .then(function (response) {
    //   console.log(response.data);
    // })
    // .catch(function (error) {
    //   console.log(error);
    // });

    if (msg.body === '!ping reply') {
        // Send a new message as a reply to the current one
        msg.reply('pong');

    } else if (msg.body === '!ping') {
        // Send a new message to the same chat
        client.sendMessage(msg.from, 'pong');

    } else if (msg.body.startsWith('!sendto ')) {
        // Direct send a new message to specific id
        let number = msg.body.split(' ')[1];
        let messageIndex = msg.body.indexOf(number) + number.length;
        let message = msg.body.slice(messageIndex, msg.body.length);
        number = number.includes('@c.us') ? number : `${number}@c.us`;
        let chat = await msg.getChat();
        chat.sendSeen();
        client.sendMessage(number, message);

    } else if (msg.body.startsWith('!subject ')) {
        // Change the group subject
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newSubject = msg.body.slice(9);
            chat.setSubject(newSubject);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!echo ')) {
        // Replies with the same message
        msg.reply(msg.body.slice(6));
    } else if (msg.body.startsWith('!desc ')) {
        // Change the group description
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newDescription = msg.body.slice(6);
            chat.setDescription(newDescription);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!leave') {
        // Leave the group
        let chat = await msg.getChat();
        if (chat.isGroup) {
            chat.leave();
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!join ')) {
        const inviteCode = msg.body.split(' ')[1];
        try {
            await client.acceptInvite(inviteCode);
            msg.reply('Joined the group!');
        } catch (e) {
            msg.reply('That invite code seems to be invalid.');
        }
    } else if (msg.body === '!groupinfo') {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!chats') {
        const chats = await client.getChats();
        client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
    } else if (msg.body === '!info') {
        let info = client.info;
        client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.wid.user}
            Platform: ${info.platform}
        `);
    } else if (msg.body === '!mediainfo' && msg.hasMedia) {
        const attachmentData = await msg.downloadMedia();
        msg.reply(`
            *Media info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `);
    } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();

        quotedMsg.reply(`
            ID: ${quotedMsg.id._serialized}
            Type: ${quotedMsg.type}
            Author: ${quotedMsg.author || quotedMsg.from}
            Timestamp: ${quotedMsg.timestamp}
            Has Media? ${quotedMsg.hasMedia}
        `);
    } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            const attachmentData = await quotedMsg.downloadMedia();
            client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
        }
    } else if (msg.body === '!location') {
        msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
    } else if (msg.location) {
        msg.reply(msg.location);
    } else if (msg.body.startsWith('!status ')) {
        const newStatus = msg.body.split(' ')[1];
        await client.setStatus(newStatus);
        msg.reply(`Status was updated to *${newStatus}*`);
    } else if (msg.body === '!mention') {
        const contact = await msg.getContact();
        const chat = await msg.getChat();
        chat.sendMessage(`Hi @${contact.number}!`, {
            mentions: [contact]
        });
    } else if (msg.body === '!delete') {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.fromMe) {
                quotedMsg.delete(true);
            } else {
                msg.reply('I can only delete my own messages');
            }
        }
    } else if (msg.body === '!pin') {
        const chat = await msg.getChat();
        await chat.pin();
    } else if (msg.body === '!archive') {
        const chat = await msg.getChat();
        await chat.archive();
    } else if (msg.body === '!mute') {
        const chat = await msg.getChat();
        // mute the chat for 20 seconds
        const unmuteDate = new Date();
        unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
        await chat.mute(unmuteDate);
    } else if (msg.body === '!typing') {
        const chat = await msg.getChat();
        // simulates typing in the chat
        chat.sendStateTyping();
    } else if (msg.body === '!recording') {
        const chat = await msg.getChat();
        // simulates recording audio in the chat
        chat.sendStateRecording();
    } else if (msg.body === '!clearstate') {
        const chat = await msg.getChat();
        // stops typing or recording in the chat
        chat.clearState();
    } else if (msg.body === '!jumpto') {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            client.interface.openChatWindowAt(quotedMsg.id._serialized);
        }
    } else if (msg.body === '!buttons') {
        let button = new Buttons('Button body',[{body:'bt1'},{body:'bt2'},{body:'bt3'}],'title','footer');
        client.sendMessage(msg.from, button);
    } else if (msg.body === '!list') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    } else if (msg.body === '!reaction') {
        msg.react('👍');
    }
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
      var media;
async function sendMedia(receiver,mediaUrl){
       media = await MessageMedia.fromUrl(mediaUrl);
       client.sendMessage(receiver,media);    

}
app.post("/sendmessage", (req,res,next) =>{

if(isReady!=true){

	return res.status(400).json('whatsapp not ready');
}
	const {body: {message, recepient, mediaLink}} = req;

	if(!message || !recepient){
		return res.status(400).json('incomplete credentials');
	}
	var receiver = recepient+"@c.us";
	
    try{
   //   setInterval(function(){
    var sendMessage = client.sendMessage(receiver,message);
    if(mediaLink){
        sendMedia(receiver,mediaLink);

    }
   // },1000)

}catch(err){
    console.log(err);
	res.send(err);
}

   res.send('Sent');
	
})

app.post("/sendnewsletter", (req,res,next) =>{

if(isReady!=true){

  return res.status(400).json('whatsapp not ready');
}
  const {body: {recepient, mediaLink}} = req;

  if(!recepient){
    return res.status(400).json('incomplete credentials');
  }
  var receiver = recepient+"@c.us";
  
    try{
   //   setInterval(function(){
    var sendMessage = client.sendMessage(receiver,newsletterMessage);
    if(mediaLink){
        sendMedia(receiver,mediaLink);

    }
   // },1000)

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