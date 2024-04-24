import { Dispatch } from 'redux'
import {
  AppActionsType,
  SetErrorType,
  SetStatusType,
  setErrorAC,
  setStatusAC,
} from '../app/app-reducer'
import { ResponseType } from '../api/todolists-api'

export const handleServerNetworkError = (dispatch: Dispatch<AppActionsType>, error: string) => {
  dispatch(setErrorAC(error))
  dispatch(setStatusAC('failed'))
}

export const handleServerAppError = <D>(
  data: ResponseType<D>,
  dispatch: Dispatch<SetStatusType | SetErrorType>
) => {
  if (data.messages.length) {
    dispatch(setErrorAC(data.messages[0]))
  } else {
    dispatch(setErrorAC('SOME ERROR!'))
  }
  dispatch(setStatusAC('failed'))
}
