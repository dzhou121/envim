import * as neovimClient from 'neovim-client'
import {spawn } from 'child_process'
import {remote} from 'electron';
import Immutable from 'immutable'
import React from 'react';
import ReactDOM from 'react-dom';
import ReadWriteLock from 'rwlock'
import Window from './components/Window'
import Cursor from './components/Cursor'
import Cmd from './components/Cmd'
import Popupmenu from './components/Popupmenu'
import Emsg from './components/Emsg'
import Msg from './components/Msg'
import Tab from './components/Tab'
import StatusLine from './components/Statusline'

var uniqueId = 0

var lock = new ReadWriteLock()
var hideEmsg
var hideMsg
var hideCursorMsg

var editor = {
    emsg: "",
    msg: "",
    cursormsg: "",
    cmdline: "",
    wildmenu: [],
    wildmenuMatch: -1,
    cmdlineShow: false,
    width: 366,
    height: 63,
    mode: "normal",
    lineHeight: 1.5,
    floatingLineHeight: 1.8,
    fontSize: 14,
    statusLine: "",
    cmdheight: 1,
    cursorPos: [0, 0],
    cursorWin: 0,
    highlight: {},
    scroll: [],
    wins: Immutable.Map({}),
    activeWins: [],
    tab: [],
    popupmenu: Immutable.Map({
        selected: -1,
        show: false,
        pos: [],
        items: [],
    }),
    popupmenuWin: 1,
    previewWin: 0,
    curWin: 0,
}

resize()

var cmdPos = [editor.height - editor.cmdheight, 0]
var cmdEnd = [editor.height, editor.width - 1]
editor.cmdPos = cmdPos
editor.cmdEnd = cmdEnd

// console.log(editor)

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
        var winsElement = []
        var editor = this.state.editor
        var wins = editor.wins
        var pos = editor.cursorPos
        var tab = editor.tab
        var fontSize = this.state.editor.fontSize
        var lineHeight = this.state.editor.lineHeight
        var drawHeight = editor.drawHeight

        var cmdHtml
        if (editor.cmdlineShow) {
            cmdHtml = <Cmd wildmenu={editor.wildmenu} wildmenuMatch={editor.wildmenuMatch} text={editor.cmdline} pos={editor.cmdlinePos} editor={editor} />
        }
        var emsgHtml
        if (editor.emsg != "") {
            emsgHtml = <Emsg emsg={editor.emsg} />
        }
        var msgHtml
        if (editor.msg != "") {
            msgHtml = <Msg msg={editor.msg} />
        }

        var tabHtml
        if (tab.length > 0) {
            tabHtml = <Tab editor={editor} tab={tab} />
        }

        if (wins !== undefined) {
            wins.map(win => {
                var i = win.get('id')
                var display = false
                if (editor.activeWins.indexOf(i) != -1) {
                    display = true
                }
                // var winPos = win.get("pos")
                // var winEnd = win.get("end")
                var popupmenuShow = false
                if (i == editor.curWin) {
                    var winCursorPos = win.get("cursorPos")
                    if (winCursorPos != undefined) {
                        editor.cursorPos = [win.get("row") + winCursorPos[0], win.get("col") + winCursorPos[1]]
                    }
                }
                if (i == editor.popupmenuWin) {
                    popupmenuShow = true
                }
                winsElement.push(<Window display={display} key={i} win={win} bg={editor.bg} fg={editor.fg} editor={editor} popupmenuShow={popupmenuShow} popupmenu={editor.popupmenu} />)
            })
        }
        var cursorHtml
        var cursorMsgHtml
        if (wins.get(editor.curWin)) {
            var win = wins.get(editor.curWin)
            var pos = win.get("cursorPos")
            if (pos != undefined) {
                var left = pos[1] + win.get("col")
                var top = pos[0] + win.get("row")
                var padding = 0
                if (win.get("col") > 0) {
                    padding = 0 
                }
                var paddingTop = 0
                if (win.get("floating")){
                    padding = - ((editor.width - 100) * (fontSize / 2) / 2 + 1.5)
                    lineHeight = editor.floatingLineHeight
                    drawHeight = editor.floatingDrawHeight
                }
                cursorHtml = <Cursor key={"cursor"} padding={padding} left={left} top={top} editor={editor} mode={editor.mode} drawHeight={drawHeight} paddingTop={paddingTop} />
                if (editor.cursormsg) {
                    var cursorMsgStyle = {
                        position: "absolute",
                        left: (pos[1] + win.get("col")) * (fontSize / 2) - padding,
                        top: ((pos[0] + 1) + win.get("row")) * fontSize * lineHeight + 4,
                        padding: "4px 6px 4px 6px",
                        backgroundColor: "#d4d7d6",
                        color: "#0e1112",
                        zIndex: 1300,
                    }
                    cursorMsgHtml = <div className="linter" style={cursorMsgStyle}><span>{editor.cursormsg}</span></div>
                }
            }
        }

        var style = {
            height: (editor.height - 1) * fontSize * editor.lineHeight,
            backgroundColor: editor.bg,
            position: "relative",
        }

        var msgStyle = {
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 1000,
        }
        // console.log("statusline is", editor.statusLine)

        return (
            <div>
                {tabHtml}
                <div style={style}>
                {cmdHtml}
                {winsElement}
                {cursorHtml}
                {cursorMsgHtml}
                <div style={msgStyle}>
                  {emsgHtml}
                  {msgHtml}
                </div>
                </div>
                <StatusLine editor={editor} text={editor.statusLine} width={editor.size[0]} />
            </div>
        )
    }
})

ReactDOM.render(
    <EnvimEditor />,
    document.getElementById('envim-editor')
)

function initEditor() {
    // console.log("now init editor")
        var nvim_proc = spawn('/Users/Lulu/neovim/build/bin/nvim', ['./index.js', '--embed'], {})
    // console.log(neovimClient);
        neovimClient.default(nvim_proc.stdin, nvim_proc.stdout, function (err, nvim) {
            // console.log(err, nvim)
            EnvimState.nvim = nvim
            uiAttach()
            nvim.on('disconnect', function() {
                remote.getCurrentWindow().close()
            })

            var dragging = null
            var wheel_scrolling = new ScreenWheel(editor)
            document.addEventListener("mousedown", function(e) {
                dragging = new ScreenDrag(editor);
                nvim.input(dragging.start(e))
            })

            document.addEventListener("mouseup", function(e) {
                if (dragging != null) {
                    nvim.input(dragging.end(e))
                    dragging = null
                }
            })

            document.addEventListener("mousemove", function(e) {
                if (dragging != null) {
                    nvim.input(dragging.drag(e))
                }
            })

            document.addEventListener("wheel", function(e) {
                nvim.input(wheel_scrolling.handleEvent(e))
            })

            document.addEventListener("click", function(e) {
                console.log("click", e)
            })

            document.addEventListener('keydown', function(e) {
                var key = e.key
                // console.log("keydown", getVimSpecialCharFromKey(e))
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
                } else if (e.metaKey) {
                    key = '<A-' + String.fromCharCode(e.keyCode).toLowerCase() + '>'
                }
                if (key == "<") {
                    key = '<LT>'
                }
                // console.log("keydown",e, key)
                nvim.input(key)
            })

            window.addEventListener('resize', function() {
                checkResize()
            })
        })
}

var resizeTimeout

function checkResize() {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(function() {
        resize()
        var editor = EnvimState.editor
        EnvimState.nvim.uiTryResize(editor.width, editor.height);
    }, 1000)
}

function resize() {
    var BrowserWindow = remote.getCurrentWindow()
    var size = BrowserWindow.getContentSize()
    console.log("resize to", size)
    editor.size = size
    editor.tabHeight = 30
    editor.width = Math.round(size[0] / (editor.fontSize / 2), 0)
    editor.height = Math.round((size[1] - editor.tabHeight) / (editor.fontSize * editor.lineHeight))
    editor.statusLineHeight = size[1] - editor.tabHeight - ((editor.height - 1) * editor.fontSize * editor.lineHeight)
    editor.pixel_ratio = window.devicePixelRatio || 1
    editor.drawWidth = editor.fontSize / 2
    editor.drawHeight = Math.round(editor.fontSize * editor.lineHeight, 0)
    editor.floatingDrawHeight = Math.round(editor.fontSize * editor.floatingLineHeight, 0)
    editor.cmdPos = [editor.height - editor.cmdheight, 0]
    editor.cmdEnd = [editor.height, editor.width - 1]
}

function uiAttach() {
    // console.log("now attach ui")
    var nvim = EnvimState.nvim
    var editor = EnvimState.editor
    nvim._session.request('nvim_ui_attach', [editor.width, editor.height, {'rgb': true, 'window_external': true, 'popupmenu_external': true}], function(err, res) {
        // console.log(err)
        // console.log(res)
    })
    onNotify()
}

function onNotify() {
    var nvim = EnvimState.nvim
    nvim.on('notification', function(method, args) {
        if (args.length > 0) {
            lock.writeLock(function (release) {
                handleNotification(args, release)
            });
        }
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
        this.cursormsgSet = false
        this.cursorMoved = false
        args.map((arg, index) => {
            var e = arg[0]
            // console.log(e)
            // console.log(arg[1])
            switch (e) {
                case 'cursor_goto':
                    break
                    this.cursorGoto(arg.slice(1))
                    break
                case 'put':
                    // console.log("put")
                    break
                    this.put(arg.slice(1))
                    break
                case 'update_fg':
                    this.state.editor.fg = this.decToHex(arg[1][0])
                    break
                case 'update_bg':
                    this.state.editor.bg = this.decToHex(arg[1][0])
                    break
                case 'highlight_set':
                    this.highlightSet(arg.slice(1))
                    break
                case 'eol_clear':
                    this.eolClear(arg.slice(1))
                    break
                case 'set_scroll_region':
                    break
                    this.setScrollRegion(arg.slice(1))
                    break
                case 'win_set_scroll_region':
                    this.win_set_scroll_region(arg.slice(1))
                    break
                case 'scroll':
                    console.log('scroll')
                    console.log(arg.slice(1)[0])
                    break
                    this.scroll(arg.slice(1))
                    break
                case 'mode_change':
                    this.modeChange(arg.slice(1))
                    break
                case 'win_scroll':
                    this.win_scroll(arg.slice(1))
                    break
                case 'tab':
                    // console.log("win_update")
                    this.tab(arg.slice(1))
                    break
                case 'win_clear':
                    // console.log("win_update")
                    this.win_clear(arg.slice(1))
                    break
                case 'win_resize':
                    // console.log("win_update")
                    this.win_resize(arg.slice(1))
                    break
                case 'win_update':
                    // console.log("win_update")
                    this.win_update(arg.slice(1))
                    break
                case 'win_close':
                    // console.log("win_update")
                    this.win_close(arg.slice(1))
                    break
                case 'win_draw_sign':
                    // console.log("win_draw_sign")
                    this.win_draw_sign(arg.slice(1))
                    break
                case 'win_put':
                    // console.log("win_put")
                    this.cursorMoved = true
                    this.win_put(arg.slice(1))
                    break
                case 'win_status_line':
                    // console.log("win_put")
                    this.win_status_line(arg.slice(1))
                    break
                case 'win_cursor_goto':
                    // console.log("win_cursor_goto")
                    this.cursorMoved = true
                    this.win_cursor_goto(arg.slice(1))
                    break
                case 'popupmenu_show':
                    this.popupmenu_show(arg.slice(1))
                    break
                case 'popupmenu_hide':
                    this.popupmenu_hide(arg.slice(1))
                    break
                case 'popupmenu_select':
                    this.popupmenu_select(arg.slice(1))
                    break
                case 'echo':
                    this.msg(arg.slice(1))
                    break
                case 'echomsg':
                    this.msg(arg.slice(1))
                    break
                // case 'msg':
                //     this.msg(arg.slice(1))
                //     break
                case 'emsg':
                    this.emsg(arg.slice(1))
                    break
                case 'cmdline':
                    this.cmdline(arg.slice(1))
                    break
                case 'wild_menu':
                    this.wild_menu(arg.slice(1))
                    break
                case 'wild_menu_clean':
                    this.wild_menu_clean(arg.slice(1))
                    break
                case 'cmdlinepos':
                    this.cmdlinepos(arg.slice(1))
                    break
                case 'command_line_enter':
                    this.command_line_enter(arg.slice(1))
                    break
                case 'command_line_leave':
                    this.command_line_leave(arg.slice(1))
                    break
                case 'bell':
                    this.bell(arg.slice(1))
                    break
                case 'busy_start':
                    this.busy_start(arg.slice(1))
                    break
                case 'busy_stop':
                    this.busy_stop(arg.slice(1))
                    break
                case 'mouse_on':
                    this.mouse_on(arg.slice(1))
                    break
                default:
                    console.log(e)
                    console.log(arg[1])
                    break
            }
        })
        if (!this.cursormsgSet && this.cursorMoved && this.state.editor.cursormsg != "") {
            var self = this
            clearTimeout(hideCursorMsg)
            hideCursorMsg = setTimeout(function() {
                self.state.editor.cursormsg = ""
                self.update()
            }, 100)
        }
        this.update()
        this.release()
    }

    update() {
        EnvimClass.setState(EnvimState)
    }

    redraw(args) {
        this.parseArgs(args)
    }

    bell(args) {
    }

    busy_start(args) {
        // console.log("busy_start", args)
    }

    busy_stop(args) {
        // console.log("busy_stop", args)
    }

    mouse_on(args) {
        // console.log("mouse_on", args)
    }

    cursorGoto(args) {
        // this.state.editor = this.state.editor.set("cursorPos", args[0])
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

    spansPutNew(spans, col, text, width) {
        var chars = ""
        text.forEach((char, i) => {
            chars = chars + char
        })
        spans = spans.set(col, Immutable.Map({highlight: {}, text: chars}))
        return spans
    }

    spansPut(spans, row, col, text, width, height, numWidth, drawSign, signColumn, numColumn) {
        var chars = Immutable.List()
        var line = Immutable.List()
        var highlight = this.state.editor.highlight
        var end = col + text.length
        var affectedChars = []
        var affectedStart = -1
        var affectedEnd = -1

        if (signColumn === undefined) {
            signColumn = Immutable.List()
        }
        if (numColumn === undefined) {
            numColumn = Immutable.List()
        }

        if (height > row) {
            if (drawSign) {
                var signOffset = 1;
                if (col <= signOffset) {
                    for (col; col <= signOffset; col++) {
                        var c = text.shift()
                        if (c === undefined) {
                            break
                        }
                        var sign = signColumn.get(row)
                        var signText = []
                        if (sign != undefined) {
                            signText = sign.sign
                        }
                        signText[col] = c
                        signColumn = signColumn.set(row, {'sign': signText, 'highlight': highlight})
                    }
                }
            }
            var numOffset = numWidth + (drawSign ? 2:0) - 1
            if (col <= numOffset) {
                for (col; col <= numOffset; col++) {
                    var c = text.shift()
                    if (c === undefined) {
                        break
                    }
                    var num = numColumn.get(row)
                    var numText = []
                    if (num != undefined) {
                        numText = num.num
                    }
                    numText[col - (drawSign ? 2:0)] = c
                    if (numText.length > numWidth) {
                        numText = numText.splice(0, numWidth - 1)
                    }
                    numColumn = numColumn.set(row, {'num': numText, 'highlight': highlight})
                }
            }
            if (text.length == 0) {
                return [signColumn, numColumn, spans]
            }
        }

        if (spans.size > width) {
            var newSpans = Immutable.List()
            for (var i = 0; i <= width; i++) {
                var span = spans.get(i)
                if (span != undefined) {
                    newSpans = newSpans.set(i, span)
                }
            }
            spans = newSpans
        }
        // for (var i = spans.size -1; i >= 0; i--) {
        //     var span = spans.get(i)
        //     if (span != undefined) {
        //         var spanText = span.get("text")
        //         if ((spanText.length + i) > width) {
        //             console.log(spanText)
        //             var newSpanText = ""
        //             for (var j = i; j < width; j ++) {
        //                 newSpanText = newSpanText + spanText[j - i]
        //             }
        //             console.log("old text")
        //             console.log(spanText)
        //             console.log("new text")
        //             console.log(newSpanText)
        //             span = span.set("text", newSpanText)
        //             spans = spans.set(i, span)
        //         }
        //         break
        //     }
        // }
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
                if (i > 0) {
                    var text = ""
                    for (var j = 0; j < i; j++) {
                        text = text + " "
                    }
                    spans = spans.set(0, Immutable.Map({highlight: {}, text: text}))
                }
                lastIndex = i
            } else {
                var span = spans.get(lastIndex)
                var spanHighlight = span.get("highlight")
                if (span.get("text").length < (i - lastIndex)) {
                    var newText = ""
                    for(var j = 0; j < (i - lastIndex - span.get("text").length); j++) {
                        newText = newText + " "
                    }

                    if (spanHighlight.background != undefined || spanHighlight.foreground != undefined) {
                        // console.log('"' + newText + '"')
                        var currentIndex = span.get("text").length + lastIndex
                        var newSpan = Immutable.Map({highlight: {}, text: newText})
                        spans = spans.set(currentIndex, newSpan)
                        lastIndex = currentIndex
                    } else {
                        // console.log('"' + span.get("text") + '"')
                        // console.log('"' + newText + '"')
                        span = span.set("text", span.get("text") + newText)
                        spans = spans.set(lastIndex, span)
                    }
                }

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
        return [signColumn, numColumn, spans]
    }

    cmdlinepos(args) {
        var arg = args[0]
        this.state.editor.cmdlinePos = arg[0]
    }

    msg(args) {
        var arg = args[0]
        var self = this
        var msg = arg[0]
        if (msg.startsWith("__cursor__")) {
            clearTimeout(hideCursorMsg)
            this.state.editor.cursormsg = msg.slice(10)
            this.cursormsgSet = true
        } else {
            clearTimeout(hideMsg)
            this.state.editor.msg = arg[0]
            hideMsg = setTimeout(function() {
                self.state.editor.msg = ""
                self.update()
            }, 5000)
        }
    }

    emsg(args) {
        clearTimeout(hideEmsg)
        var arg = args[0]
        var self = this
        this.state.editor.emsg = arg[0]
        hideEmsg = setTimeout(function() {
            self.state.editor.emsg = ""
            self.update()
        }, 5000)
    }

    cmdline(args) {
        var arg = args[0]
        this.state.editor.cmdline = arg[0]
        this.state.editor.cmdlinePos = arg[1]
    }

    wild_menu(args) {
        var arg = args[0]
        this.state.editor.wildmenuMatch = arg[0]
        this.state.editor.wildmenu = arg.slice(1)
    }

    wild_menu_clean(args) {
        this.state.editor.wildmenu = []
        this.state.editor.wildmenuMatch = -1
    }

    command_line_enter(args) {
        this.state.editor.cmdlineShow = true
    }

    command_line_leave(args) {
        this.state.editor.cmdline = ""
        this.state.editor.cmdlinePos = 0
        this.state.editor.cmdlineShow = false
    }

    popupmenu_select(args) {
        var arg = args[0]
        this.state.editor.popupmenu = this.state.editor.popupmenu.set("selected", arg[0])
    }

    popupmenu_hide(args) {
        this.state.editor.popupmenu = this.state.editor.popupmenu.set("show", false)
    }

    popupmenu_show(args) {
        var arg = args[0]
        var popupmenu = this.state.editor.popupmenu
        popupmenu = popupmenu.set("show", true)
        popupmenu = popupmenu.set("items", arg[0])
        popupmenu = popupmenu.set("selected", arg[1])
        popupmenu = popupmenu.set("pos", [arg[2], arg[3]])
        this.state.editor.popupmenuWin = arg[4]
        this.state.editor.popupmenu = popupmenu
    }

    win_cursor_goto(args) {
        var arg = args[0]
        // console.log(arg[1], arg[2])
        var winId = arg[0]
        // console.log("win cursor goto", winId, arg[1], arg[2])
        var cursorRow = arg[1]
        var cursorCol = arg[2]
        var wins = this.state.editor.wins
        var win = wins.get(winId)
        if (win === undefined) {
            win = Immutable.Map({
                id: winId,
                width: this.state.editor.width,
                height: this.state.editor.height,
            })
        }
        if (cursorRow >= win.get('height') || cursorCol >= win.get("width")) {
            return
        }
        win = win.set("cursorPos", [cursorRow, cursorCol])
        this.state.editor.cursorWin = winId
        this.state.editor.wins = wins.set(winId, win)
    }

    win_status_line(args) {
        var editor = this.state.editor
        var arg = args[0]
        var winId = arg[0]
        var statusLine = arg[1]

        if (winId == editor.curWin) {
            editor.statusLine = statusLine
        }
    }

    win_put(args) {
        if (args.length == 0) {
            return
        }
        var arg = args[0]
        var winId = arg[0]
        var editor = this.state.editor
        var drawWidth = editor.drawWidth * editor.pixel_ratio
        var drawHeight = editor.drawHeight * editor.pixel_ratio
        // console.log("win_put", winId, args.map(arg => {return arg[1]}))
        var char = arg[1]
        var wins = this.state.editor.wins
        var win = wins.get(winId)
        var pixel_ratio = this.state.editor.pixel_ratio
        if (win === undefined) {
            win = Immutable.Map({
                id: winId,
                width: this.state.editor.width,
                height: this.state.editor.height,
            })
        }
        var fontSize = this.state.editor.fontSize
        var lineHeight = this.state.editor.lineHeight
        if (win.get("floating")) {
            lineHeight = this.state.editor.floatingLineHeight
            drawHeight = editor.floatingDrawHeight * editor.pixel_ratio
        }
        var cursorPos = win.get("cursorPos")
        if (cursorPos === undefined) {
            cursorPos = [0, 0]
        }
        var col = cursorPos[1]
        var width = win.get("width")
        var height = win.get("height")
        var numWidth = win.get("numWidth")
        var drawSign = win.get("drawSign")
        var signColumn = win.get("signColumn")
        var numColumn = win.get("numColumn")

        var wincanvasId = "wincanvas" + winId
        var c = document.getElementById(wincanvasId)
        if (c != undefined && cursorPos[0] < height) {
            var ctx = c.getContext("2d")
            // var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
            //                 ctx.mozBackingStorePixelRatio ||
            //                 ctx.msBackingStorePixelRatio ||
            //                 ctx.oBackingStorePixelRatio ||
            //                 ctx.backingStorePixelRatio || 1
            // console.log("backingStoreRatio is", backingStoreRatio)
            var text = (args.map(arg => {return arg[1]})).join("")
            var textDrawWidth = ctx.measureText(text).width
            ctx.clearRect(
                cursorPos[1] * drawWidth,
                cursorPos[0] * drawHeight,
                text.length * drawWidth,
                drawHeight)
            if (this.state.editor.highlight.background != undefined) {
                ctx.fillStyle = this.state.editor.highlight.background;
                ctx.fillRect(cursorPos[1] * drawWidth, cursorPos[0] * drawHeight, args.length * drawWidth, drawHeight)
            }

            ctx.font = (fontSize * pixel_ratio) + "px InconsolataforPowerline Nerd Font"
            if (this.state.editor.highlight.foreground != undefined) {
                ctx.fillStyle = this.state.editor.highlight.foreground;
            } else {
                ctx.fillStyle = this.state.editor.fg;
            }
            if (text.trim()) {
                if (textDrawWidth != ctx.measureText("a").width * text.length) {
                    if (text.length == 1) {
                        // console.log("text is", text, cursorPos[0], cursorPos[1])
                        ctx.clearRect(
                            (cursorPos[1] + 1) * drawWidth,
                            cursorPos[0] * drawHeight,
                            drawWidth,
                            drawHeight)
                        ctx.fillText(
                            text,
                            (cursorPos[1]) * drawWidth,
                            (cursorPos[0] + 1) * drawHeight - ((fontSize * (lineHeight - 1) / 2 + 2.5) * pixel_ratio)
                        )
                        if (this.state.editor.highlight.background != undefined) {
                            ctx.fillStyle = this.state.editor.highlight.background;
                            ctx.fillRect(
                                (cursorPos[1] + 1) * drawWidth,
                                cursorPos[0] * drawHeight,
                                drawWidth,
                                drawHeight
                            )
                        }
                    } else {
                        text.split("").forEach((char, i) => {
                            ctx.fillText(char, (cursorPos[1] + i) * drawWidth, (cursorPos[0] + 1) * drawHeight - ((fontSize * (lineHeight - 1) / 2 + 2.5) * pixel_ratio))
                        })
                    }
                } else {
                    ctx.fillText(text, cursorPos[1] * drawWidth, (cursorPos[0] + 1) * drawHeight - ((fontSize * (lineHeight - 1) / 2 + 2.5) * pixel_ratio))
                }
            }
            // console.log("ctx filltext", wincanvasId, text, cursorPos[1] * 7, (cursorPos[0] + 1) * 14)
            // ctx.fillText(text, 0, 14)
        }
        // if (cursorPos[0] < height) {
        //     var lines = win.get("lines")
        //     if (lines === undefined) {
        //         lines = Immutable.List()
        //     }
        //     var line = lines.get(cursorPos[0])
        //     if (line === undefined) {
        //         uniqueId = uniqueId + 1
        //         line = Immutable.Map({
        //             uniqueId: uniqueId,
        //             spans: Immutable.List(),
        //         })
        //     }
        //     var spans = line.get("spans")
        //     var result = this.spansPut(spans, cursorPos[0], col, args.map(arg => {return arg[1]}), width, height, numWidth, drawSign, signColumn, numColumn)
        //     signColumn = result[0]
        //     numColumn = result[1]
        //     if (spans != result[2]) {
        //         line = line.set("spans", result[2])
        //     }
        //     lines = lines.set(cursorPos[0], line)
        //     win = win.set("lines", lines)
        // } else {
        //     var statusLine = win.get("statusLine")
        //     if (statusLine === undefined) {
        //         statusLine = {spans: Immutable.List()}
        //     }
        //     var spans = statusLine.spans
        //     var result = this.spansPut(spans, cursorPos[0], col, args.map(arg => {return arg[1]}), width, height, numWidth, drawSign, signColumn, numColumn)
        //     statusLine.spans = result[2]
        //     win = win.set("statusLine", statusLine)
        // }
        // win = win.set("signColumn", signColumn)
        // win = win.set("numColumn", numColumn)
        win = win.set("cursorPos", [cursorPos[0], cursorPos[1] + args.length])
        // console.log("win cursor pos after put", cursorPos[0], cursorPos[1] + args.length, (args.map(arg => {return arg[1]})).join(""))
        wins = wins.set(winId, win)
        this.state.editor.wins = wins
    }

    win_draw_sign(args) {
        var arg = args[0]
        var winId = arg[0]
        var drawSign = arg[1]
        var wins = this.state.editor.wins
        var win = wins.get(winId)
        var need_update = false;
        if (win == undefined) {
            win = Immutable.Map({
                drawSign: drawSign,
            })
            need_update = true;
        } else {
            if (win.get("drawSign") != drawSign) {
                win = win.set("drawSign", drawSign)
            }
            need_update = true;
        }
        if (need_update) {
            wins = wins.set(winId, win)
            this.state.editor.wins = wins
        }
    }

    win_scroll(args) {
        var arg = args[0]
        var winId = arg[0]
        var count = arg[1]
        // console.log("scroll",  winId, count)
        var editor = this.state.editor
        var wins = this.state.editor.wins
        var scroll = editor.scroll
        var win = wins.get(winId)
        var fontSize = this.state.editor.fontSize
        var lineHeight = this.state.editor.lineHeight
        var pixel_ratio = this.state.editor.pixel_ratio
        if (win.get("floating")) {
            lineHeight = this.state.editor.floatingLineHeight
        }
        var height = win.get("height")
        if (height == undefined) {
            height = 0
        }
        if (win == undefined) {
            win = Immutable.Map({
            })
        }

        // var startRow = 0
        // var destRow = 0
        // if (count > 0) {
        //     startRow = count
        //     height = height - count
        // } else {
        //     destRow = -count
        //     height = height + count
        // }
        var startRow = scroll
        var destRow = scroll
        if (count > 0) {
            startRow = scroll + count
            height = height - scroll - count
        } else {
            destRow = scroll - count
            height = height - scroll + count
        }
        // console.log("scroll", startRow, destRow, height)

        var wincanvasId = "wincanvas" + winId
        var c = document.getElementById(wincanvasId)
        if (c != undefined) {
            var ctx = c.getContext("2d")
            var width = win.get("width") * (fontSize / 2) * pixel_ratio
            var height = height * fontSize * lineHeight * pixel_ratio
            var startY = startRow * fontSize * lineHeight * pixel_ratio
            var destY = destRow * fontSize * lineHeight * pixel_ratio

            var buffer = document.createElement('canvas');
            buffer.width = width
            buffer.height = height
            buffer.getContext('2d').drawImage(c,
                0,
                startY, width, height,
                0,
                0, width, height
            );

            ctx.clearRect(
                0,
                scroll * fontSize * lineHeight * pixel_ratio,
                width,
                (win.get("height") - scroll) * fontSize * lineHeight * pixel_ratio)

            ctx.drawImage(buffer,
                0, destY, width, height)

            return
        }
        return
        var lines = Immutable.List()
        var signColumn = Immutable.List()
        var numColumn = Immutable.List()
        var oldLines = win.get("lines")
        var oldSignColumn = win.get("signColumn")
        if (oldSignColumn == undefined) {
            oldSignColumn = Immutable.List()
        }
        var oldNumColumn = win.get("numColumn")
        if (oldNumColumn == undefined) {
            oldNumColumn = Immutable.List()
        }
        if (count > 0) {
            for (var i = count; i < height; i++) {
                lines = lines.push(oldLines.get(i))
                // if (oldSignColumn.get(i) != undefined) {
                //     signColumn = signColumn.push(oldSignColumn.get(i))
                // }
                // if (oldNumColumn.get(i) != undefined) {
                //     numColumn = numColumn.push(oldNumColumn.get(i))
                // }
            }
            for (var i = 0; i < count; i++) {
                uniqueId = uniqueId + 1
                lines = lines.push(Immutable.Map({
                    uniqueId: uniqueId,
                    spans: Immutable.List(),
                }))
                // signColumn = signColumn.push({})
                // numColumn = numColumn.push({})
            }
        } else {
            for (var i = 0; i > count; i--) {
                uniqueId = uniqueId + 1
                lines = lines.push(Immutable.Map({
                    uniqueId: uniqueId,
                    spans: Immutable.List(),
                }))
                // signColumn = signColumn.push({})
                // numColumn = numColumn.push({})
            }
            for (var i = 0; i < height + count; i++) {
                lines = lines.push(oldLines.get(i))
                // if (oldSignColumn.get(i) != undefined) {
                //     signColumn = signColumn.push(oldSignColumn.get(i))
                // }
                // if (oldNumColumn.get(i) != undefined) {
                //     numColumn = numColumn.push(oldNumColumn.get(i))
                // }
            }
        }

        win = win.set("lines", lines)
        // win = win.set("signColumn", signColumn)
        // win = win.set("numColumn", numColumn)
        wins = wins.set(winId, win)
        this.state.editor.wins = wins
    }

    win_close(args) {
        // console.log("win_close")
        var arg = args[0]
        var winId = arg[0]
        var wins = this.state.editor.wins
        wins = wins.delete(winId)
        this.state.editor.wins = wins
    }

    tab(args) {
        var arg = args[0]
        this.state.editor.tab = arg
    }

    win_clear(args) {
        var arg = args[0]
        // console.log("win_clear", arg)
        var wins = this.state.editor.wins
        var fontSize = this.state.editor.fontSize
        var pixel_ratio = this.state.editor.pixel_ratio
        arg.forEach((winId, i) => {
            var wincanvasId = "wincanvas" + winId
            var c = document.getElementById(wincanvasId)
            var lineHeight = this.state.editor.lineHeight
            var win = wins.get(winId)
            if (win.get("floating")) {
                lineHeight = this.state.editor.floatingLineHeight
            }
            if (c != undefined) {
                var ctx = c.getContext("2d")
                ctx.clearRect(0, 0, win.get("width") * (fontSize / 2) * pixel_ratio, (win.get("height") + 1) * fontSize * lineHeight * pixel_ratio)
            }
        })
        // this.state.editor.activeWins = arg
        // wins.map((win, i) => {
        //     win = win.delete("lines")
        //     wins = wins.set(i, win)
        // })
        // this.state.editor.wins = wins
    }

    win_resize(args) {
        var wins = this.state.editor.wins
        var editor = this.state.editor
        var arg = args[0]
        var activeWins = []
        arg.forEach((winArg) => {
            var winId = winArg[0]
            var width = winArg[1]
            var height = winArg[2]
            var oldWidth
            var oldHeight
            var row = winArg[3]
            var col = winArg[4]
            var floating = winArg[5]
            var preview = winArg[6]
            var curWin = winArg[7]
            var buftype = winArg[8]
            if (floating) {
                editor.previewWin = winId
            }
            if (curWin) {
                editor.curWin = winId
            }
            var win = wins.get(winId)
            if (win === undefined) {
                win = Immutable.Map({
                    id: winId,
                    width: width,
                    height: height,
                    row: row,
                    col: col, 
                    floating: floating,
                    preview: preview,
                    buftype: buftype,
                })
            } else {
                oldWidth = win.get("width")
                oldHeight = win.get("height")
                win = win.merge(Immutable.Map({
                    id: winId,
                    width: width,
                    height: height,
                    row: row,
                    col: col, 
                    floating: floating,
                    preview: preview,
                    buftype: buftype,
                }))
            }
            activeWins.push(winId)
            editor.activeWins = activeWins
            wins = wins.set(winId, win)
            this.state.editor.wins = wins
            // this.update()
            // this.canvas_update(winId, oldWidth, oldHeight, width, height)
        })
        this.update()
        // console.log("activeWins in win_resize", this.state.editor.activeWins)
    }

    win_update(args) {
        return
        var arg = args[0];
        var need_update = false;
        var wins = this.state.editor.wins
        var winId = arg[0]
        var width = arg[1]
        var height = arg[2]
        var oldWidth
        var oldHeight
        var row = arg[3]
        var col = arg[4]
        // console.log("win_update", winId, row, col)
        var numWidth = arg[5]
        var drawSign = arg[6]
        var win = wins.get(winId)
        if (this.state.editor.activeWins.indexOf(winId) == -1) {
            this.state.editor.activeWins.push(winId)
        }
        if (win == undefined) {
            win = Immutable.Map({
                id: winId,
                width: width,
                height: height,
                row: row,
                col: col, 
                numWidth: arg[5],
                drawSign: arg[6],
            })
            need_update = true;
        } else {
            oldWidth = win.get("width")
            oldHeight = win.get("height")
            if (win.get("width") != width || win.get("height") != height || win.get("row") != row || win.get("col") != col || win.get("numWidth") != numWidth || win.get("drawSign") != drawSign) {
                win = win.merge(Immutable.Map({
                    id: winId,
                    width: width,
                    height: height,
                    row: row,
                    col: col, 
                    numWidth: arg[5],
                    drawSign: arg[6],
                }))
                need_update = true;
            }
        }
        if (need_update) {
            wins = wins.set(winId, win)
            this.state.editor.wins = wins
        }
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
        // spans = this.spanssssPut(spans, c, args.map(arg => {return arg[0]}), width)
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
        // console.log("hightlight set", args.map(arg => {return arg[0]}))
        var newHighlight = this.state.editor.highlight
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

        this.state.editor.highlight = newHighlight
    }

    eolClear(args) {
        var editor = this.state.editor
        var curWin = editor.curWin
        var wins = editor.wins
        var win = wins.get(curWin)

        var cursorPos = win.get("cursorPos")

        args = []
        var width = win.get("width")
        for (var i = cursorPos[1]; i < width; i++) {
            args.push([curWin, " "])
        }
        // console.log("eolClear", curWin, width, cursorPos[0], cursorPos[1])
        this.win_put(args)
        // this.state.editor = this.state.editor.set("highlight", {})
    }

    decToHex(n) {
        var padding = 6;
        var hex = n.toString(16);
        while (hex.length < padding) {
            hex = "0" + hex;
        }
        return "#".concat(hex);
    }

    win_set_scroll_region(args) {
        // console.log("set scroll region")
        // console.log(args[0])
        this.state.editor.scroll = args[0][0]
    }

    setScrollRegion(args) {
        // console.log("set scroll region")
        // console.log(args[0])
        // this.state.editor.scroll = args[0]
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

    modeChange(args) {
        var mode = args[0][0]
        this.state.editor.mode = mode
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

const MouseButtonKind = [ 'Left', 'Middle', 'Right' ];

class ScreenDrag {

    constructor(editor) {
        this.line = 0;
        this.col = 0;
        this.editor = editor
    }

    static buildInputOf(e, type, line, col) {
        let seq = '<';
        if (e.ctrlKey) {
            seq += 'C-';
        }
        if (e.altKey) {
            seq += 'A-';
        }
        if (e.shiftKey) {
            seq += 'S-';
        }
        seq += MouseButtonKind[e.button] + type + '>';
        seq += `<${col},${line}>`;
        return seq;
    }

    start(down_event) {
        down_event.preventDefault();
        [this.line, this.col] = this.getPos(down_event);
        console.log('Drag start', down_event, this.line, this.col);
        const input = ScreenDrag.buildInputOf(down_event, 'Mouse', this.line, this.col);
        // log.debug('Mouse input: ' + input);
        return input;
    }

    drag(move_event) {
        const [line, col] = this.getPos(move_event);
        if (line === this.line && col === this.col) {
            return null;
        }
        move_event.preventDefault();
        // log.debug('Drag continue', move_event, line, col);
        const input = ScreenDrag.buildInputOf(move_event, 'Drag', line, col);
        this.line = line;
        this.col = col;
        // log.debug('Mouse input: ' + input);
        return input;
    }

    end(up_event) {
        up_event.preventDefault();

        [this.line, this.col] = this.getPos(up_event);
        console.log('Drag end', up_event, this.line, this.col);

        const input = ScreenDrag.buildInputOf(up_event, 'Release', this.line, this.col);
        console.log('Mouse input: ' + input);
        return input;
    }

    getPos(e) {
        return [
            Math.floor((e.clientY - this.editor.tabHeight) / (this.editor.fontSize * editor.lineHeight)),
            Math.floor(e.clientX / (this.editor.fontSize / 2)),
        ];
    }
}

class ScreenWheel {

    constructor(editor) {
        this.editor = editor
        this.reset();
    }

    handleEvent(e) {
        if ((this.shift === undefined && this.ctrl === undefined) ||
            (this.shift !== e.shiftKey || this.ctrl !== e.ctrlKey)) {
            // Note:
            // Initialize at first or reset on modifier change
            this.reset(e.shiftKey, e.ctrlKey);
        }

        this.x += e.deltaX;
        this.y += e.deltaY;

        const scroll_x = Math.round(this.x / (editor.fontSize / 2) / 6);
        const scroll_y = Math.round(this.y / (editor.fontSize * editor.lineHeight) / 3);

        if (scroll_x === 0 && scroll_y === 0) {
            // Note: At least 3 lines or 6 columns are needed to scroll screen
            return '';
        }
        var line
        var col
        [line, col] = this.getPos(e)

        const input = this.getInput(scroll_x, scroll_y, line, col);
        // log.debug(`Scroll (${scroll_x}, ${scroll_y})`);
        this.reset();
        return input;
    }

    reset(shift, ctrl) {
        this.x = 0;
        this.y = 0;
        this.shift = shift;
        this.ctrl = ctrl;
    }

    getDirection(scroll_x, scroll_y) {
        if (scroll_y !== 0) {
            return scroll_y > 0 ? 'Down' : 'Up';
        } else if (scroll_x !== 0) {
            return scroll_x > 0 ? 'Left' : 'Right';
        } else {
            // Note: Never reach here
            log.error('Null scrolling');
            return '';
        }
    }

    getInput(scroll_x, scroll_y, line, col) {
        let seq = '<';
        if (this.ctrl) {
            seq += 'C-';
        }
        if (this.shift) {
            seq += 'S-';
        }
        seq += `ScrollWheel${this.getDirection(scroll_x, scroll_y)}>`;
        seq += `<${col},${line}>`; // This is really needed?
        return seq;
    }

    getPos(e) {
        return [
            Math.floor((e.clientY - this.editor.tabHeight) / (this.editor.fontSize * editor.lineHeight)),
            Math.floor(e.clientX / (this.editor.fontSize / 2)),
        ];
    }
}
