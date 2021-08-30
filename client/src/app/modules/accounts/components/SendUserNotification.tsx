/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {FC, useState, useEffect, useRef} from 'react'
import {UserModel} from '../../auth/models/UserModel'
import {NewsNotifsModel} from '../../auth/models/NewsNotifsModel'
import {getNewsNotifs, sendUserNotif} from '../../auth/redux/AuthCRUD'
import {Link} from 'react-router-dom'
import {PFP} from '../../../../_metronic/helpers'
import {ProfileDetails} from './settings/cards/ProfileDetails'
import {UserProfileDetails} from './settings/cards/UserProfileDetails'
import {UserNotifications} from './settings/cards/UserNotifications'
import * as auth from '../../auth/redux/AuthRedux'
import {useSelector} from 'react-redux'
import {LayoutSplashScreen} from '../../../../_metronic/layout/core'
import { UserPasswordEmail } from './settings/cards/UserPasswordEmail'
import { Editor } from '@tinymce/tinymce-react';


type Props = {
  user_id: number
}
//service_id:number, notif_id:number, title:string, message:string
const SendUserNotification: FC<Props> = ({user_id}) => {
  function sendNotification(){
    setNotifSuccess('');
    setNotifError('');
    setLoading(true);
    // console.log(serviceOption);
    // console.log(notifOption);
    // console.log(textInput.current.value);
    // console.log(editorRef.current.getContent());
    sendUserNotif(notifOption!, textInput.current.value, editorRef.current.getContent(), user_id)
          .then(({data: {result}}) => {
            if(result){
              setNotifSuccess('Notifications sent');
            }else{
              setNotifError('Notifications weren\'t sent');
            }
            setLoading(false);
          })
          .catch((error) => {
            setNotifError('Notifications weren\'t sent');
            setLoading(false);                    
          })
  }
  const [sendNotifError, setNotifError] = useState<string>('');
  const [sendNotifSuccess, setNotifSuccess] = useState<string>('');

  const [notifOption,setNotifOption] = useState<number>()
  function handleNotifChange(event:any){
    setNotifOption(event.target.value)
  }

  let textInput:any = React.createRef();

  const editorRef:any = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  // console.log(pathString.slice(6,pathString.length));
  const [isLoading, setLoading] = useState(true);
  // const [showSplashScreen, setShowSplashScreen] = useState(true)
  const [news_notifs, setData] = useState<NewsNotifsModel>();
  useEffect(() => {
      const NewsNotifs = async () => {
        try {
          const response = await getNewsNotifs();
          console.log(response.data.news_notifs);
          setData(response.data.news_notifs);
          setLoading(false)
          // console.log(news_notifs);
        } catch (error) {
          console.log(error)
        }
      }
  
      NewsNotifs()
    }, []);


  return isLoading ? <LayoutSplashScreen /> : (
    <div className='card mb-5 mb-xl-10'>
    <table className='table table-row-dashed table-row-gray-300 align-middle gs-7 gy-4'>
      <tbody>
        <tr>
          <td>
            <div>
              <div>
                <label>Notification type</label>
                <select name="notifOption" onChange={handleNotifChange} className="form-select form-select-solid" data-control="select2" data-placeholder="Select an option">
                    <option key='' value=''></option>
                    {news_notifs?.notif_types.map(nt => {
                      return <option key={nt.notif_name} value={nt.notif_id}>{nt.notif_name}</option>
                    })}
                </select>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <input ref={textInput} type='text' name="title" className='form-control form-control-lg form-control-solid' placeholder='Message Subject/Title' />
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
          <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            init={{
              height: 500,
              menubar: false,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
              ],
              toolbar: 'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <a onClick={sendNotification} className="btn btn-primary">Send out notifications</a>
          </td>
        </tr>
      </tbody>
    </table>
    {sendNotifError !== '' && (
              <div className='alert alert-danger justify-content-start'>
                <div className='alert-text font-weight-bold'>{sendNotifError}</div>
              </div>
      )}
      {sendNotifSuccess !== '' && (
              <div className='alert alert-primary justify-content-start'>
                <div className='alert-text font-weight-bold'>{sendNotifSuccess}</div>
              </div>
      )}
    </div>
  )

  
}

export {SendUserNotification}