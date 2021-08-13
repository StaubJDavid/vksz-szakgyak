import React, {FC} from 'react';
import {useSelector, shallowEqual} from 'react-redux'
import {RootState} from '../../setup'
import * as auth from '../modules/auth/redux/AuthRedux'
var jwt = require('jsonwebtoken');

const StateTest: FC = () => {
    
    const accessToken = useSelector<RootState>(({auth}) => auth.accessToken, shallowEqual);
    const stuff = JSON.stringify(useSelector(auth.actions.fulfillUser));
    const stuff2 = JSON.parse(stuff);
    const user = stuff2.payload.user.auth.user;
    //const accessToken = stuff2.payload.user.auth.accessToken;
    var decode1 = jwt.decode(accessToken);
    console.log(decode1);
    //console.log(stuff2.payload.user.auth.user);
    return (
        <div>
            <p>StateTest</p>
            {accessToken}
            <br/>
            <ol>
                <li>{decode1.role}</li>
                {
                Object.keys(user).map((item,i) => (
                    <li className="travelcompany-input" key={i}>
                        <span className="input-label">key: {Object.keys(user)[i]} Name: {user[item]}</span>
                    </li>
                ))
                }
            </ol>
        </div>
    )

    
}

//const isAuthorized = useSelector<RootState>(({auth}) => auth.user, shallowEqual)
export {StateTest}