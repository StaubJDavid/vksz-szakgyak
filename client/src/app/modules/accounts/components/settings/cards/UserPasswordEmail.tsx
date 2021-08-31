/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState} from 'react'
import {KTSVG} from '../../../../../../_metronic/helpers'
import * as Yup from 'yup'
import {useSelector} from 'react-redux'
import {useFormik} from 'formik'
import {IUpdatePasswordAdmin, IUpdateEmailAdmin, updatePasswordAdmin, updateEmailAdmin} from '../SettingsModel'
import {adminChangePassword, adminChangeEmail} from '../../../../auth/redux/AuthCRUD'
import * as auth from '../../../../auth/redux/AuthRedux'

const emailFormValidationSchema = Yup.object().shape({
  newEmail: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Email is required'),
})

const passwordFormValidationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Minimum 8 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#$%&()"'[\]*+,-./{}~])(?=.{8,})/, 'Should be atleas 8 long, contains 1 lowercase,uppercase,number,special character'),
  passwordConfirmation: Yup.string()
    .min(8, 'Minimum 8 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#$%&()"'[\]*+,-./{}~])(?=.{8,})/, 'Should be atleas 8 long, contains 1 lowercase,uppercase,number,special character')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
})

type Props = {
  id:number
  email:string
}

const UserPasswordEmail: React.FC<Props> = ({id, email}) => {

  const [emailUpdateData, setEmailUpdateData] = useState<IUpdateEmailAdmin>(updateEmailAdmin)
  const [passwordUpdateData, setPasswordUpdateData] = useState<IUpdatePasswordAdmin>(updatePasswordAdmin)

  const [showEmailForm, setShowEmailForm] = useState<boolean>(false)
  const [showPasswordForm, setPasswordForm] = useState<boolean>(false)

  const [loading1, setLoading1] = useState(false)

  const formik1 = useFormik<IUpdateEmailAdmin>({
    initialValues: {
      ...emailUpdateData,
    },
    validationSchema: emailFormValidationSchema,
    onSubmit: (values1, {setStatus}) => {
      setLoading1(true)
      setTimeout((values) => {
        adminChangeEmail(values1.newEmail, id).then(({data: {result}}) => {
          setLoading1(false)
          if(result){           
            setStatus();
            window.location.reload();
          }
          setShowEmailForm(false)
        })
        .catch((error) => {
          setLoading1(false)
          setStatus(error.response.data)     
        })
        setEmailUpdateData(values)
      }, 1000)
    },
  })

  const [loading2, setLoading2] = useState(false)

  const formik2 = useFormik<IUpdatePasswordAdmin>({
    initialValues: {
      ...passwordUpdateData,
    },
    validationSchema: passwordFormValidationSchema,
    onSubmit: (values2, {setStatus}) => {     
      setLoading2(true)
      setTimeout((values) => {
        adminChangePassword(values2.newPassword, values2.passwordConfirmation, id).then(({data: {result}}) => {
          setLoading2(false)
          if(result){
            setStatus();
          }
          setPasswordForm(false)
        })
        .catch((error) => {
          setLoading2(false)
          setStatus(error.response.data)     
        })
        setPasswordUpdateData(values)     
      }, 1000)
    },
  })

  return (
    <div className='card mb-5 mb-xl-10'>
      <div
        className='card-header border-0 cursor-pointer'
        role='button'
        data-bs-toggle='collapse'
        data-bs-target='#kt_account_signin_method'
      >
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>Sign-in Method</h3>
        </div>
      </div>

      <div id='kt_account_signin_method' className='collapse show'>
        <div className='card-body border-top p-9'>
          <div className='d-flex flex-wrap align-items-center'>
            <div id='kt_signin_email' className={' ' + (showEmailForm && 'd-none')}>
              <div className='fs-6 fw-bolder mb-1'>Email Address</div>
              <div className='fw-bold text-gray-600'></div>
            </div>

            <div
              id='kt_signin_email_edit'
              className={'flex-row-fluid ' + (!showEmailForm && 'd-none')}
            >
              <form
                onSubmit={formik1.handleSubmit}
                id='kt_signin_change_email'
                className='form'
                noValidate
              >
                <div className='row mb-6'>
                  <div className='col-lg-6 mb-4 mb-lg-0'>
                    <div className='fv-row mb-0'>
                      <label htmlFor='emailaddress' className='form-label fs-6 fw-bolder mb-3'>
                        Enter New Email Address
                      </label>
                      <input
                        type='email'
                        className='form-control form-control-lg form-control-solid'
                        id='emailaddress'
                        placeholder='Email Address'
                        {...formik1.getFieldProps('newEmail')}
                      />
                      {formik1.touched.newEmail && formik1.errors.newEmail && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>{formik1.errors.newEmail}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='col-lg-6'>  
                  </div>
                </div>

                {formik1.status ? (
                  <div className='mb-lg-15 alert alert-danger'>
                  <div className='alert-text text-center font-weight-bold'>{formik1.status}</div>
                </div>
                ) : (
                  <></>
                )}

                <div className='d-flex'>
                  <button
                    id='kt_signin_submit'
                    type='submit'
                    className='btn btn-primary  me-2 px-6'
                  >
                    {!loading1 && 'Update Email'}
                    {loading1 && (
                      <span className='indicator-progress' style={{display: 'block'}}>
                        Please wait...{' '}
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    )}
                  </button>
                  <button
                    id='kt_signin_cancel'
                    type='button'
                    onClick={() => {
                      setShowEmailForm(false)
                    }}
                    className='btn btn-color-gray-400 btn-active-light-primary px-6'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div id='kt_signin_email_button' className={'ms-auto ' + (showEmailForm && 'd-none')}>
              <button
                onClick={() => {
                  setShowEmailForm(true)
                }}
                className='btn btn-light btn-active-light-primary'
              >
                Change Email
              </button>
            </div>
          </div>

          <div className='separator separator-dashed my-6'></div>

          <div className='d-flex flex-wrap align-items-center mb-10'>
            <div id='kt_signin_password' className={' ' + (showPasswordForm && 'd-none')}>
              <div className='fs-6 fw-bolder mb-1'>Password</div>
              <div className='fw-bold text-gray-600'>************</div>
            </div>

            <div
              id='kt_signin_password_edit'
              className={'flex-row-fluid ' + (!showPasswordForm && 'd-none')}
            >
              <form
                onSubmit={formik2.handleSubmit}
                id='kt_signin_change_password'
                className='form'
                noValidate
              >
                <div className='row mb-1'>
                  <div className='col-lg-4'>
                    <div className='fv-row mb-0'>
                      <label htmlFor='newpassword' className='form-label fs-6 fw-bolder mb-3'>
                        New Password
                      </label>
                      <input
                        type='password'
                        className='form-control form-control-lg form-control-solid '
                        id='newpassword'
                        {...formik2.getFieldProps('newPassword')}
                      />
                      {formik2.touched.newPassword && formik2.errors.newPassword && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>{formik2.errors.newPassword}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='col-lg-4'>
                    <div className='fv-row mb-0'>
                      <label htmlFor='confirmpassword' className='form-label fs-6 fw-bolder mb-3'>
                        Confirm New Password
                      </label>
                      <input
                        type='password'
                        className='form-control form-control-lg form-control-solid '
                        id='confirmpassword'
                        {...formik2.getFieldProps('passwordConfirmation')}
                      />
                      {formik2.touched.passwordConfirmation && formik2.errors.passwordConfirmation && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>{formik2.errors.passwordConfirmation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='form-text mb-5'>
                  Password must be at least 8 character and contain symbols
                </div>

                {formik2.status ? (
                  <div className='mb-lg-15 alert alert-danger'>
                  <div className='alert-text text-center font-weight-bold'>{formik2.status}</div>
                </div>
                ) : (
                  <></>
                )}

                <div className='d-flex'>
                  <button
                    id='kt_password_submit'
                    type='submit'
                    className='btn btn-primary me-2 px-6'
                  >
                    {!loading2 && 'Update Password'}
                    {loading2 && (
                      <span className='indicator-progress' style={{display: 'block'}}>
                        Please wait...{' '}
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setPasswordForm(false)
                    }}
                    id='kt_password_cancel'
                    type='button'
                    className='btn btn-color-gray-400 btn-active-light-primary px-6'
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div
              id='kt_signin_password_button'
              className={'ms-auto ' + (showPasswordForm && 'd-none')}
            >
              <button
                onClick={() => {
                  setPasswordForm(true)
                }}
                className='btn btn-light btn-active-light-primary'
              >
                Reset Password
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export {UserPasswordEmail}
