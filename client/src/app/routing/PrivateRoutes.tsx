import React, {Suspense, lazy} from 'react'
import {Redirect, Route, Switch} from 'react-router-dom'
import {FallbackView} from '../../_metronic/partials'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {MenuTestPage} from '../pages/MenuTestPage'
import {AdminBoard} from '../pages/AdminBoard'
import {GetRole} from '../../_metronic/helpers/components/UserRole'
import {UserProfile} from '../modules/accounts/components/UserProfile'
import {SendUsersNotification} from '../modules/accounts/components/SendUsersNotification'
import {SendUserNotification} from '../modules/accounts/components/SendUserNotification'


export function PrivateRoutes() {
  const BuilderPageWrapper = lazy(() => import('../pages/layout-builder/BuilderPageWrapper'))
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))

  return (
    <Suspense fallback={<FallbackView />}>
      <Switch>
        <Route path='/dashboard' component={DashboardWrapper} />
        {/*<Route path='/builder' component={BuilderPageWrapper} />
        <Route path='/crafted/pages/profile' component={ProfilePage} />
        <Route path='/crafted/pages/wizards' component={WizardsPage} />
        <Route path='/crafted/widgets' component={WidgetsPage} />
        <Route path='/apps/chat' component={ChatPage} />
        <Route path='/menu-test' component={MenuTestPage} />*/}
        <Route path='/admin-board' component={AdminBoard} />
        <Route path='/crafted/account' component={AccountPage} />
        {GetRole() === 'admin'?(<Route path='/user/:id' component={UserProfile} />):(<><Redirect from='/' to='/dashboard' /><Redirect exact from='/user' to='/dashboard' /></>)}
        {GetRole() === 'admin'?(<Route path='/send-users-notification' component={SendUsersNotification} />):(<><Redirect from='/' to='/dashboard' /><Redirect exact from='/send-users-notification' to='/dashboard' /></>)}
        {/*{GetRole() === 'admin'?(<Route path='/send-user-notification/:id' component={SendUserNotification} />):(<><Redirect from='/' to='/dashboard' /><Redirect exact from='/send-user-notification' to='/dashboard' /></>)}*/}
        <Redirect from='/auth' to='/dashboard' />
        {GetRole() === 'user'?(<Redirect exact from='/' to='/dashboard' />):(<Redirect exact from='/' to='/admin-board' />)}
        <Redirect to='error/404' />
      </Switch>
    </Suspense>
  )
}
