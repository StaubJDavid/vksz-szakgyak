import axios from 'axios'
import {AuthModel} from '../models/AuthModel'
import { UserCommunicationModel } from '../models/UserCommunicationModel'
import {UserModel} from '../models/UserModel'

const API_URL = process.env.REACT_APP_API_URL || 'localhost:3001'

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/auth/get-user`
export const LOGIN_URL = `${API_URL}/auth/login`
export const REGISTER_URL = `${API_URL}/auth/register`
export const REQUEST_PASSWORD_URL = `${API_URL}/auth/forgot-password`
export const UPDATE_NOTIFICATIONS_URL = `${API_URL}/auth/update-notifications`
export const GET_USERS_URL = `${API_URL}/auth/admin/get-users`
export const USER_BLOCK_UNBLOCK = `${API_URL}/auth/admin/block-user`
export const CHANGE_USER_DETAILS = `${API_URL}/auth/change-details`
export const GET_USER_BY_EMAIL = `${API_URL}/auth/admin/get-user-by-email`
export const UPDATE_AVATAR = `${API_URL}/auth/upload/avatar`

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
  return axios.post<AuthModel>(REGISTER_URL, {
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

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{result: boolean}>(REQUEST_PASSWORD_URL, {email})
}

export function changeDetails(
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

export function updateNotifications(notifications: UserCommunicationModel[]) {
  return axios.put<{result: boolean}>(UPDATE_NOTIFICATIONS_URL, {notifications})
}

export function getUsers() {
  return axios.get<{users: UserModel[]}>(GET_USERS_URL)
}

export function userBlockUnblock(email:string) {
  return axios.post<{result: boolean}>(USER_BLOCK_UNBLOCK, {email})
}

export function getUserByEmail(email:string) {
  return axios.post<{user: UserModel}>(GET_USER_BY_EMAIL, {email})
}

export function uploadAvatar(avatar:string) {
  return axios.post<{result: boolean}>(UPDATE_AVATAR, {avatar})
}

export function getUserByToken() {
  // Authorization head should be fulfilled in interceptor.
  // Check common redux folder => setupAxios
  return axios.get<UserModel>(GET_USER_BY_ACCESSTOKEN_URL)
}
