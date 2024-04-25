export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
export type InitialStateType = {
  status: RequestStatusType
  error: string | null
  isInitialized: boolean
}

const initialState: InitialStateType = {
  status: 'loading' as RequestStatusType,
  error: null as null | string,
  isInitialized: false,
}

// type InitialStateType = typeof initialState

export const appReducer = (
  state: InitialStateType = initialState,
  action: AppActionsType
): InitialStateType => {
  switch (action.type) {
    case 'APP/SET-STATUS':
      return { ...state, status: action.status }
    case 'APP/SET-ERROR':
      return { ...state, error: action.error }
    case 'APP/SET-APP-IS-INITIALIZED':
      return { ...state, isInitialized: action.isInitialized }
    default:
      return state
  }
}

export const setStatusAC = (status: RequestStatusType) =>
  ({ type: 'APP/SET-STATUS', status } as const)

export type SetStatusType = ReturnType<typeof setStatusAC>
export type SetErrorType = ReturnType<typeof setErrorAC>
export type SetAppIsInitializedType = ReturnType<typeof setAppInitializedAC>

export const setErrorAC = (error: null | string) => ({ type: 'APP/SET-ERROR', error } as const)

export const setAppInitializedAC = (isInitialized: boolean) =>
  ({ type: 'APP/SET-APP-IS-INITIALIZED', isInitialized } as const)

export type AppActionsType = SetStatusType | SetErrorType | SetAppIsInitializedType
