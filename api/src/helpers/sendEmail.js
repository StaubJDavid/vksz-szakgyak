var nodemailer = require('nodemailer');

require('dotenv').config();

function sendEmail(email, subject, message){
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    var mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: subject,
        html: message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            console.log('Sending false');
        } else {
            console.log('Sent email');
            console.log('Email sent: ' + info.response);
        }
    });    
}

module.exports = sendEmail;