import React, {FC} from 'react';
import {Redirect, Switch} from 'react-router-dom'
import {UsersTablesWidget} from '../../_metronic/partials/widgets/tables/UsersTablesWidget'
import {GetRole} from '../../_metronic/helpers/components/UserRole'

const AdminBoard: FC = () => {
    
    return (
        <Switch>
        {GetRole() === 'user' ? (
          /*Redirect to / if user.*/
          <Redirect from='/admin-board' to='/' />
        ) : (
          /*Render adminboard if admin*/
          <>
            <UsersTablesWidget className='card-xxl-stretch mb-5 mb-xl-8'/>
          </>
        )}
      </Switch>
    )

    
}

export {AdminBoard}