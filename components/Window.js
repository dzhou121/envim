import React, { Component } from 'react'
import * as _ from 'lodash'
import Line from './Line'
import Cursor from './Cursor'
import Number from './Number'
import Sign from './Sign'
import Popupmenu from './Popupmenu'
import StatusLine from './Statusline'

// function addElement(parentId, elementTag, elementId, html) {
//     var p = document.getElementById(parentId);
//     var newElement = document.createElement(elementTag);
//     newElement.setAttribute('id', elementId);
//     newElement.innerHTML = html;
//     p.appendChild(newElement);
// }
function addElement(parentId, html) {
    var p = document.getElementById(parentId);
    p.innerHTML = html + p.innerHTML;
}

class Window extends Component {
    constructor(props, context) {
        super(props, context)
    }

    componentDidMount() {
        // console.log("componentDidMount")
        // const { win, bg, fg, editor, cursor, popupmenuShow, popupmenu } = this.props
        // // addElement("windiv" + win.get("id"), "canvas", "wincanvas" + win.get("id"), '<canvas id={"wincanvas" + win.get("id")} width={win.get("width") * 7} height={(win.get("height") + 1) * 14 * 1.5} />')
        // addElement("windiv" + win.get("id"), '<canvas id="' + "wincanvas"  + win.get("id") + '" width=' + win.get("width") * 7 + ' height=' + (win.get("height") + 1) * 14 * 1.5 + ' />')
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.win != this.props.win)  || (this.props.popupmenu != nextProps.popupmenu) || (this.props.popupmenuShow != nextProps.popupmenuShow) || (nextProps.display != this.props.display) || (this.props.win.get("floating"))
    }

    render() {
        const { display, win, bg, fg, editor, popupmenuShow, popupmenu } = this.props
        var lineHeight = editor.lineHeight
        if (win.get("floating")) {
            lineHeight = editor.floatingLineHeight
        }
        var fontSize = editor.fontSize
        var pos = [win.get("row"), win.get("col")]
        var left = 0
        if (pos[1] > 0) {
            var left = (pos[1] - 1 ) * (fontSize / 2)
        }
        var style = {
            width: win.get("width") * (fontSize / 2),
            height: win.get("height") * fontSize * lineHeight,
            position: "absolute",
            left: left,
            top: pos[0] * fontSize * lineHeight,
            backgroundColor: bg,
            boxShadow: "inset -3px 0px 10px -3px rgba(0, 0, 0, 0.75)",
            color: fg,
            zIndex: pos[0] + pos[1],
        }
        if (!display) {
            style.display = "none"
        }

        var padding = 0
        if (left > 0) {
            style.borderLeft = "1px solid #000000"
            style.paddingLeft = 6
            padding = 6
        }

        var paddingTop = 0
        if (pos[0] > 0) {
            style.borderTop = "1px solid #181d22"
            // paddingTop = fontSize * lineHeight
            // style.paddingTop = fontSize * lineHeight
            style.top = pos[0] * fontSize * lineHeight - 1
        }

        if (win.get("floating")){
            var editorCursorPos = editor.cursorPos
            style.zIndex = 500
            style.left = (editor.width - 100) * (fontSize / 2) / 2
            style.top = 0
            style.border = "1px solid #000000"
            style.borderTop = "none"
            style.boxShadow = "0px 2px 8px #000"
            style.backgroundColor = "#181d22"
            if (win.get("preview") && win.get("id") != editor.curWin) {
                style.left = editorCursorPos[1] * (fontSize / 2)
                style.top = (editorCursorPos[0] + 1) * fontSize * editor.lineHeight
            }
        }

        if (win.get("buftype") == "nofile") { 
            style.backgroundColor = "#181d22"
            // style.backgroundColor = "#1f2326"
        } else if (win.get("buftype") == "quickfix" || win.get("buftype") == "help") {
            style.backgroundColor = "#1f2326"
        }

        var popupmenuHtml
        if (popupmenuShow) {
            popupmenuHtml = <Popupmenu key={"popupmenu"} menu={popupmenu} />
        }

        var canvasBaseWidth = editor.width
        var canvasBaseHeight = editor.height
        if (win.get("floating")) {
            canvasBaseWidth = win.get("width")
            canvasBaseHeight = win.get("height")
        }
        var canvasStyle = {
            width: canvasBaseWidth * (fontSize / 2),
            height: (canvasBaseHeight + 1) *  fontSize * lineHeight ,
        }

        //<canvas ref={"wincanvas" + win.get("id")} id={"wincanvas" + win.get("id")} width={win.get("width") * (fontSize / 2)} height={(win.get("height") + 1) * 14 * 1.5} />
        return <div id={"windiv" + win.get("id")} style={style}>
            {popupmenuHtml}
            <canvas ref={"wincanvas" + win.get("id")} id={"wincanvas" + win.get("id")} style={canvasStyle} width={canvasBaseWidth * (fontSize / 2) * editor.pixel_ratio} height={(canvasBaseHeight + 1) * fontSize * lineHeight * editor.pixel_ratio} />
            </div>
    }
}

export default Window
