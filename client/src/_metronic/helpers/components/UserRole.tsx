//import React from 'react'
// import {useSelector} from 'react-redux'
// import * as auth from '../../../app/modules/auth/redux/AuthRedux'
import {RootState} from '../../../setup'
import {shallowEqual, useSelector} from 'react-redux'
var jwt = require('jsonwebtoken');


function GetRole(){
    const accessToken = useSelector<RootState>(({auth}) => auth.accessToken, shallowEqual);
    var decode1 = jwt.decode(accessToken);
    const role = decode1.role;

    return role;
};

export {GetRole}