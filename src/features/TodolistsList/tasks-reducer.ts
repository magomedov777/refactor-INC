import {
  AddTodolistActionType,
  RemoveTodolistActionType,
  SetTodolistsActionType,
} from './todolists-reducer'

import { Dispatch } from 'redux'
import { AppRootStateType } from '../../app/store'
import { AppActionsType, setErrorAC, setStatusAC } from '../../app/app-reducer'
import axios, { AxiosError } from 'axios'
import { TaskType, UpdateDomainTaskModelType, UpdateTaskModelType } from '../../types'
import { tasksAPI } from '../../api/tasks-api'
import { TaskPriorities, TaskStatuses } from '../../enums'
import { handleServerNetworkError } from '../../utills/handle-server-network-error'

const initialState: TasksStateType = {}

export const tasksReducer = (
  state: TasksStateType = initialState,
  action: ActionsType
): TasksStateType => {
  switch (action.type) {
    case 'REMOVE-TASK':
      return {
        ...state,
        [action.todolistId]: state[action.todolistId].filter((t) => t.id !== action.taskId),
      }
    case 'ADD-TASK':
      return { ...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]] }
    case 'UPDATE-TASK':
      return {
        ...state,
        [action.todolistId]: state[action.todolistId].map((t) =>
          t.id === action.taskId ? { ...t, ...action.model } : t
        ),
      }
    case 'ADD-TODOLIST':
      return { ...state, [action.todolist.id]: [] }
    case 'REMOVE-TODOLIST':
      const copyState = { ...state }
      delete copyState[action.id]
      return copyState
    case 'SET-TODOLISTS': {
      const copyState = { ...state }
      action.todolists.forEach((tl) => {
        copyState[tl.id] = []
      })
      return copyState
    }
    case 'SET-TASKS':
      return { ...state, [action.todolistId]: action.tasks }
    default:
      return state
  }
}

export const removeTaskAC = (taskId: string, todolistId: string) =>
  ({ type: 'REMOVE-TASK', taskId, todolistId } as const)
export const addTaskAC = (task: TaskType) => ({ type: 'ADD-TASK', task } as const)
export const updateTaskAC = (
  taskId: string,
  model: UpdateDomainTaskModelType,
  todolistId: string
) => ({ type: 'UPDATE-TASK', model, todolistId, taskId } as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
  ({ type: 'SET-TASKS', tasks, todolistId } as const)

// thunks
export const fetchTasksTC = (todolistId: string) => async (dispatch: Dispatch<ActionsType>) => {
  try {
    dispatch(setStatusAC('loading'))
    const res = await tasksAPI.getTasks(todolistId)
    const tasks = res.data.items
    dispatch(setTasksAC(tasks, todolistId))
    dispatch(setStatusAC('succeeded'))
  } catch (e: any) {
    dispatch(setErrorAC(e.message))
    dispatch(setStatusAC('failed'))
  }
}

export const removeTaskTC =
  (taskId: string, todolistId: string) => async (dispatch: Dispatch<ActionsType>) => {
    try {
      dispatch(setStatusAC('loading'))
      const res = await tasksAPI.deleteTask(todolistId, taskId)
      dispatch(removeTaskAC(taskId, todolistId))
      dispatch(setStatusAC('succeeded'))
    } catch (e: any) {
      dispatch(setErrorAC(e.message))
      dispatch(setStatusAC('failed'))
    }
  }
export const addTaskTC =
  (title: string, todolistId: string) => async (dispatch: Dispatch<ActionsType>) => {
    dispatch(setStatusAC('loading'))
    try {
      const res = await tasksAPI.createTask(todolistId, title)
      if (res.data.resultCode === 0) {
        const task = res.data.data.item
        dispatch(addTaskAC(task))
        dispatch(setStatusAC('succeeded'))
      } else {
        if (res.data.messages.length) {
          dispatch(setErrorAC(res.data.messages[0]))
        } else {
          dispatch(setErrorAC('SOME ERROR!'))
        }
        dispatch(setStatusAC('failed'))
      }
    } catch (e: any) {
      if (axios.isAxiosError(e)) {
        handleServerNetworkError(dispatch, e.message)
      } else {
        dispatch(setErrorAC('SOME ERROR!'))
      }
    }
  }

export const updateTaskTC =
  (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
  (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {
    dispatch(setStatusAC('loading'))
    const state = getState()
    const task = state.tasks[todolistId].find((t) => t.id === taskId)
    if (!task) {
      console.warn('task not found in the state')
      return
    }
    const apiModel: UpdateTaskModelType = {
      deadline: task.deadline,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      title: task.title,
      status: task.status,
      ...domainModel,
    }
    tasksAPI
      .updateTask(todolistId, taskId, apiModel)
      .then((res) => {
        if (res.data.resultCode === 0) {
          dispatch(updateTaskAC(taskId, domainModel, todolistId))
          dispatch(setStatusAC('succeeded'))
        } else {
          // handleServerAppError<{ item: TaskType }>(dispatch, res.data)
          dispatch(setStatusAC('failed'))
        }
      })
      .catch((e: AxiosError) => {
        dispatch(setErrorAC(e.message))
        dispatch(setStatusAC('failed'))
        // handleServerNetworkError(dispatch, e.message)
      })
  }

export type TasksStateType = {
  [key: string]: Array<TaskType>
}
type ActionsType =
  | ReturnType<typeof removeTaskAC>
  | ReturnType<typeof addTaskAC>
  | ReturnType<typeof updateTaskAC>
  | AddTodolistActionType
  | RemoveTodolistActionType
  | SetTodolistsActionType
  | ReturnType<typeof setTasksAC>
  | AppActionsType
