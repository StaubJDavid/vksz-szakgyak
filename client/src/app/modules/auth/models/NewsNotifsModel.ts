import {NewsServiceModel} from './NewsServiceModel'
import {NotifTypeModel} from './NotifTypeModel'

export interface NewsNotifsModel {
  notif_types: NotifTypeModel[]
  news_services: NewsServiceModel[]
}

