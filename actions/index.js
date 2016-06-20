import * as _ from 'lodash'
import * as types from '../constants/ActionTypes'
import { attach } from 'promised-neovim-client'
import {spawn } from 'child_process'
import * as Promise from 'bluebird'
import ReadWriteLock from 'rwlock'

var lock = new ReadWriteLock()

export function addTodo(text) {
  return { type: types.ADD_TODO, text }
}

export function getWindows(nvim) {
}

function uiAttach() {
    return (dispatch, getState) => {
        const { nvim, editor } = getState()
        nvim.uiAttach(editor.width, editor.height, true, function() {
        })
        onNotify(dispatch, getState)
    }
}

function winCursorPos(windows, pos) {
    var currentIndex = 0
    windows.forEach((win, index) => {
        if (pos[0] >= win.pos[0] && pos[0] <= win.end[0] && pos[1] >= win.pos[1] && pos[1] <= win.end[1]) {
            currentIndex = index
        }
    })
    return currentIndex
}

function cursorGoto(args) {
        // var pos = args[0]
        // dispatch({
        //     type: types.SET_CURSOR,
        //     pos: args[0],
        // })
}

class Editor {
    constructor(nvim, editor, dispatch, release) {
        this.nvim = nvim
        this.editor = editor
        this.dispatch = dispatch
        this.changed = false
        this.release = release
    }

    parseArgs(args) {
        args.map((arg, index) => {
            var e = arg[0]
            switch (e) {
                case 'cursor_goto':
                    this.cursorGoto(arg.slice(1))
                    this.changed = true
                    break
                case 'put':
                    this.put(arg.slice(1))
                    this.changed = true
                    break
                case 'update_fg':
                    this.editor.fg = this.decToHex(arg[1][0])
                    this.changed = true
                    break
                case 'update_bg':
                    this.editor.bg = this.decToHex(arg[1][0])
                    this.changed = true
                    break
                default:
                    break
            }
        })
        if (this.changed) {
            this.dispatch({type: types.SET_EDITOR, editor: this.editor})
            console.log("redraw")
        }
        this.release()
    }

    redraw(args) {
        if (this.editor.windows != undefined) {
            this.parseArgs(args)
        } else {
            this.nvim.getTabpages().then(tabs => {
                this.nvim.getCurrentTabpage().then(tab => {
                    tab.getWindows().then(windows => {
                        Promise.all(
                            windows.map((win, index) => {
                                return Promise.props({
                                    height: win.getHeight(),
                                    width: win.getWidth(),
                                    pos: win.getPosition(),
                                })
                            })
                        ).then(value => {
                            this.editor.windows = value.map((win, index) => {
                                    return {
                                        height: win.height,
                                        width: win.width,
                                        pos: win.pos,
                                        end: [win.pos[0] + win.height, win.pos[1] + win.width],
                                    }
                                })
                            this.editor.tabs = tabs
                            this.parseArgs(args)
                        })

                    })
                })
            })
        }
    }

    cursorGoto(args) {
        this.editor.cursorPos = args[0]
    }

    winCursorPos() {
        var currentIndex = 0
        var pos = this.editor.cursorPos
        this.editor.windows.forEach((win, index) => {
            if (pos[0] >= win.pos[0] && pos[0] <= win.end[0] && pos[1] >= win.pos[1] && pos[1] <= win.end[1]) {
                currentIndex = index
            }
        })
        return currentIndex
    }

    put(args) {
        var windows = this.editor.windows
        var cursorPos = this.editor.cursorPos
        var currentWinIndex = this.winCursorPos()
        var currentWin = windows[currentWinIndex]
        var currentWinPos = currentWin.pos
        var currentWinCursorPos = [
            cursorPos[0] - currentWinPos[0],
            cursorPos[1] - currentWinPos[1],
        ]
        var lines = []
        var line = []
        if (currentWin.lines !== undefined) {
            lines = _.cloneDeep(currentWin.lines)
        }
        if (lines[currentWinCursorPos[0]] === undefined) {
            lines[currentWinCursorPos[0]] = []
        }
        line = lines[currentWinCursorPos[0]]
        var c = currentWinCursorPos[1]
        args.forEach((arg, index) => {
            line[c + index] = arg[0]
        })
        this.editor.windows[currentWinIndex].lines = lines
        var pos = cursorPos.slice()
        this.editor.cursorPos = [pos[0], pos[1] + args.length]
    }

    decToHex(n) {
        var padding = 6;
        var hex = n.toString(16);
        while (hex.length < padding) {
            hex = "0" + hex;
        }
        return "#".concat(hex);
    }
}

function handleNotification(args, release) {
    return (dispatch, getState) => {
        // return value or promise
        var state = getState()
        // var oldEditor = _.cloneDeep(state.editor)
        var oldEditor = state.editor
        var editor = new Editor(state.nvim, oldEditor, dispatch, release)
        var newEditor = editor.redraw(args)
    }
}

function onNotify(dispatch, getState) {
    const { nvim } = getState()
    nvim.on('notification', function(method, args) {
        lock.writeLock(function (release) {
            dispatch(handleNotification(args, release))
        });
    })
}

function  keyFromCharCode (charCode) {
    switch (charCode) {
      case 0:
        return 'Nul';
      case 8:
        return 'BS';
      case 9:
        return 'Tab';
      case 10:
        return 'NL';
      case 12:
        return 'FF';
      case 13:
        return 'Enter';
      case 27:
        return 'Esc';
      case 32:
        return 'Space';
      case 92:
        return 'Bslash';
      case 124:
        return 'Bar';
      case 127:
        return 'Del';
      default:
        return String.fromCharCode(charCode);
    }
  }

function getVimSpecialCharFromKey(event) {
        const key = event.key;

        if (key.length === 1) {
            switch (key) {
                case '<':  return event.ctrlKey || event.altKey ? 'LT' : null;
                case '\0': return 'Nul';
                default:   return null;
            }
        }

        if (key[0] === 'F') {
            // F1, F2, F3, ...
            return /^F\d+/.test(key) ? key : null;
        }

        const ctrl = event.ctrlKey;
        const key_code = event.keyCode;

        switch (key) {
            case 'Escape': {
                if (ctrl && key_code !== 27) {
                    // Note:
                    // When <C-[> is input
                    // XXX:
                    // Keycode of '[' is not available because it is 219 in OS X
                    // and it is not for '['.
                    return '[';
                } else {
                    return 'Esc';
                }
            }
            case 'Backspace': {
                if (ctrl && key_code === 72) {
                    // Note:
                    // When <C-h> is input (72 is key code of 'h')
                    return 'h';
                } else {
                    return 'BS';
                }
            };
            case 'Tab': {
                if (ctrl && key_code === 73) {
                    // Note:
                    // When <C-i> is input (73 is key code of 'i')
                    return 'i';
                } else {
                    return 'Tab';
                }
            };
            case 'Enter': {  // Note: Should consider <NL>?
                if (ctrl && key_code === 77) {
                    // Note:
                    // When <C-m> is input (77 is key code of 'm')
                    return 'm';
                } else if (ctrl && key_code === 67) {
                    // XXX:
                    // This is workaround for a bug of Chromium.  Ctrl+c emits wrong KeyboardEvent.key.
                    // (It should be "\uxxxx" but actually "Enter")
                    // https://github.com/rhysd/NyaoVim/issues/37
                    return 'c';
                } else {
                    return 'CR';
                }
            };
            case 'PageUp':       return 'PageUp';
            case 'PageDown':     return 'PageDown';
            case 'End':          return 'End';
            case 'Home':         return 'Home';
            case 'ArrowLeft':    return 'Left';
            case 'ArrowUp':      return 'Up';
            case 'ArrowRight':   return 'Right';
            case 'ArrowDown':    return 'Down';
            case 'Insert':       return 'Insert';
            case 'Delete':       return 'Del';
            case 'Help':         return 'Help';
            case 'Unidentified': return null;
            default:             return null;
        }
    }

export function getInitEditor() {
    return dispatch => {
        var nvim_proc = spawn('nvim', ['./index.js', '--embed'], {})
        attach(nvim_proc.stdin, nvim_proc.stdout).then(function (nvim) {
            dispatch({type: types.SET_ENVIM, nvim: nvim})
            dispatch(uiAttach())

            document.addEventListener('keydown', function(e) {
                var key = e.key
                // console.log("keydown", getVimSpecialCharFromKey(e))
                // console.log(e)
                if (key.length > 1) {
                    key = getVimSpecialCharFromKey(e)
                    if (key === null) {
                        return
                    }
                    key = '<' + key + '>'
                }
                if (e.ctrlKey) {
                    key = '<C-' + key + '>'
                } else if (e.altKey) {
                    let input = event.key;
                    key = '<A-' + String.fromCharCode(e.keyCode).toLowerCase() + '>'
                }
                // console.log("keydown",e, key)
                nvim.input(key)
            })
        })
    }
}
