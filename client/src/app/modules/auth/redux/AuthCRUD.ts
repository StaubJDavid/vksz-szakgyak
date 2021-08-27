import axios from 'axios'
import {AuthModel} from '../models/AuthModel'
import { UserCommunicationModel } from '../models/UserCommunicationModel'
import {UserModel} from '../models/UserModel'
import {NewsNotifsModel} from '../models/NewsNotifsModel'

const API_URL = process.env.REACT_APP_API_URL || 'localhost:3001'

//AUTHENTICATION
export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/api/auth/get-user`
export const LOGIN_URL = `${API_URL}/api/auth/login`
export const REGISTER_URL = `${API_URL}/api/auth/register`
export const SEND_CONFIRM_EMAIL = `${API_URL}/api/auth/confirmation`

//USER STUFF
export const REQUEST_PASSWORD_URL = `${API_URL}/api/user/forgot-password`
export const CHANGE_NOTIFICATIONS_URL = `${API_URL}/api/user/change/notifications`
export const CHANGE_USER_DETAILS = `${API_URL}/api/user/change/details`
export const CHANGE_AVATAR = `${API_URL}/api/user/change/avatar`
export const CHANGE_PASSWORD = `${API_URL}/api/user/change/password`
export const CHANGE_EMAIL = `${API_URL}/api/user/change/email`

//ADMIN STUFF
export const GET_USER_BY_ID = `${API_URL}/api/admin/get-user-by-id`
export const GET_USERS_URL = `${API_URL}/api/admin/get-users`
export const USER_BLOCK_UNBLOCK = `${API_URL}/api/admin/block-user`
export const ADMIN_CHANGE_PASSWORD = `${API_URL}/api/admin/change/password`
export const ADMIN_CHANGE_EMAIL = `${API_URL}/api/admin/change/email`
export const GET_NEWS_NOTIFS = `${API_URL}/api/admin/get-news-notifs`

// Server should return AuthModel
export function login(email: string, password: string) {
  return axios.post(LOGIN_URL, {email, password})
}

// Server should return AuthModel
export function register(
  email: string, 
  firstname: string, 
  lastname: string, 
  password: string,
  zip: string,
  city: string,
  street: string,
  house_number: string,
  phone: string
  ) {
  return axios.post<{result:boolean}>(REGISTER_URL, {
    email,
    firstname,
    lastname,
    password,
    zip,
    city,
    street,
    house_number,
    phone
  })
}

export function sendConfirmEmail(email: string) {
  return axios.post<{result:boolean}>(SEND_CONFIRM_EMAIL, {email})
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{result: boolean}>(REQUEST_PASSWORD_URL, {email})
}

export function changeDetails(
    user_id:number,
    email: string, 
    firstname: string, 
    lastname: string, 
    zip: string | undefined,
    city: string | undefined,
    street: string | undefined,
    house_number: string | undefined,
    phone: string | undefined,
  ) {
  return axios.post<{result: boolean}>(CHANGE_USER_DETAILS, {
    user_id,
    email,
    firstname,
    lastname,
    zip,
    city,
    street,
    house_number,
    phone
  })
}

export function updateNotifications(notifications: UserCommunicationModel[], user_id:number) {
  return axios.put<{result: boolean}>(CHANGE_NOTIFICATIONS_URL, {notifications, user_id})
}

export function getUsers() {
  return axios.get<{users: UserModel[]}>(GET_USERS_URL)
}

export function userBlockUnblock(user_id:number, email:string) {
  return axios.post<{result: boolean}>(USER_BLOCK_UNBLOCK, {user_id, email})
}

export function getUserById(user_id:number) {
  return axios.post<{user: UserModel}>(GET_USER_BY_ID, {user_id})
}

export function getNewsNotifs() {
  return axios.get<{news_notifs: NewsNotifsModel}>(GET_NEWS_NOTIFS)
}

export function uploadAvatar(avatar:string, user_id:number) {
  return axios.post<{result: boolean}>(CHANGE_AVATAR, {avatar, user_id})
}

export function changePassword(current_pass:string,new_pass:string, new_pass2:string, user_id:number) {
  return axios.post<{result: boolean}>(CHANGE_PASSWORD, {current_pass, new_pass, new_pass2, user_id})
}

export function changeEmail(email:string, current_pass:string, user_id:number) {
  return axios.post<{result: boolean}>(CHANGE_EMAIL, {email, current_pass, user_id})
}

export function adminChangeEmail(email:string, user_id:number) {
  return axios.post<{result: boolean}>(ADMIN_CHANGE_EMAIL, {email, user_id})
}

export function adminChangePassword(new_pass:string, new_pass2:string, user_id:number) {
  return axios.post<{result: boolean}>(ADMIN_CHANGE_PASSWORD, {new_pass, new_pass2, user_id})
}

export function getUserByToken() {
  // Authorization head should be fulfilled in interceptor.
  // Check common redux folder => setupAxios
  return axios.get<UserModel>(GET_USER_BY_ACCESSTOKEN_URL)
}
