const express = require('express');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

require('dotenv').config();

function sendEmailVerification(email){
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const toEmail = email;

    const emailToken = jwt.sign(
        {user: email},
        process.env.SECRET_KEY,
        {expiresIn: "1h"},
    );

    const url = `${process.env.API_URL}/api/auth/confirmation/${emailToken}`;

    // console.log(emailToken);

    var mailOptions = {
        from: process.env.EMAIL_USERNAME,
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