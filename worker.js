const amqp = require('amqplib/callback_api');
const nodemailer = require('nodemailer');

function sendEmailTo(recieverEmail) {
  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false, 
        auth: {
          user: account.user,
          pass: account.pass
        }
    });

    let mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>',
        to: recieverEmail,
        subject: 'Subscription ✔',
        text: 'You are subscribed successfully.',
        html: '<b>You are subscribed successfully.</b>'
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  });
}

amqp.connect('amqp://localhost', function(err, conn) {

  conn.createChannel(function(err, ch) {
    const q = 'email';
    ch.assertQueue(q, { durable: true });
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

    ch.consume(q, async function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      let form = JSON.parse(msg.content.toString());
      await sendEmailTo(form.email);
      ch.ack(msg);
    }, { noAck: false });

  });
});