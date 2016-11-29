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
        return true
        return (nextProps.win != this.props.win) || (this.props.cursor != nextProps.cursor) || (this.props.popupmenu != nextProps.popupmenu) || (this.props.popupmenuShow != nextProps.popupmenuShow)
    }

    render() {
        const { display, win, bg, fg, editor, cursor, popupmenuShow, popupmenu } = this.props
        var lineHeight = 14 * 1.5
        var pos = [win.get("row"), win.get("col")]
        var left = 0
        if (pos[1] > 0) {
            var left = (pos[1] - 1 ) * 7
        }
        var style = {
            width: win.get("width") * 7,
            height: win.get("height") * lineHeight,
            position: "absolute",
            left: left,
            top: pos[0] * lineHeight,
            backgroundColor: bg,
            boxShadow: "inset -3px 0 0 rgba(0, 0, 0, 0.05)",
            color: fg,
        }
        if (!display) {
            style.display = "none"
        }

        if (left > 0) {
            style.borderLeft = "1px solid #000000"
            style.paddingLeft = 3
            style.paddingRight = 3
            padding = 3
        }

        var cursorHtml
        if (cursor) {
            var pos = win.get("cursorPos")
            cursorHtml = <Cursor key={"cursor"} padding={padding} left={pos[1]} top={pos[0]} editor={editor} mode={editor.mode} />
        }
        var popupmenuHtml
        if (popupmenuShow) {
            popupmenuHtml = <Popupmenu key={"popupmenu"} menu={popupmenu} />
        }

        //<canvas ref={"wincanvas" + win.get("id")} id={"wincanvas" + win.get("id")} width={win.get("width") * 7} height={(win.get("height") + 1) * 14 * 1.5} />
        return <div id={"windiv" + win.get("id")} style={style}>
            {popupmenuHtml}
            {cursorHtml}
            <canvas ref={"wincanvas" + win.get("id")} id={"wincanvas" + win.get("id")} />
            </div>
        var lines = win.get("lines")

        if (lines === undefined) {
            lines = []
        }

        var lineHeight = 14 * 1.5
        var padding = 0

        var pos = [win.get("row"), win.get("col")]
        var left = 0
        if (pos[1] > 0) {
            var left = (pos[1] - 1 ) * 7
        }

        var style = {
            width: win.get("width") * 7,
            height: win.get("height") * lineHeight,
            position: "absolute",
            left: left,
            top: pos[0] * lineHeight,
            backgroundColor: bg,
            boxShadow: "inset -3px 0 0 rgba(0, 0, 0, 0.05)",
            color: fg,
        }

        if (left > 0) {
            style.borderLeft = "1px solid #000000"
            style.paddingLeft = 6
            padding = 6
        }

        var popupmenuHtml
        if (popupmenuShow) {
            popupmenuHtml = <Popupmenu key={"popupmenu"} menu={popupmenu} />
        }
        var linesHtml = []
        var cursorHtml
        if (cursor) {
            var pos = win.get("cursorPos")
            cursorHtml = <Cursor key={"cursor"} padding={padding} left={pos[1]} top={pos[0]} editor={editor} mode={editor.mode} />
        }
        lines.map((line, i) => {
            if (line != undefined) {
                linesHtml.push(<Line key={line.get("uniqueId")} line={line.get("spans")} width={win.get("width")} i={i} lineObject={line} uniqueId={line.get("uniqueId")} row={i} />)
            }
        })
        var signHtml
        if (win.get("drawSign")) {
            signHtml = <Sign bg={bg} fg={fg} sign={win.get("signColumn")} height={win.get("height")} />
        }
        var statusLineHtml
        if (win.get("statusLine")) {
            statusLineHtml = <StatusLine spans={win.get("statusLine").spans} height={win.get("height")} width={win.get("width")} />
        }

        return <div style={style}>
            <canvas id={"wincanvas" + win.get("id")} width={win.get("width") * 7} height={win.get("height") * 14 * 1.5} />
            {cursorHtml}
            {popupmenuHtml}
            {signHtml}
            {statusLineHtml}
            <Number bg={bg} fg={fg} drawSign={win.get("drawSign")} numWidth={win.get("numWidth")} num={win.get("numColumn")} height={win.get("height")} />
            <div>{linesHtml}</div>
            </div>
    }
}

export default Window
