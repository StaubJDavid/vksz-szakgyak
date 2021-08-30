import React from 'react'
import {ProfileDetails} from './cards/ProfileDetails'
import {SignInMethod} from './cards/SignInMethod'
import {ConnectedAccounts} from './cards/ConnectedAccounts'
import {EmailPreferences} from './cards/EmailPreferences'
import {Notifications} from './cards/Notifications'
import {DeactivateAccount} from './cards/DeactivateAccount'
import * as auth from '../../../auth/redux/AuthRedux'
import {useSelector} from 'react-redux'

export function Settings() {
  // const stuff = JSON.stringify(useSelector(auth.actions.fulfillUser));
  // const stuff2 = JSON.parse(stuff);
  // const user = stuff2.payload.user.auth.user;
  return (
    <>
      <ProfileDetails />
      <SignInMethod />
      <Notifications />
      {/*<DeactivateAccount />
      <ConnectedAccounts />
      <EmailPreferences />*/}
    </>
  )
}
