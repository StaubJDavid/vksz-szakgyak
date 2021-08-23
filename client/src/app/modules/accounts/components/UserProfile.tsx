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
    {/*User Profile BEGIN*/}
    <div className='card mb-5 mb-xl-10' id='kt_profile_details_view'>
      
      {/*Profile Header BEGIN*/}
      <div className='card-header'>
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>Profile Details</h3>
        </div>
        <Link to='/admin-board' className='btn btn-primary align-self-center'>
            Back
        </Link>
      </div>
      {/*Profile Header END*/}
    
      {/*User Profile Body Begin*/}
      <div className='card-body p-9'>

        {/*Avatar*/}
        <div className='row mb-7 align-middle'>
          <label className='col-lg-4 fw-bold text-muted'>Avatar</label>

          <div className='col-lg-8'>
            <div className='symbol symbol-100px symbol-lg-160px symbol-fixed position-relative'>
              <img src={PFP(user?.pic === undefined?'':user?.pic)} alt='Metronic' />
              <div className='position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px'></div>
            </div>
          </div>
        </div>

        {/*UserId*/}
        <div className='row mb-7'>
          <label className='col-lg-4 fw-bold text-muted'>User Id</label>

          <div className='col-lg-8'>
            <span className='fw-bolder fs-6 text-dark'>{user?.id}</span>
          </div>
        </div>

        {/*Full Name*/}
        <div className='row mb-7'>
          <label className='col-lg-4 fw-bold text-muted'>Full Name</label>

          <div className='col-lg-8'>
            <span className='fw-bolder fs-6 text-dark'>{user?.lastname} {user?.firstname}</span>
          </div>
        </div>

        {/*Email*/}
        <div className='row mb-7'>
          <label className='col-lg-4 fw-bold text-muted'>Email</label>

          <div className='col-lg-8'>
            <span className='fw-bolder fs-6 text-dark'>{user?.email}</span>
          </div>
        </div>

        {/*Address*/}
        <div className='row mb-7'>
          <label className='col-lg-4 fw-bold text-muted'>Address</label>

          <div className='col-lg-8'>
            <span className='fw-bolder fs-6 text-dark'>{user?.zip} {user?.city} {user?.street} {user?.house_number}</span>
          </div>
        </div>
        
        {/*Phone*/}
        <div className='row mb-7'>
          <label className='col-lg-4 fw-bold text-muted'>Phone</label>

          <div className='col-lg-8'>
            <span className='fw-bolder fs-6 text-dark'>{user?.phone}</span>
          </div>
        </div>
        
      </div>
      {/*User Profile BODY END*/}        
    </div>
    {/*User Profile END*/}    
    <UserProfileDetails id={user?.id === undefined?0:user.id}/> 
    <UserNotifications user={user!}/>
    <UserPasswordEmail id={user?.id === undefined?0:user.id} email={user?.email === undefined?'':user.email}/>
  </>
  )

  
}

export {UserProfile}