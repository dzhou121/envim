import { attach } from 'promised-neovim-client'
import {spawn } from 'child_process'
import Immutable from 'immutable'
import * as Promise from 'bluebird'
import * as _ from 'lodash'
import React from 'react';
import ReactDOM from 'react-dom';
import ReadWriteLock from 'rwlock'
import Window from './components/Window'
import Cursor from './components/Cursor'
import Cmd from './components/Cmd'

var uniqueId = 0

var lock = new ReadWriteLock()

var editor = Immutable.Map({
    width: 120,
    height: 30,
    lineHeight: 1.5,
    fontSize: 14,
    statusLine: true,
    cmdheight: 1,
    cursorPos: [0, 0],
    highlight: {},
    scroll: [],
})

var cmdPos = [editor.get("height") - editor.get("cmdheight"), 0]
var cmdEnd = [editor.get("height"), editor.get("width") - 1]
editor = editor.merge(Immutable.fromJS({cmdPos: cmdPos, cmdEnd: cmdEnd}))

console.log(editor.toJS())

var EnvimState = {editor: editor}

var EnvimClass

var EnvimEditor = React.createClass({
    getInitialState: function() {
        return EnvimState;
    },

    componentDidMount: function() {
        EnvimClass = this
        initEditor()
    },

    render: function() {
        var wins = []
        var editor = this.state.editor
        var windows = editor.get('windows')
        var pos = editor.get("cursorPos")

        if (windows !== undefined) {
            wins = windows.map((win, i) => {
                var winPos = win.get("pos")
                var winEnd = win.get("end")
                var cursor = false
                if (pos[0] >= winPos.get(0) && pos[0] <= winEnd.get(0) && pos[1] >= winPos.get(1) && pos[1] <= winEnd.get(1)) {
                    cursor = true
                }
                if (win.get("cmd")) {
                    return <Cmd key={i} win={win} bg={editor.get("bg")} fg={editor.get("fg")} editor={editor} cursor={cursor} />
                } else {
                    return <Window key={i} win={win} bg={editor.get("bg")} fg={editor.get("fg")} editor={editor} cursor={cursor} />
                }
            })
        }

        return (
            <div>
                {wins}
            </div>
        )
    }
})

ReactDOM.render(
    <EnvimEditor />,
    document.getElementById('envim-editor')
)

function initEditor() {
        var nvim_proc = spawn('nvim', ['./index.js', '--embed'], {})
        attach(nvim_proc.stdin, nvim_proc.stdout).then(function (nvim) {
            EnvimState.nvim = nvim
            uiAttach()

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

function uiAttach() {
    var nvim = EnvimState.nvim
    var editor = EnvimState.editor
    nvim.uiAttach(editor.get('width'), editor.get('height'), true, function() {
    })
    onNotify()
}

function onNotify() {
    var nvim = EnvimState.nvim
    nvim.on('notification', function(method, args) {
        lock.writeLock(function (release) {
            handleNotification(args, release)
        });
    })
}

function handleNotification(args, release) {
        var editor = new Editor(release)
        editor.redraw(args)
}

class Editor {
    constructor(release) {
        this.nvim = EnvimState.nvim
        this.state = EnvimState
        this.release = release
    }

    parseArgs(args) {
        args.map((arg, index) => {
            var e = arg[0]
            switch (e) {
                case 'cursor_goto':
                    this.cursorGoto(arg.slice(1))
                    break
                case 'put':
                    this.put(arg.slice(1))
                    break
                case 'update_fg':
                    this.state.editor = this.state.editor.set("fg", this.decToHex(arg[1][0]))
                    break
                case 'update_bg':
                    this.state.editor = this.state.editor.set("bg", this.decToHex(arg[1][0]))
                    break
                case 'highlight_set':
                    this.highlightSet(arg.slice(1))
                    break
                case 'eol_clear':
                    this.eolClear(arg.slice(1))
                    break
                case 'set_scroll_region':
                    this.setScrollRegion(arg.slice(1))
                    break
                case 'scroll':
                    this.scroll(arg.slice(1))
                    break
                default:
                    break
            }
        })
        EnvimClass.setState(EnvimState)
        this.release()
    }

    redraw(args) {
        if (this.state.editor.get('windows') != undefined) {
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
                            var windows = Immutable.fromJS(value.map((win, index) => {
                                return {
                                    height: win.height,
                                    width: win.width,
                                    pos: win.pos,
                                    end: [win.pos[0] + win.height, win.pos[1] + win.width],
                                }
                            }))

                            windows = windows.push(Immutable.Map({
                                height: this.state.editor.get("cmdheight"),
                                width: this.state.editor.get("width"),
                                pos: this.state.editor.get("cmdPos"),
                                end: this.state.editor.get("cmdEnd"),
                                cmd: true,
                            }))

                            this.state.editor = this.state.editor.merge(Immutable.fromJS({
                                windows: windows,
                                tabs: tabs,
                            }))
                            this.parseArgs(args)
                        })

                    })
                })
            })
        }
    }

    cursorGoto(args) {
        this.state.editor = this.state.editor.set("cursorPos", args[0])
    }

    winCursorPos(pos) {
        var currentIndex = 0
        this.state.editor.get("windows").forEach((win, index) => {
            var winPos = win.get("pos")
            var winEnd = win.get("end")
            if (pos[0] >= winPos.get(0) && pos[0] <= winEnd.get(0) && pos[1] >= winPos.get(1) && pos[1] <= winEnd.get(1)) {
                currentIndex = index
            }
        })
        return currentIndex
    }

    spansPut(spans, col, text, width) {
        var chars = Immutable.List()
        var line = Immutable.List()
        var highlight = this.state.editor.get("highlight")
        var end = col + text.length
        var affectedChars = []
        var affectedStart = -1
        var affectedEnd = -1
        for (var i = 0; i < spans.size; i++) {
            var span = spans.get(i)
            if (span == undefined && affectedStart == -1 && i == col) {
                affectedStart = i
            }
            if (span != undefined) {
                var spanEnd = i + span.get("text").length
                if ((i <= col && spanEnd >= col) && affectedStart == -1) {  
                    affectedStart = i
                }
                if (i <= end && spanEnd >= end) {
                    affectedEnd = spanEnd
                }
                if (affectedStart != -1) {
                    span.get("text").split('').forEach((char, index) => {
                        chars = chars.set(i + index, {
                            char: char,
                            highlight: span.get("highlight"),
                        })
                    })
                    spans = spans.set(i, undefined)
                }
                if (affectedEnd != -1) {
                    break
                }
            }
        }
        if (affectedStart == -1) {
            affectedStart = col
        }
        if ((col + text.length) > affectedEnd) {
            affectedEnd = col + text.length
        }
        text.forEach((char, i) => {
            if ((col + i) < width) {
                chars = chars.set(col + i, {
                    char: char,
                    highlight: highlight,
                })
            }
        })

        var lastIndex = 0
        for (var i = affectedStart; i > 0; i--) {
            var span = spans.get(i)
            if (span != undefined) {
                lastIndex = i
                break
            }
        }

        for (var i = affectedStart; i < affectedEnd; i++){
            var char = chars.get(i)
            if (spans.get(lastIndex) === undefined) {
                if (char === undefined) {
                    spans = spans.set(i, Immutable.Map({highlight: {}, text: " "}))
                } else {
                    spans = spans.set(i, Immutable.Map({highlight: char.highlight, text: char.char}))
                }
            } else {
                var span = spans.get(lastIndex)
                var spanHighlight = span.get("highlight")
                var currentHighlight = {}
                var charContent = " "
                if (char != undefined) {
                    currentHighlight = char.highlight
                    charContent = char.char
                }
                if (currentHighlight.foreground != spanHighlight.foreground || currentHighlight.background != spanHighlight.background) {
                    var newSpan = Immutable.Map({highlight: currentHighlight, text: charContent})
                    spans = spans.set(i, newSpan)
                    lastIndex = i
                } else {
                    var text = span.get("text") + charContent
                    span = span.merge({text: text})
                    spans = spans.set(lastIndex, span)
                }
            }
        }
        // console.log(spans.toJS())
        // console.log("-------------------")
        return spans
    }

    put(args, move = true) {
        var windows = this.state.editor.get("windows")
        var cursorPos = this.state.editor.get("cursorPos")
        var currentWinIndex = this.winCursorPos(cursorPos)
        var currentWin = windows.get(currentWinIndex)
        var currentWinPos = currentWin.get("pos")
        var currentWinCursorPos = [
            cursorPos[0] - currentWinPos.get(0),
            cursorPos[1] - currentWinPos.get(1),
        ]

        if (currentWin.get("lines") === undefined) {
            currentWin = currentWin.set("lines", Immutable.List())
        }

        var lines = currentWin.get("lines")
        if (lines.get(currentWinCursorPos[0]) === undefined) {
            uniqueId = uniqueId + 1
            lines = lines.set(currentWinCursorPos[0], Immutable.Map({
                uniqueId: uniqueId,
                spans: Immutable.List(),
            }))
        }
        var line = lines.get(currentWinCursorPos[0])
        var spans = line.get("spans")
        var c = currentWinCursorPos[1]
        var width = currentWin.get("width")
        spans = this.spansPut(spans, c, args.map(arg => {return arg[0]}), width)
        line = line.set("spans", spans)
        lines = lines.set(currentWinCursorPos[0], line)
        currentWin = currentWin.set("lines", lines)
        windows = windows.set(currentWinIndex, currentWin)
        this.state.editor = this.state.editor.set("windows", windows)
        if (move) {
            this.state.editor = this.state.editor.set("cursorPos", [cursorPos[0], cursorPos[1] + args.length])
        }
    }

    highlightSet(args) {
        var newHighlight = this.state.editor.get("highlight")
        args.forEach((arg) => {
            var highlight = arg[0]
            if (Object.keys(highlight).length == 0) {
                newHighlight = {}
            } else {
                Object.keys(highlight).forEach(key => {
                    newHighlight[key] = highlight[key]
                })
                if (newHighlight.reverse) {
                    var foreground = newHighlight.foreground
                    newHighlight.foreground = newHighlight.background
                    newHighlight.background = foreground
                }
            }
        })
        if (newHighlight.foreground != undefined) {
            newHighlight.foreground = this.decToHex(newHighlight.foreground)
        }
        if (newHighlight.background != undefined) {
            newHighlight.background = this.decToHex(newHighlight.background)
        }

        this.state.editor = this.state.editor.set("highlight", newHighlight)
    }

    eolClear(args) {
        args = []
        var cursorPos = this.state.editor.get("cursorPos")
        var width = this.state.editor.get("width")
        for (var i = cursorPos[1]; i < width; i++) {
            args.push([" "])
        }
        // this.state.editor = this.state.editor.set("highlight", {})
        this.put(args, false)
    }

    decToHex(n) {
        var padding = 6;
        var hex = n.toString(16);
        while (hex.length < padding) {
            hex = "0" + hex;
        }
        return "#".concat(hex);
    }

    setScrollRegion(args) {
        this.state.editor = this.state.editor.set("scroll", args[0])
    }

    scroll(args) {
        var n = args[0][0]
        var windows = this.state.editor.get("windows")
        var scrollRegion = this.state.editor.get("scroll")
        var pos = [scrollRegion[0], scrollRegion[3]]
        var currentWinIndex = this.winCursorPos(pos)
        var currentWin = windows.get(currentWinIndex)
        var height = currentWin.get("height")
        var lines = Immutable.List()
        var oldLines = currentWin.get("lines")
        if (n > 0) {
            for (var i = n; i < height; i++) {
                lines = lines.push(oldLines.get(i))
            }
            for (var i = 0; i < n; i++) {
                uniqueId = uniqueId + 1
                lines = lines.push(Immutable.Map({
                    uniqueId: uniqueId,
                    spans: Immutable.List(),
                }))
            }
        } else {
            lines = Immutable.List()
            for (var i = 0; i > n; i--) {
                uniqueId = uniqueId + 1
                lines = lines.push(Immutable.Map({
                    uniqueId: uniqueId,
                    spans: Immutable.List(),
                }))
            }
            for (var i = 0; i < height + n; i++) {
                lines = lines.push(oldLines.get(i))
            }
        }
        currentWin = currentWin.set("lines", lines)
        windows = windows.set(currentWinIndex, currentWin)
        this.state.editor = this.state.editor.set("windows", windows)
    }
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
