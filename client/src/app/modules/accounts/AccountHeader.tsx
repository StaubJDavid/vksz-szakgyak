/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
//, {useEffect, useState}
import {PFP} from '../../../_metronic/helpers'
//import {toAbsoluteUrl} from '../../../_metronic/helpers'
import {Link} from 'react-router-dom'
// import {Dropdown1} from '../../../_metronic/partials'
import {useLocation} from 'react-router'
import {useSelector} from 'react-redux'
import * as auth from '../auth/redux/AuthRedux'
// import {UserModel} from '../auth/models/UserModel'
// import {getUserByEmail} from '../auth/redux/AuthCRUD'

const AccountHeader: React.FC = () => {
  const location = useLocation()

  const stuff = JSON.stringify(useSelector(auth.actions.fulfillUser));
  const stuff2 = JSON.parse(stuff);
  const user = stuff2.payload.user.auth.user;
  // console.log(user);

  return (
    <div className='card mb-5 mb-xl-10'>
      <div className='card-body pt-9 pb-0'>
        <div className='d-flex flex-wrap flex-sm-nowrap mb-3'>
          <div className='me-7 mb-4'>
            <div className='symbol symbol-100px symbol-lg-160px symbol-fixed position-relative'>
              <img src={PFP(user.pic === undefined?'':user.pic)} alt='Metronic' />
              <div className='position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px'></div>
              {/*<form>
                <input type="file" accept=".jpg, .png, .jpeg" />
              </form>*/}
            </div>
          </div>

          <div className='flex-grow-1'>
            <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
              <div className='d-flex flex-column'>
                <div className='d-flex align-items-center mb-2'>
                  <a href='#' className='text-gray-800 text-hover-primary fs-2 fw-bolder me-1'>
                    {user.lastname} {user.firstname}
                  </a>           
                </div>
              </div>
            </div>

            <div className='d-flex flex-wrap flex-stack'>
              <div className='d-flex flex-column flex-grow-1 pe-8'>
                <div className='d-flex flex-wrap'>
                  <span className='fw-bold fs-6'>{user.zip} {user.city} {user.street} {user.house_number}</span>
                </div>
                <div className='d-flex flex-wrap'>
                  <span className='fw-bold fs-6'>Telefonszám: {user.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='d-flex overflow-auto h-55px'>
          <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap'>
            <li className='nav-item'>
              <Link
                className={
                  `nav-link text-active-primary me-6 ` +
                  (location.pathname === '/crafted/account/overview' && 'active')
                }
                to='/crafted/account/overview'
              >
                Overview
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                className={
                  `nav-link text-active-primary me-6 ` +
                  (location.pathname === '/crafted/account/settings' && 'active')
                }
                to='/crafted/account/settings'
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export {AccountHeader}
