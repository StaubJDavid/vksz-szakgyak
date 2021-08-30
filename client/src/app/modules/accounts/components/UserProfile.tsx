/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {FC, useState, useEffect} from 'react'
import {UserModel} from '../../auth/models/UserModel'
import {getUserById} from '../../auth/redux/AuthCRUD'
import {Link} from 'react-router-dom'
import {PFP} from '../../../../_metronic/helpers'
import {ProfileDetails} from './settings/cards/ProfileDetails'
import {UserProfileDetails} from './settings/cards/UserProfileDetails'
import {UserNotifications} from './settings/cards/UserNotifications'
import * as auth from '../../auth/redux/AuthRedux'
import {useSelector} from 'react-redux'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import { UserPasswordEmail } from './settings/cards/UserPasswordEmail'
import { SendUserNotification } from './SendUserNotification'

const UserProfile: FC = () => {
  const pathString = window.location.pathname;
  // console.log(pathString.slice(6,pathString.length));

  const [isLoading, setLoading] = useState(true);
  // const [showSplashScreen, setShowSplashScreen] = useState(true)
  const [user, setData] = useState<UserModel>();
  useEffect(() => {
      const User = async () => {
        try {
          const response = await getUserById(parseInt(pathString.slice(6,pathString.length), 10));
          setData(response.data.user);
          setLoading(false)
        } catch (error) {
          console.log(error)
        }
      }
  
      User()
    }, []);


  return isLoading ? <LayoutSplashScreen /> : (
    <>   
      <UserProfileDetails id={user?.id === undefined?0:user.id}/> 
      <UserNotifications user={user!}/>
      <SendUserNotification user_id={user!.id} />
      <UserPasswordEmail id={user?.id === undefined?0:user.id} email={user?.email === undefined?'':user.email}/>
    </>
  )

  
}

export {UserProfile}