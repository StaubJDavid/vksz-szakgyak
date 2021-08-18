/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState, useEffect} from 'react'
import { useHistory } from 'react-router-dom';
import {KTSVG, PFP} from '../../../helpers'
import {UserModel} from '../../../../app/modules/auth/models/UserModel'
import {getUsers, userBlockUnblock} from '../../../../app/modules/auth/redux/AuthCRUD'

type Props = {
  className: string
}

function onBlockClick(id:number, email:string){
  console.log(id);
  userBlockUnblock(id,email).then(({data: {result}}) => {
    console.log('Visszakaptam: ' + result);   
  }).catch((error) => {
    console.log('Error');
  })
}

const UsersTablesWidget: React.FC<Props> = ({className}) => {
  let history = useHistory();
  const [users, setData] = useState<UserModel[]>([]);
  useEffect(() => {
      const Users = async () => {
        try {
          const response = await getUsers();
          //usersStuff = ;
          setData(response.data.users);
        } catch (error) {
          console.log(error)
        }
      }
  
      Users()
    }, []);

  function onEmailClick(id:number){
    console.log('Clicked');
    let index = users.findIndex((element:UserModel) => element.id === id);
    console.log(users[index]);
    history.push({
      pathname: `/user/${users[index].id}`
    })
  }

  function updateData(user:UserModel){
    let index = users.findIndex((element:UserModel) => element.email === user.email)
    
    setData([ ...users.slice(0,index),
              Object.assign({}, users[index], user),
              ...users.slice(index+1)
            ]);
  }

  return (
    <div className={`card ${className}`}>
      {/* begin::Header */}
      <div className='card-header border-0 pt-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label fw-bolder fs-3 mb-1'>Felhasználók</span>
          {/*<span className='text-muted mt-1 fw-bold fs-7'>Over 500 members</span>*/}
        </h3>
        
      </div>
      {/* end::Header */}
      {/* begin::Body */}
      <div className='card-body py-3'>
        {/* begin::Table container */}
        <div className='table-responsive'>
          {/* begin::Table */}
          <table className='table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4'>
            {/* begin::Table head */}
            <thead>
              <tr className='fw-bolder text-muted'>
                <th className='w-25px'>{/*The checkbox was here*/}</th>
                <th className='min-w-150px'>User</th>
                <th className='min-w-140px'>Email</th>
                <th className='min-w-120px'>Phone</th>
                <th className='min-w-100px text-center'>Actions</th>
              </tr>
            </thead>
            {/* end::Table head */}
            {/* begin::Table body */}
            <tbody>
              {/* begin::Table row */}
              {users.map((u:UserModel) => (
                <tr key={u.id} style={{backgroundColor: u.blacklisted ? '#dc3545' : 'white'}}>
                <td>
                  {/*<div className='form-check form-check-sm form-check-custom form-check-solid'>
                    <input className='form-check-input widget-9-check' type='checkbox' value='1' />
              </div>*/}
                </td>
                <td>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-45px me-5'>
                      <img src={PFP(u.pic === undefined?'':u.pic)} alt='' />
                    </div>
                    <div className='text-dark fw-bolder fs-6 d-flex justify-content-start flex-column'>                      
                        {u.lastname} {u.firstname}
                    </div>
                  </div>
                </td>
                <td>
                  <a href='#' className='text-dark fw-bolder text-hover-primary d-block fs-6' onClick={() => {onEmailClick(u.id);}}>
                    {u.email}
                  </a>
                </td>
                <td className='text-begin'>                  
                  <div className='text-dark fw-bolder fs-6 d-flex justify-content-start flex-column'>
                    {u.phone}
                  </div>                   
                </td>
                <td>
                  <div className='d-flex justify-content-center flex-shrink-0'>                   
                    <a                   
                      href='#'
                      onClick={() => {onBlockClick(u.id, u.email); updateData({id: u.id, email: u.email, firstname: u.firstname, lastname: u.lastname, phone: u.phone, blacklisted: u.blacklisted? 0:1})}}
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                    >
                      <KTSVG path='/media/icons/duotone/General/Trash.svg' className='svg-icon-3' />
                    </a>
                  </div>
                </td>
              </tr>          
              ))}             
              {/* end::Table row */}
              {/*<tr>
                <td>
                  <div className='form-check form-check-sm form-check-custom form-check-solid'>
                    <input className='form-check-input widget-9-check' type='checkbox' value='1' />
                  </div>
                </td>
                <td>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-45px me-5'>
                      <img src={toAbsoluteUrl('/media/avatars/150-3.jpg')} alt='' />
                    </div>
                    <div className='d-flex justify-content-start flex-column'>
                      <a href='#' className='text-dark fw-bolder text-hover-primary fs-6'>
                        Jessie Clarcson
                      </a>
                      <span className='text-muted fw-bold text-muted d-block fs-7'>
                        C#, ASP.NET, MS SQL
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <a href='#' className='text-dark fw-bolder text-hover-primary d-block fs-6'>
                    Agoda
                  </a>
                  <span className='text-muted fw-bold text-muted d-block fs-7'>
                    Houses &amp; Hotels
                  </span>
                </td>
                <td className='text-end'>
                  <div className='d-flex flex-column w-100 me-2'>
                    <div className='d-flex flex-stack mb-2'>
                      <span className='text-muted me-2 fs-7 fw-bold'>70%</span>
                    </div>
                    <div className='progress h-6px w-100'>
                      <div
                        className='progress-bar bg-danger'
                        role='progressbar'
                        style={{width: '70%'}}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className='d-flex justify-content-end flex-shrink-0'>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/General/Settings-1.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/Communication/Write.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                    >
                      <KTSVG path='/media/icons/duotone/General/Trash.svg' className='svg-icon-3' />
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className='form-check form-check-sm form-check-custom form-check-solid'>
                    <input className='form-check-input widget-9-check' type='checkbox' value='1' />
                  </div>
                </td>
                <td>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-45px me-5'>
                      <img src={toAbsoluteUrl('/media/avatars/150-4.jpg')} alt='' />
                    </div>
                    <div className='d-flex justify-content-start flex-column'>
                      <a href='#' className='text-dark fw-bolder text-hover-primary fs-6'>
                        Lebron Wayde
                      </a>
                      <span className='text-muted fw-bold text-muted d-block fs-7'>
                        PHP, Laravel, VueJS
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <a href='#' className='text-dark fw-bolder text-hover-primary d-block fs-6'>
                    RoadGee
                  </a>
                  <span className='text-muted fw-bold text-muted d-block fs-7'>Transportation</span>
                </td>
                <td className='text-end'>
                  <div className='d-flex flex-column w-100 me-2'>
                    <div className='d-flex flex-stack mb-2'>
                      <span className='text-muted me-2 fs-7 fw-bold'>60%</span>
                    </div>
                    <div className='progress h-6px w-100'>
                      <div
                        className='progress-bar bg-success'
                        role='progressbar'
                        style={{width: '60%'}}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className='d-flex justify-content-end flex-shrink-0'>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/General/Settings-1.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/Communication/Write.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                    >
                      <KTSVG path='/media/icons/duotone/General/Trash.svg' className='svg-icon-3' />
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className='form-check form-check-sm form-check-custom form-check-solid'>
                    <input className='form-check-input widget-9-check' type='checkbox' value='1' />
                  </div>
                </td>
                <td>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-45px me-5'>
                      <img src={toAbsoluteUrl('/media/avatars/150-5.jpg')} alt='' />
                    </div>
                    <div className='d-flex justify-content-start flex-column'>
                      <a href='#' className='text-dark fw-bolder text-hover-primary fs-6'>
                        Natali Goodwin
                      </a>
                      <span className='text-muted fw-bold text-muted d-block fs-7'>
                        Python, PostgreSQL, ReactJS
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <a href='#' className='text-dark fw-bolder text-hover-primary d-block fs-6'>
                    The Hill
                  </a>
                  <span className='text-muted fw-bold text-muted d-block fs-7'>Insurance</span>
                </td>
                <td className='text-end'>
                  <div className='d-flex flex-column w-100 me-2'>
                    <div className='d-flex flex-stack mb-2'>
                      <span className='text-muted me-2 fs-7 fw-bold'>50%</span>
                    </div>
                    <div className='progress h-6px w-100'>
                      <div
                        className='progress-bar bg-warning'
                        role='progressbar'
                        style={{width: '50%'}}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className='d-flex justify-content-end flex-shrink-0'>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/General/Settings-1.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/Communication/Write.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                    >
                      <KTSVG path='/media/icons/duotone/General/Trash.svg' className='svg-icon-3' />
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className='form-check form-check-sm form-check-custom form-check-solid'>
                    <input className='form-check-input widget-9-check' type='checkbox' value='1' />
                  </div>
                </td>
                <td>
                  <div className='d-flex align-items-center'>
                    <div className='symbol symbol-45px me-5'>
                      <img src={toAbsoluteUrl('/media/avatars/150-6.jpg')} alt='' />
                    </div>
                    <div className='d-flex justify-content-start flex-column'>
                      <a href='#' className='text-dark fw-bolder text-hover-primary fs-6'>
                        Kevin Leonard
                      </a>
                      <span className='text-muted fw-bold text-muted d-block fs-7'>
                        HTML, JS, ReactJS
                      </span>
                    </div>
                  </div>
                </td>
                <td>
                  <a href='#' className='text-dark fw-bolder text-hover-primary d-block fs-6'>
                    RoadGee
                  </a>
                  <span className='text-muted fw-bold text-muted d-block fs-7'>Art Director</span>
                </td>
                <td className='text-end'>
                  <div className='d-flex flex-column w-100 me-2'>
                    <div className='d-flex flex-stack mb-2'>
                      <span className='text-muted me-2 fs-7 fw-bold'>90%</span>
                    </div>
                    <div className='progress h-6px w-100'>
                      <div
                        className='progress-bar bg-info'
                        role='progressbar'
                        style={{width: '90%'}}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className='d-flex justify-content-end flex-shrink-0'>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/General/Settings-1.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1'
                    >
                      <KTSVG
                        path='/media/icons/duotone/Communication/Write.svg'
                        className='svg-icon-3'
                      />
                    </a>
                    <a
                      href='#'
                      className='btn btn-icon btn-bg-light btn-active-color-primary btn-sm'
                    >
                      <KTSVG path='/media/icons/duotone/General/Trash.svg' className='svg-icon-3' />
                    </a>
                  </div>
                </td>
              </tr>*/}
            </tbody>
            {/* end::Table body */}
          </table>
          {/* end::Table */}
        </div>
        {/* end::Table container */}
      </div>
      {/* begin::Body */}
    </div>
  )
}

export {UsersTablesWidget}
