const express = require('express');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

function sendEmailVerification(email){
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'isabella.daugherty58@ethereal.email',
            pass: 'bCMKFutjxc9MVXxe77'
        }
    });

    const toEmail = email;

    const emailToken = jwt.sign(
        {user: email},
        process.env.SECRET_KEY,
        {expiresIn: "1h"},
    );

    const url = `http://localhost:3001/api/auth/confirmation/${emailToken}`;

    // console.log(emailToken);

    var mailOptions = {
        from: 'isabelsadla.daugherty58@ethereal.email',
        to: toEmail,
        subject: 'Confirmation email',
        html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            console.log('Sending false');
        } else {
            console.log('Sent email verification');
            console.log('Email sent: ' + info.response);
        }
    });    
}

module.exports = sendEmailVerification;