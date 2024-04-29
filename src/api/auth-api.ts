import { instance } from '../common'
import { LoginDataType } from '../features/Login/Login'
import { LoginType, ResponseType } from '../types'

export class AuthAPI {
  public login(data: LoginDataType) {
    return instance.post<ResponseType<{ userId: number }>>('auth/login', data)
  }
  public logout() {
    return instance.delete<ResponseType>('auth/logout')
  }
  public me() {
    return instance.get<ResponseType<LoginType>>('auth/me')
  }
}

export const authAPI = new AuthAPI()
