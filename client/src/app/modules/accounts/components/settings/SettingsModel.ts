export interface IProfileDetails {
  avatar?: string
  fName?: string
  lName?: string
  company?: string
  email?: string
  contactPhone?: string
  companySite?: string
  country?: string
  language?: string
  timeZone?: string
  currency?: string
  communications?: {
    email?: boolean
    phone?: boolean
  }
  allowMarketing?: boolean
}

export interface IUpdateEmail {
  newEmail: string
  confirmPassword: string
}

export interface IUpdatePassword {
  currentPassword: string
  newPassword: string
  passwordConfirmation: string
}

export interface IConnectedAccounts {
  google: boolean
  github: boolean
  stack: boolean
}

export interface IEmailPreferences {
  successfulPayments: boolean
  payouts: boolean
  freeCollections: boolean
  customerPaymentDispute: boolean
  refundAlert: boolean
  invoicePayments: boolean
  webhookAPIEndpoints: boolean
}

export interface INotifications {
  Hulladékszállítás: {
    email: boolean
    sms: boolean
    phone: boolean
  }
  Lomtalanítás: {
    email: boolean
    sms: boolean
    phone: boolean
  }
  Hírek: {
    email: boolean
    sms: boolean
    phone: boolean
  }
  Valami: {
    email: boolean
    sms: boolean
    phone: boolean
  }
  PluszCucc: {
    email: boolean
    sms: boolean
    phone: boolean
  }
}

export interface IDeactivateAccount {
  confirm: boolean
}

export const profileDetailsInitValues: IProfileDetails = {
  avatar: '/media/avatars/150-2.jpg',
  fName: '',
  lName: '',
  email: '',
  company: '',
  contactPhone: '',
  companySite: '',
  country: '',
  language: '',
  timeZone: '',
  currency: '',
  communications: {
    email: false,
    phone: false,
  },
  allowMarketing: false,
}

export const updateEmail: IUpdateEmail = {
  newEmail: 'support@keenthemes.com',
  confirmPassword: '',
}

export const updatePassword: IUpdatePassword = {
  currentPassword: '',
  newPassword: '',
  passwordConfirmation: '',
}

export const connectedAccounts: IConnectedAccounts = {
  google: true,
  github: true,
  stack: false,
}

export const emailPreferences: IEmailPreferences = {
  successfulPayments: false,
  payouts: true,
  freeCollections: false,
  customerPaymentDispute: true,
  refundAlert: false,
  invoicePayments: true,
  webhookAPIEndpoints: false,
}

export const notifications: INotifications = {
  Hulladékszállítás: {
    email: true,
    sms: false,
    phone: true,
  },
  Lomtalanítás: {
    email: true,
    sms: false,
    phone: true,
  },
  Hírek: {
    email: true,
    sms: false,
    phone: false,
  },
  Valami: {
    email: false,
    sms: false,
    phone: true,
  },
  PluszCucc: {
    email: false,
    sms: false,
    phone: false,
  },
}

export const deactivateAccount: IDeactivateAccount = {
  confirm: false,
}
