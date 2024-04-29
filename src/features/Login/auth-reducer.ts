import { Dispatch } from 'redux'
import {
  SetAppIsInitializedType,
  SetErrorType,
  SetStatusType,
  setAppInitializedAC,
  setStatusAC,
} from '../../app/app-reducer'
import { LoginDataType } from './Login'
import { authAPI } from '../../api/auth-api'
import { handleServerAppError } from '../../utills/handle-server-app-error'
import { handleServerNetworkError } from '../../utills/handle-server-network-error'

const initialState = {
  isLoggedIn: false,
}
type InitialStateType = typeof initialState

export const authReducer = (
  state: InitialStateType = initialState,
  action: ActionsType
): InitialStateType => {
  switch (action.type) {
    case 'login/SET-IS-LOGGED-IN':
      return { ...state, isLoggedIn: action.value }
    default:
      return state
  }
}
export const setIsLoggedInAC = (value: boolean) =>
  ({ type: 'login/SET-IS-LOGGED-IN', value } as const)

export const loginTC = (data: LoginDataType) => async (dispatch: Dispatch<ActionsType>) => {
  dispatch(setStatusAC('loading'))
  try {
    const res = await authAPI.login(data)
    if (res.data.resultCode === 0) {
      dispatch(setIsLoggedInAC(true))
      dispatch(setStatusAC('succeeded'))
    } else {
      handleServerAppError(res.data, dispatch)
    }
  } catch (e) {
    //@ts-ignore
    handleServerNetworkError(e, dispatch)
  }
}

export const logoutTC = () => async (dispatch: Dispatch<ActionsType>) => {
  dispatch(setStatusAC('loading'))
  try {
    const res = await authAPI.logout()
    if (res.data.resultCode === 0) {
      dispatch(setIsLoggedInAC(false))
      dispatch(setStatusAC('succeeded'))
    } else {
      handleServerAppError(res.data, dispatch)
    }
  } catch (e) {}
}

export const meTC = () => async (dispatch: Dispatch<ActionsType>) => {
  dispatch(setStatusAC('loading'))
  try {
    const res = await authAPI.me()
    if (res.data.resultCode === 0) {
      dispatch(setIsLoggedInAC(true))
      dispatch(setStatusAC('succeeded'))
    } else {
      handleServerAppError(res.data, dispatch)
    }
  } catch (e) {
    //@ts-ignore
    handleServerNetworkError(e, dispatch)
  } finally {
    dispatch(setAppInitializedAC(true))
  }
}

type ActionsType =
  | ReturnType<typeof setIsLoggedInAC>
  | SetStatusType
  | SetErrorType
  | SetAppIsInitializedType
