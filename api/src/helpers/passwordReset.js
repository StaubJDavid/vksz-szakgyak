const express = require('express');
const jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

require('dotenv').config();

function passwordReset(email){
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const toEmail = email;

    const passwordToken = jwt.sign(
        {user: email, ver: "password"},
        process.env.SECRET_KEY,
        {expiresIn: "1h"},
    );

    const url = `${process.env.API_URL}/api/auth/reset-password/${passwordToken}`;

    // console.log(passwordToken);

    var mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: toEmail,
        subject: 'Password Reset',
        html: `Please click this url to reset your password: <a href="${url}">${url}</a>`
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            console.log('Sending false');
        } else {
            console.log('Sent password reset email');
            console.log('Email sent: ' + info.response);
        }
    });    
}

module.exports = passwordReset;