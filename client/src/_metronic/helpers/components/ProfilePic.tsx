//import React from 'react'
import {useSelector} from 'react-redux'
import * as auth from '../../../app/modules/auth/redux/AuthRedux'



function PFP(){
    const stuff = JSON.stringify(useSelector(auth.actions.fulfillUser));
    const stuff2 = JSON.parse(stuff);
    const user = stuff2.payload.user.auth.user;
    return 'data:image/jpeg;base64,' + Buffer.from(user.pic.data, "base64").toString();
};

export {PFP}