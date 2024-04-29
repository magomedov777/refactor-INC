import { todolistsAPI } from '../../api/todolists-api'
import { Dispatch } from 'redux'
import { AppActionsType, RequestStatusType, setStatusAC } from '../../app/app-reducer'
import { TodolistType } from '../../types'

const initialState: Array<TodolistDomainType> = []

export const todolistsReducer = (
  state: Array<TodolistDomainType> = initialState,
  action: ActionsType
): Array<TodolistDomainType> => {
  switch (action.type) {
    case 'REMOVE-TODOLIST':
      return state.filter((tl) => tl.id !== action.id)
    case 'ADD-TODOLIST':
      return [{ ...action.todolist, filter: 'all', entityStatus: 'idle' }, ...state]
    case 'CHANGE-TODOLIST-TITLE':
      return state.map((tl) => (tl.id === action.id ? { ...tl, title: action.title } : tl))
    case 'CHANGE-TODOLIST-FILTER':
      return state.map((tl) => (tl.id === action.id ? { ...tl, filter: action.filter } : tl))
    case 'SET-TODOLISTS':
      return action.todolists.map((tl) => ({ ...tl, filter: 'all', entityStatus: 'idle' }))
    case 'SET-TODOLISTS-ENTITY-STATUS':
      return state.map((el) =>
        el.id === action.todolistId ? { ...el, entityStatus: action.status } : el
      )
    default:
      return state
  }
}

export const removeTodolistAC = (id: string) => ({ type: 'REMOVE-TODOLIST', id } as const)
export const addTodolistAC = (todolist: TodolistType) =>
  ({ type: 'ADD-TODOLIST', todolist } as const)
export const changeTodolistTitleAC = (id: string, title: string) =>
  ({
    type: 'CHANGE-TODOLIST-TITLE',
    id,
    title,
  } as const)
export const changeTodolistFilterAC = (id: string, filter: FilterValuesType) =>
  ({
    type: 'CHANGE-TODOLIST-FILTER',
    id,
    filter,
  } as const)
export const setTodolistsAC = (todolists: Array<TodolistType>) =>
  ({ type: 'SET-TODOLISTS', todolists } as const)

export const setTodolistEntityStatusAC = (todolistId: string, status: RequestStatusType) =>
  ({ type: 'SET-TODOLISTS-ENTITY-STATUS', todolistId, status } as const)

export const fetchTodolistsTC = () => {
  return async (dispatch: Dispatch<ActionsType>) => {
    try {
      const res = await todolistsAPI.getTodolists()
      dispatch(setTodolistsAC(res.data))
      dispatch(setStatusAC('succeeded'))
    } catch (e) {
      dispatch(setStatusAC('failed'))
    }
  }
}
export const removeTodolistTC = (todolistId: string) => {
  return async (dispatch: Dispatch<ActionsType>) => {
    try {
      dispatch(setTodolistEntityStatusAC(todolistId, 'loading'))
      dispatch(setStatusAC('loading'))
      const res = await todolistsAPI.deleteTodolist(todolistId)
      dispatch(removeTodolistAC(todolistId))
      dispatch(setStatusAC('succeeded'))
    } catch (e) {
      dispatch(setStatusAC('failed'))
      dispatch(setTodolistEntityStatusAC(todolistId, 'failed'))
    }
  }
}
export const addTodolistTC = (title: string) => {
  return async (dispatch: Dispatch<ActionsType>) => {
    try {
      dispatch(setStatusAC('loading'))
      const res = await todolistsAPI.createTodolist(title)
      dispatch(addTodolistAC(res.data.data.item))
      dispatch(setStatusAC('succeeded'))
    } catch (e) {
      dispatch(setStatusAC('failed'))
      dispatch(setTodolistEntityStatusAC(title, 'failed'))
    }
  }
}
export const changeTodolistTitleTC = (id: string, title: string) => {
  return async (dispatch: Dispatch<ActionsType>) => {
    try {
      dispatch(setStatusAC('loading'))
      const res = await todolistsAPI.updateTodolist(id, title)
      dispatch(changeTodolistTitleAC(id, title))
      dispatch(setStatusAC('succeeded'))
    } catch (e) {
      dispatch(setStatusAC('failed'))
      dispatch(setTodolistEntityStatusAC(id, 'failed'))
    }
  }
}

export type AddTodolistActionType = ReturnType<typeof addTodolistAC>
export type RemoveTodolistActionType = ReturnType<typeof removeTodolistAC>
export type SetTodolistsActionType = ReturnType<typeof setTodolistsAC>
type ActionsType =
  | RemoveTodolistActionType
  | AddTodolistActionType
  | ReturnType<typeof changeTodolistTitleAC>
  | ReturnType<typeof changeTodolistFilterAC>
  | SetTodolistsActionType
  | AppActionsType
  | ReturnType<typeof setTodolistEntityStatusAC>
export type FilterValuesType = 'all' | 'active' | 'completed'
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType
  entityStatus: RequestStatusType
}
