/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {FC, useState, useEffect, useRef} from 'react'
import {UserModel} from '../../auth/models/UserModel'
import {NewsNotifsModel} from '../../auth/models/NewsNotifsModel'
import {getNewsNotifs} from '../../auth/redux/AuthCRUD'
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

const SendUsersNotification: FC = () => {
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
    <div className='card'>
    <table className='table table-row-dashed table-row-gray-300 align-middle gs-7 gy-4'>
      <tbody>
        <tr>
          <td>
            <div>
              <div>
                <label>Service type</label>
                <select className="form-select form-select-solid" data-control="select2" data-placeholder="Select an option">
                    {news_notifs?.news_services.map(ns => {
                      return <option value={ns.service_id}>{ns.service_name}</option>
                    })}
                </select>
              </div>
            </div>
          </td>
          <td>
            <div>
              <div>
                <label>Notification type</label>
                <select className="form-select form-select-solid" data-control="select2" data-placeholder="Select an option">
                    {news_notifs?.notif_types.map(nt => {
                      return <option value={nt.notif_id}>{nt.notif_name}</option>
                    })}
                </select>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colSpan={2}>
            <input type='text' name="title" className='form-control form-control-lg form-control-solid' placeholder='Message Subject/Title' />
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
      </tbody>
    </table>
    </div>
  )

  
}

export {SendUsersNotification}