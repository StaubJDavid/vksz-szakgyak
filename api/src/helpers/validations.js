const Joi = require('joi');

// const { error, value } = Validate.validate({ 
    
// });

// if(!error){

// }else{
//     console.log('Error:')
//     console.log(error);
//     res.status(400).json(error.message);
// }
// const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!"#$%&'()*+,-.\/:;<=>?@\[\]\\^_`{}~])(?=.{8,})/gm;

const joi_email = Joi.string().email().required();
const joi_email_regex = Joi.string().pattern(new RegExp('^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,})')).required().messages({'string.pattern.base': `Something wrong`});
const joi_lastname = Joi.string().min(2).max(20).required(); 
const joi_firstname = Joi.string().min(2).max(20).required(); 
const joi_password = Joi.string().pattern(new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#$%&()"\'\[\\\]*+,-./{}~])(?=.{8,})')).required().messages({'string.pattern.base': `Password is bad`});;
const joi_zip = Joi.string().pattern(new RegExp('[0-9][0-9][0-9][0-9]')).min(4).max(4).required().messages({'string.pattern.base': `Zip contains non numerical value`});
const joi_city = Joi.string().min(2).max(35).required();
const joi_street = Joi.string().min(1).max(35).required();
const joi_house_number = Joi.string().min(1).max(10).required();
const joi_phone = Joi.string().regex(/^^((?:\+?3|0)6)(?:\s|-|\()?(\d{1,2})(?:\s|-|\))?(\d{3})-?\s?(\d{3,4})$/).required().messages({'string.pattern.base': `06/+36 xx xxx xxxx`});
const joi_avatar = Joi.string().base64();
const joi_id = Joi.number().required();
const joi_device_token = Joi.string().required(); 

const emailTestValidate = Joi.object({
    password: joi_password
});

const registerValidate = Joi.object({
    email: joi_email,
    lastname: joi_lastname, 
    firstname: joi_firstname, 
    password: joi_password,
    zip: joi_zip,
    city: joi_city,
    street: joi_street,
    house_number: joi_house_number,
    phone: joi_phone,
    device_token: joi_device_token
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

const sendUsersNotifValidate = Joi.object({
    service_id: joi_id,
    notif_id: joi_id,
    title: Joi.string(),
    message: Joi.string()
});

const sendUserNotifValidate = Joi.object({
    notif_id: joi_id,
    title: Joi.string(),
    message: Joi.string(),
    user_id: joi_id
});

module.exports.registerValidate = registerValidate
module.exports.loginValidate = loginValidate
module.exports.emailValidate = emailValidate
module.exports.changeDetailsValidate = changeDetailsValidate
module.exports.avatarValidate = avatarValidate
module.exports.idValidate = idValidate
module.exports.changeEmailValidate = changeEmailValidate
module.exports.changePasswordValidate = changePasswordValidate
module.exports.sendUsersNotifValidate = sendUsersNotifValidate
module.exports.sendUserNotifValidate = sendUserNotifValidate
module.exports.emailTestValidate = emailTestValidate