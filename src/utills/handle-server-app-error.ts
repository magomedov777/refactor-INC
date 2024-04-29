import { Dispatch } from 'redux'
import { SetErrorType, SetStatusType, setErrorAC, setStatusAC } from '../app/app-reducer'
import { ResponseType } from '../types'

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
