import { Dispatch } from 'redux'
import { AppActionsType, setErrorAC, setStatusAC } from '../app/app-reducer'

export const handleServerNetworkError = (dispatch: Dispatch<AppActionsType>, error: string) => {
  dispatch(setErrorAC(error))
  dispatch(setStatusAC('failed'))
}
