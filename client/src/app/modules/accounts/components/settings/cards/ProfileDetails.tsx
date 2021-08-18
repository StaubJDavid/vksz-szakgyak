import React, {useState} from 'react'
import {PFP} from '../../../../../../_metronic/helpers'
import {useSelector} from 'react-redux'
import * as Yup from 'yup'
import {useFormik} from 'formik'
import { UserModel } from '../../../../auth/models/UserModel'
import {changeDetails, uploadAvatar} from '../../../../auth/redux/AuthCRUD'
import * as auth from '../../../../auth/redux/AuthRedux'

const initialValues = {
  email:'',
  firstname: '',
  lastname: '',
  zip: '',
  city: '',
  street: '',
  house_number: '',
  phone: '',
}

const profileDetailsSchema = Yup.object().shape({
  email:Yup.string(),
  firstname: Yup.string(),
  lastname: Yup.string(),
  zip: Yup.string(),
  city: Yup.string(),
  street: Yup.string(),
  house_number: Yup.string(),
  phone: Yup.string(),
})

const ProfileDetails: React.FC = () => {
  const stuff = JSON.stringify(useSelector(auth.actions.fulfillUser));
  const stuff2 = JSON.parse(stuff);
  const user = stuff2.payload.user.auth.user;
  console.log(user);
  const [data, setData] = useState<UserModel>(user)
  const updateData = (fieldsToUpdate: Partial<UserModel>): void => {
    const updatedData = Object.assign(data, fieldsToUpdate)
    setData(updatedData)
  }
  
  const [profileError, setProfileError] = useState('');

  const [loading, setLoading] = useState(false)
  const formik = useFormik<UserModel>({
    initialValues,
    validationSchema: profileDetailsSchema,
    onSubmit: (values) => {
      setLoading(true)
      setTimeout(() => {
        console.log(values);
        changeDetails(values.email, values.firstname, values.lastname, values.zip, values.city, values.street, values.house_number, values.phone)
        .then(({data: {result}}) => {
          //console.log('Visszakaptam: ' + result);         
          setLoading(false);         
          setProfileError('');      
          if(result === true){
            window.location.reload();
          }   
        }).catch((error) => {
          setLoading(false);
          setProfileError(error.response.data);
        })
        const updatedData = Object.assign(data, values)
        setData(updatedData)
      }, 1000)     
    },
  })

  function getBase64(file:File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function updateAvatar(avatar:File){
    console.log('Avatar');
    getBase64(avatar).then(
      data => {
        let base64 = JSON.stringify(data);
        uploadAvatar(base64)
        .then(({data: {result}}) => {
          console.log('Visszakaptam: ' + result);            
          if(result){
            window.location.reload();
          }   
        }).catch((error) => {
          console.log('Error: ' + error);
        })
      }
    );
  }

  return (
    <div className='card mb-5 mb-xl-10'>
      <div
        className='card-header border-0 cursor-pointer'
        role='button'
        data-bs-toggle='collapse'
        data-bs-target='#kt_account_profile_details'
        aria-expanded='true'
        aria-controls='kt_account_profile_details'
      >
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>Profile Details</h3>
        </div>
      </div>

      <div id='kt_account_profile_details' className='collapse show'>
        <form onSubmit={formik.handleSubmit} noValidate className='form'>
          <div className='card-body border-top p-9'>
            
          <div className='row mb-6'>
              <label className='col-sm-2 col-form-label fw-bold fs-6'>Avatar</label>
              <div className='col-lg-8'>

                {/*begin::Image input*/}
                <div className="image-input image-input-empty" data-kt-image-input="true" style={{backgroundImage: `url(${PFP(user.pic === undefined?'':user.pic)})`}}>
                    {/*begin::Image preview wrapper*/}
                    <div className="image-input-wrapper w-125px h-125px"></div>
                    {/*end::Image preview wrapper*/}

                    {/*begin::Edit button*/}
                    <label className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow"
                        data-kt-image-input-action="change"
                        data-bs-toggle="tooltip"
                        data-bs-dismiss="click"
                        title="Change avatar">
                        <i className="bi bi-pencil-fill fs-7"></i>

                        {/*begin::Inputs*/}
                        <input type="file" name="avatar" onChange={ (e) => updateAvatar(e.target.files![0]) } accept=".png, .jpg, .jpeg" />
                        <input type="hidden" name="avatar_remove" />
                        {/*end::Inputs*/}
                    </label>
                    {/*end::Edit button*/}

                    {/*begin::Cancel button*/}
                    <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow"
                        data-kt-image-input-action="cancel"
                        data-bs-toggle="tooltip"
                        data-bs-dismiss="click"
                        title="Cancel avatar">
                        <i className="bi bi-x fs-2"></i>
                    </span>
                    {/*end::Cancel button*/}

                    {/*begin::Remove button*/}
                    <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow"
                        data-kt-image-input-action="remove"
                        data-bs-toggle="tooltip"
                        data-bs-dismiss="click"
                        title="Remove avatar">
                        <i className="bi bi-x fs-2"></i>
                    </span>
                    {/*end::Remove button*/}
                </div>
                {/*end::Image input*/}
              </div>
            </div>

            <div className='row mb-6'>
              <label className='col-sm-2 col-form-label  fw-bold fs-6'>Full Name</label>

              <div className='col-lg-8'>
                <div className='row'>
                  <div className='col-lg-6 fv-row'>
                    <input
                      type='text'
                      className='form-control form-control-lg form-control-solid mb-3 mb-lg-0'
                      placeholder='First name'
                      {...formik.getFieldProps('firstname')}
                    />
                    {formik.touched.firstname && formik.errors.firstname && (
                      <div className='fv-plugins-message-container'>
                        <div className='fv-help-block'>{formik.errors.firstname}</div>
                      </div>
                    )}
                  </div>

                  <div className='col-lg-6 fv-row'>
                    <input
                      type='text'
                      className='form-control form-control-lg form-control-solid'
                      placeholder='Last name'
                      {...formik.getFieldProps('lastname')}
                    />
                    {formik.touched.lastname && formik.errors.lastname && (
                      <div className='fv-plugins-message-container'>
                        <div className='fv-help-block'>{formik.errors.lastname}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='row mb-6'>
              <label className='col-sm-2 col-form-label fw-bold fs-6'>
                <span className=''>Phone</span>
              </label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='tel'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Phone number'
                  {...formik.getFieldProps('phone')}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.phone}</div>
                  </div>
                )}
              </div>
            </div>

            <div className='row mb-6'>
              <label className='col-sm-2 col-form-label fw-bold fs-6'>
                <span className=''>Zip Code</span>
              </label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Zip'
                  {...formik.getFieldProps('zip')}
                />
                {formik.touched.zip && formik.errors.zip && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.zip}</div>
                  </div>
                )}
              </div>
            </div>

            <div className='row mb-6'>
              <label className='col-sm-2 col-form-label fw-bold fs-6'>
                <span className=''>City</span>
              </label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='City'
                  {...formik.getFieldProps('city')}
                />
                {formik.touched.city && formik.errors.city && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.city}</div>
                  </div>
                )}
              </div>
            </div>


            <div className='row mb-6'>
              <label className='col-sm-2 col-form-label fw-bold fs-6'>
                <span className=''>Street</span>
              </label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Street'
                  {...formik.getFieldProps('street')}
                />
                {formik.touched.street && formik.errors.street && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.street}</div>
                  </div>
                )}
              </div>
            </div>

            <div className='row mb-6'>
              <label className='col-sm-2 col-form-label fw-bold fs-6'>
                <span className=''>House Number</span>
              </label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='House Number'
                  {...formik.getFieldProps('house_number')}
                />
                {formik.touched.house_number && formik.errors.house_number && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.house_number}</div>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className='card-footer d-flex justify-content-end py-6 px-9'>
            {profileError !== '' && (
              <div className='alert alert-danger justify-content-start'>
                <div className='alert-text font-weight-bold'>{profileError}</div>
              </div>
            )}

            <button type='submit' className='btn btn-primary' disabled={loading}>
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
  )
}

export {ProfileDetails}
