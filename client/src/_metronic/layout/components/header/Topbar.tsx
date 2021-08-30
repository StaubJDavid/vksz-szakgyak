import clsx from 'clsx'
import React, {FC} from 'react'
import {KTSVG, PFP} from '../../../helpers'
import {HeaderNotificationsMenu, HeaderUserMenu, QuickLinks} from '../../../partials'
import {useLayout} from '../../core'
import {UserModel} from '../../../../app/modules/auth/models/UserModel'
import {RootState} from '../../../../setup'
import {shallowEqual, useSelector} from 'react-redux'

const toolbarButtonMarginClass = 'ms-1 ms-lg-3',
  toolbarButtonHeightClass = 'w-30px h-30px w-md-40px h-md-40px',
  toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px',
  toolbarButtonIconSizeClass = 'svg-icon-1'

const Topbar: FC = () => {
  const {config} = useLayout();
  const user: UserModel = useSelector<RootState>(({auth}) => auth.user, shallowEqual) as UserModel

  return (
    <div className='d-flex align-items-stretch flex-shrink-0'>
      {/* Search */}
      {/* <div className={clsx('d-flex align-items-stretch', toolbarButtonMarginClass)}>
        <Search />
      </div> */}
      
      {/* Activities */}

      {/*<div className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}>
        <div
          className={clsx('btn btn-icon btn-active-light-primary', toolbarButtonHeightClass)}
          id='kt_activities_toggle'
        >
          <KTSVG
            path='/media/icons/duotone/Media/Equalizer.svg'
            className={toolbarButtonIconSizeClass}
          />
        </div>
      </div>*/}

      {/* Quick links */}
      {/*<div className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}>
        <div
          className={clsx('btn btn-icon btn-active-light-primary', toolbarButtonHeightClass)}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          data-kt-menu-flip='bottom'
        >
          <KTSVG
            path='/media/icons/duotone/Layout/Layout-4-blocks.svg'
            className={toolbarButtonIconSizeClass}
          />
        </div>
        <QuickLinks />
      </div>*/}

      {/* CHAT */}
      {/*
      <div className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}>
        <div
          className={clsx(
            'btn btn-icon btn-active-light-primary position-relative',
            toolbarButtonHeightClass
          )}
          id='kt_drawer_chat_toggle'
        >
          <KTSVG
            path='/media/icons/duotone/Communication/Group-chat.svg'
            className={toolbarButtonIconSizeClass}
          />

          <span className='bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink'></span>
        </div>
      </div>*/}

      {/* NOTIFICATIONS */}

      {/*<div className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}>
        <div
          className={clsx(
            'btn btn-icon btn-active-light-primary position-relative',
            toolbarButtonHeightClass
          )}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          data-kt-menu-flip='bottom'
        >
          <KTSVG
            path='/media/icons/duotone/Code/Compiling.svg'
            className={toolbarButtonIconSizeClass}
          />
        </div>
        <HeaderNotificationsMenu />
      </div>*/}

      {/* begin::User */}
      <div
        className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}
        id='kt_header_user_menu_toggle'
      >
        {/* begin::Toggle */}
        <div
          className={clsx('cursor-pointer symbol', toolbarUserAvatarHeightClass)}
          data-kt-menu-trigger='click'
          data-kt-menu-attach='parent'
          data-kt-menu-placement='bottom-end'
          data-kt-menu-flip='bottom'
        >
          <img src={PFP(user.pic === undefined?'':user.pic)} alt='metronic' />
        </div>
        <HeaderUserMenu />
        {/* end::Toggle */}
      </div>
      {/* end::User */}

      {/* begin::Aside Toggler */}
      {config.header.left === 'menu' && (
        <div className='d-flex align-items-center d-lg-none ms-2 me-n3' title='Show header menu'>
          <div
            className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
            id='kt_header_menu_mobile_toggle'
          >
            <KTSVG path='/media/icons/duotone/Text/Toggle-Right.svg' className='svg-icon-1' />
          </div>
        </div>
      )}
    </div>
  )
}

export {Topbar}
