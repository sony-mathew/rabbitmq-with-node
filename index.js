const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const amqp = require('amqplib/callback_api');

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.render('index.html');
});

app.post('/subscribe', (req, res) => {
  sendToQueue(req.body);
  res.send('Thank you. You are successfully subscribed.');
});

app.listen(3000, () => console.log('App is listening on port 3000!'));

function sendToQueue(msg) {
  amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
      const q = 'email';
      ch.assertQueue(q, { durable: true });
      ch.sendToQueue(q, new Buffer(JSON.stringify(msg)), { persistent: true });
      console.log("Message sent to queue : ", msg);
    });
  });
}