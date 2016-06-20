import { SET_ENVIM } from '../constants/ActionTypes'

export default function nvim(state = {}, action) {
    switch (action.type) {
        case SET_ENVIM:
            return action.nvim
        default:
            return state
    }
}
