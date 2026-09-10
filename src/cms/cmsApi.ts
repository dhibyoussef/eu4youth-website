import axios from 'axios'

const TOKEN_KEY = 'eu4y_edit_token'

export const cmsApi = axios.create({
  baseURL: '/api',
})

export function setEditToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token)
    cmsApi.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    sessionStorage.removeItem(TOKEN_KEY)
    delete cmsApi.defaults.headers.common.Authorization
  }
}

export function readEditToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

const saved = readEditToken()
if (saved) setEditToken(saved)
