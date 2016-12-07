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
        return (nextProps.win != this.props.win) || (this.props.cursor != nextProps.cursor) || (this.props.popupmenu != nextProps.popupmenu) || (this.props.popupmenuShow != nextProps.popupmenuShow) || (nextProps.display != this.props.display) || (this.props.win.get("floating"))
    }

    render() {
        const { display, win, bg, fg, editor, cursor, popupmenuShow, popupmenu } = this.props
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
            style.paddingLeft = 3
            style.paddingRight = 3
            padding = 3
        }

        if (win.get("floating")){
            var editorCursorPos = editor.cursorPos
            style.zIndex = 500
            style.left = (editor.width - 100) * (fontSize / 2) / 2
            style.top = 0
            style.border = "1px solid #000000"
            style.boxShadow = "0 0 10px #000"
            style.backgroundColor = "#15191b"
            if (win.get("preview") && !cursor) {
                style.left = editorCursorPos[1] * (fontSize / 2)
                style.top = (editorCursorPos[0] + 1) * fontSize * lineHeight
            }
        }

        var cursorHtml
        var cursorMsgHtml
        if (cursor) {
            var pos = win.get("cursorPos")
            cursorHtml = <Cursor key={"cursor"} padding={padding} left={pos[1]} top={pos[0]} editor={editor} mode={editor.mode} lineHeight={lineHeight} />
            if (editor.cursormsg) {
                var cursorMsgStyle = {
                    position: "absolute",
                    left: pos[1] * (fontSize / 2) + padding,
                    top: (pos[0] + 1) * fontSize * lineHeight + 4,
                    fontSize: 12,
                    padding: "4px 6px 4px 6px",
                    backgroundColor: "#d4d7d6",
                    color: "#0e1112",
                }
                cursorMsgHtml = <div className="linter" style={cursorMsgStyle}><span>{editor.cursormsg}</span></div>
            }
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
            {cursorHtml}
            {cursorMsgHtml}
            <canvas ref={"wincanvas" + win.get("id")} id={"wincanvas" + win.get("id")} style={canvasStyle} width={canvasBaseWidth * (fontSize / 2) * editor.pixel_ratio} height={(canvasBaseHeight + 1) * fontSize * lineHeight * editor.pixel_ratio} />
            </div>
    }
}

export default Window
