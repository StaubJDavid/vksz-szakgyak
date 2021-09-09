import {AuthModel} from './AuthModel'
import {UserAddressModel} from './UserAddressModel'
import {UserCommunicationModel} from './UserCommunicationModel'
import {UserEmailSettingsModel} from './UserEmailSettingsModel'
import {UserSocialNetworksModel} from './UserSocialNetworksModel'

export interface UserModel {
  id: number
  username?: string
  password?: string | undefined
  email: string
  firstname: string
  lastname: string
  fullname?: string
  occupation?: string
  companyName?: string
  phone: string
  provider?: string
  roles?: Array<string>
  pic?: string
  language?: 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh' | 'ru'
  timeZone?: string
  website?: 'https://keenthemes.com'
  emailSettings?: UserEmailSettingsModel
  auth?: AuthModel
  communication: Array<UserCommunicationModel>
  address?: UserAddressModel
  zip: string
  city: string
  street: string
  house_number: string
  socialNetworks?: UserSocialNetworksModel
  blacklisted?: number
}

