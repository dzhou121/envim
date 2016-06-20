import { combineReducers } from 'redux'
import nvim from './nvim'
import editor from './editor'

const rootReducer = combineReducers({
  nvim,
  editor
})

export default rootReducer
