import React, {useState, useEffect} from 'react'
//import {INotifications, notifications} from '../SettingsModel'
import {useSelector} from 'react-redux'
import * as auth from '../../../../auth/redux/AuthRedux'
import {updateNotifications, getUserById} from '../../../../auth/redux/AuthCRUD'
import { UserCommunicationModel} from '../../../../auth/models/UserCommunicationModel'
import { UserModel} from '../../../../auth/models/UserModel'

type Props = {
  user: UserModel
}

const UserNotifications: React.FC<Props> = ({user}) => {
  // const stuff = JSON.stringify(useSelector(auth.actions.fulfillUser));
  // const stuff2 = JSON.parse(stuff);
  // const [user, setUser] = useState<UserModel>();

  // useEffect(() => {
  //   const User = async () => {
  //     try {
  //       const response = await getUserById(id);
  //       console.log(response.data.user);
  //       setUser(response.data.user);
  //       // setInitialValues(response.data.user);
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  //   User()
  // }, []);

  const [data, setData] = useState<UserCommunicationModel[]>(user.communication);

  const updateData = (fieldsToUpdate: UserCommunicationModel) => {
    let index = user.communication.findIndex((element:UserCommunicationModel) => element.service_id === fieldsToUpdate.service_id)
    
    setData([ ...data.slice(0,index),
              Object.assign({}, data[index], fieldsToUpdate),
              ...data.slice(index+1)
            ]);
    // console.log('New data: ' + JSON.stringify(data))
  }

  const [loading, setLoading] = useState(false);
  const [notifError, setNotifError] = useState('');

  const click = () => {
    setLoading(true)
    setTimeout(() => {
      updateNotifications(data, user.id).then(({data: {result}}) => {
        setLoading(false);
        setNotifError('');
        //console.log('Visszakaptam: ' + result);
      }).catch((error) => {
        setLoading(false);
        setNotifError(error.response.data);
      })
      
    }, 1000)
  }

  

  return (
    <>
    {notifError !== '' && (
        <div className='mb-lg-15 alert alert-danger'>
          <div className='alert-text font-weight-bold'>{notifError}</div>
        </div>
      )}

    <div className='card mb-5 mb-xl-10'>
      <div
        className='card-header border-0 cursor-pointer'
        role='button'
        data-bs-toggle='collapse'
        data-bs-target='#kt_account_notifications'
        aria-expanded='true'
        aria-controls='kt_account_notifications'
      >
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>Notifications</h3>
        </div>
      </div>


      <div id='kt_account_notifications' className='collapse show'>
        <form className='form'>
          <div className='card-body border-top px-9 pt-3 pb-4'>
            <div className='table-responsive'>
              <table className='table table-row-dashed border-gray-300 align-middle gy-6'>
                <tbody className='fs-6 fw-bold'>

                  {/* begin::First Row begin */}
                  {data.map((c:UserCommunicationModel) => (
                    <tr key={c.service_id}>
                    <td className='min-w-250px fs-4 fw-bolder'>{c.name}</td>
                    {/* begin::Email box start */}
                    <td className='w-125px'>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id={'kt_settings_' + c.name + '_email'}
                          defaultChecked={c.email}
                          onChange={() =>
                            updateData({
                                name: c.name,
                                phone: c.phone,
                                sms: c.sms,
                                email: !c.email,
                                service_id: c.service_id
                            })
                          }
                        />
                        <label
                          className='form-check-label ps-2'
                          htmlFor={'kt_settings_' + c.name + '_email'}
                        >
                          Email
                        </label>
                      </div>
                    </td>
                    {/* begin::Email box end */}

                    {/* begin::SMS box begin */}
                    <td className='w-125px'>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id={'kt_settings_' + c.name + '_sms'}
                          defaultChecked={c.sms}
                          onChange={() =>
                            updateData({
                              name: c.name,
                              phone: c.phone,
                              sms: !c.sms,
                              email: c.email,
                              service_id: c.service_id
                          })
                          }
                        />
                        <label
                          className='form-check-label ps-2'
                          htmlFor={'kt_settings_' + c.name + '_sms'}
                        >
                          SMS
                        </label>
                      </div>
                    </td>
                    {/* begin::SMS box end */}

                    {/* begin::Phone box begin */}
                    <td className='w-125px'>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id={'kt_settings_' + c.name + '_phone'}
                          defaultChecked={c.phone}
                          onChange={() =>
                            updateData({
                              name: c.name,
                              phone: !c.phone,
                              sms: c.sms,
                              email: c.email,
                              service_id: c.service_id
                          })
                          }
                        />
                        <label
                          className='form-check-label ps-2'
                          htmlFor={'kt_settings_' + c.name + '_phone'}
                        >
                          Phone
                        </label>
                      </div>
                    </td>
                    {/* begin::Phone box end */}
                  </tr>                 
                  ))}
                  {/* begin::First Row end */}

                  {/*<tr>
                    <td>Billing Updates</td>
                    <td>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value='1'
                          id='billing1'
                          defaultChecked={data.billingUpdates.email}
                          onChange={() =>
                            updateData({
                              billingUpdates: {
                                phone: data.billingUpdates.phone,
                                email: !data.billingUpdates.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='billing1'></label>
                      </div>
                    </td>
                    <td>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id='billing2'
                          defaultChecked={data.billingUpdates.phone}
                          onChange={() =>
                            updateData({
                              billingUpdates: {
                                phone: !data.billingUpdates.phone,
                                email: data.billingUpdates.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='billing2'></label>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>New Team Members</td>
                    <td>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id='team1'
                          defaultChecked={data.newTeamMembers.email}
                          onChange={() =>
                            updateData({
                              newTeamMembers: {
                                phone: data.newTeamMembers.phone,
                                email: !data.newTeamMembers.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='team1'></label>
                      </div>
                    </td>
                    <td>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id='team2'
                          defaultChecked={data.newTeamMembers.phone}
                          onChange={() =>
                            updateData({
                              newTeamMembers: {
                                phone: !data.newTeamMembers.phone,
                                email: data.newTeamMembers.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='team2'></label>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>Completed Projects</td>
                    <td>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id='project1'
                          defaultChecked={data.completeProjects.email}
                          onChange={() =>
                            updateData({
                              completeProjects: {
                                phone: data.completeProjects.phone,
                                email: !data.completeProjects.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='project1'></label>
                      </div>
                    </td>
                    <td>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id='project2'
                          defaultChecked={data.completeProjects.phone}
                          onChange={() =>
                            updateData({
                              completeProjects: {
                                phone: !data.completeProjects.phone,
                                email: data.completeProjects.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='project2'></label>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className='border-bottom-0'>Newsletters</td>
                    <td className='border-bottom-0'>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id='newsletter1'
                          defaultChecked={data.newsletters.email}
                          onChange={() =>
                            updateData({
                              newsletters: {
                                phone: data.newsletters.phone,
                                email: !data.newsletters.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='newsletter1'></label>
                      </div>
                    </td>
                    <td className='border-bottom-0'>
                      <div className='form-check form-check-solid'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          value=''
                          id='newsletter2'
                          defaultChecked={data.newsletters.phone}
                          onChange={() =>
                            updateData({
                              newsletters: {
                                phone: !data.newsletters.phone,
                                email: data.newsletters.email,
                              },
                            })
                          }
                        />
                        <label className='form-check-label ps-2' htmlFor='newsletter2'></label>
                      </div>
                    </td>
                  </tr>
                    */}</tbody>
              </table>
            </div>
          </div>

          <div className='card-footer d-flex justify-content-end py-6 px-9'>
            <button className='btn btn-white btn-active-light-primary me-2'>Discard</button>
            <button type='button' onClick={click} className='btn btn-primary'>
              {!loading && 'Save Changes'}
              {loading && (
                <span className='indicator-progress' style={{display: 'block'}}>
                  Please wait...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}

export {UserNotifications}
