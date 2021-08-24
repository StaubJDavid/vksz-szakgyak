const Joi = require('joi');

// const { error, value } = Validate.validate({ 
    
// });

// if(!error){

// }else{
//     console.log('Error:')
//     console.log(error);
//     res.status(400).json(error.message);
// }

const joi_email = Joi.string().email().required();
const joi_lastname = Joi.string().alphanum().min(2).max(15).required(); 
const joi_firstname = Joi.string().min(2).max(15).required(); 
const joi_password = Joi.string().min(6).max(15).required();
const joi_zip = Joi.string().pattern(new RegExp('[0-9][0-9][0-9][0-9]')).min(4).max(4).required().messages({'string.pattern.base': `Zip contains non numerical value`});
const joi_city = Joi.string().min(2).max(35).required();
const joi_street = Joi.string().min(1).max(35).required();
const joi_house_number = Joi.string().min(1).max(10).required();
const joi_phone = Joi.string().min(10).max(11).regex(/^\d+$/).required().messages({'string.pattern.base': `phone contains non numerical value`});
const joi_avatar = Joi.string().base64();
const joi_id = Joi.number();

const registerValidate = Joi.object({
    email: joi_email,
    lastname: joi_lastname, 
    firstname: joi_firstname, 
    password: joi_password,
    zip: joi_zip,
    city: joi_city,
    street: joi_street,
    house_number: joi_house_number,
    phone: joi_phone
});

const loginValidate = Joi.object({
    email: joi_email
});

const emailValidate = Joi.object({
    email: joi_email
});

const changeEmailValidate = Joi.object({
    email: joi_email,
    req_user_id: joi_id,
    req_body_user_id: joi_id
});

const changePasswordValidate = Joi.object({
    password: joi_password,
    repeat_password: Joi.ref('password'),
    req_user_id: joi_id,
    req_body_user_id: joi_id
});

const changeDetailsValidate = Joi.object({
    req_user_id: joi_id,
    req_body_user_id: joi_id,
    lastname: joi_lastname, 
    firstname: joi_firstname,
    zip: joi_zip,
    city: joi_city,
    street: joi_street,
    house_number: joi_house_number,
    phone: joi_phone
});

const avatarValidate = Joi.object({
    req_user_id: joi_id,
    req_body_user_id: joi_id,
    avatar: joi_avatar
});

const idValidate = Joi.object({
    req_user_id: joi_id,
    req_body_user_id: joi_id
});

module.exports.registerValidate = registerValidate
module.exports.loginValidate = loginValidate
module.exports.emailValidate = emailValidate
module.exports.changeDetailsValidate = changeDetailsValidate
module.exports.avatarValidate = avatarValidate
module.exports.idValidate = idValidate
module.exports.changeEmailValidate = changeEmailValidate
module.exports.changePasswordValidate = changePasswordValidate