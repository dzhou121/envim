import * as actions from '../constants/ActionTypes'
import * as _ from 'lodash'
import { SET_WINDOWS, SET_BG } from '../constants/ActionTypes'

const initialState = {
    width: 120,
    height: 30,
    lineHeight: 1.5,
    fontSize: 14,
    statusLine: true,
    cmdheight: 1,
    cursorPos: [0, 0],
}

export default function editor(state = initialState, action) {
    switch (action.type) {
        // case SET_WINDOWS:
        //     console.log(action.tabs, action.windows)
        //     return Object.assign({}, state, {windows: action.windows, tabs: action.tabs})
        // case SET_BG:
        //     return Object.assign({}, state, {bg: action.bg})
        // case actions.SET_FG:
        //     return Object.assign({}, state, {fg: action.fg})
        // case actions.SET_CURSOR:
        //     return Object.assign({}, state, {cursorPos: action.pos})
        case actions.SET_EDITOR:
            return action.editor
        // case actions.SET_LINES:
        //     var windows = _.cloneDeep(state.windows)
        //     windows[action.currentWinIndex].lines = action.lines
        //     return Object.assign({}, state, {windows: windows})
        default:
            return state
    }
}
