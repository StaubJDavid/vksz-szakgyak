const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

var authRouter = require('./routes/auth');

app.use('/auth', authRouter);
app.get('/', (req, res) => {
    res.send('Home');
});

app.listen(process.env.PORT, () =>{
    console.log(`Listening to ${process.env.PORT}`);
});