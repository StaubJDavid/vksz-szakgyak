import React, {FC} from 'react';
//, useState, useEffect
import {useSelector, shallowEqual} from 'react-redux'
import {RootState} from '../../setup'
//import { UserCommunicationModel } from '../modules/auth/models/UserCommunicationModel'
// import * as auth from '../modules/auth/redux/AuthRedux'
// import {getUsers} from '../modules/auth/redux/AuthCRUD'
// import {UserModel} from '../modules/auth/models/UserModel'
import {Notifications} from '../modules/accounts/components/settings/cards/Notifications'
import {UsersTablesWidget} from '../../_metronic/partials/widgets/tables/UsersTablesWidget'
// import { isConstructorTypeNode } from 'typescript';
var jwt = require('jsonwebtoken');

const StateTest: FC = () => {
    
    
    const accessToken = useSelector<RootState>(({auth}) => auth.accessToken, shallowEqual);
    var decode1 = jwt.decode(accessToken);
    const role = decode1.role;
    
    return (
        <>    
        {role === 'admin' ? <UsersTablesWidget className='card-xxl-stretch mb-5 mb-xl-8'/> :<></>}
        <Notifications />
        </>
    )

    
}

//const isAuthorized = useSelector<RootState>(({auth}) => auth.user, shallowEqual)
export {StateTest}