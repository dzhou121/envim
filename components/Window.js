import React, { Component } from 'react'
import * as _ from 'lodash'
import Line from './Line'
import Cursor from './Cursor'
import Number from './Number'
import Sign from './Sign'
import Popupmenu from './Popupmenu'
import StatusLine from './Statusline'

class Window extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.win != this.props.win) || (this.props.cursor != nextProps.cursor) || (this.props.popupmenu != nextProps.popupmenu) || (this.props.popupmenuShow != nextProps.popupmenuShow)
    }

    render() {
        const { win, bg, fg, editor, cursor, popupmenuShow, popupmenu } = this.props
        var lines = win.get("lines")
        if (lines === undefined || lines.length == 0) {
            return <div></div>
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
            position: "fixed",
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
        if (cursor) {
            var pos = win.get("cursorPos")
            linesHtml.push(<Cursor key={"cursor"} padding={padding} left={pos[1]} top={pos[0]} editor={editor} mode={editor.mode} />)
        }
        lines.map((line, i) => {
            linesHtml.push(<Line key={line.get("uniqueId")} line={line.get("spans")} width={win.get("width")} i={i} lineObject={line} uniqueId={line.get("uniqueId")} />)
        })
        var signHtml
        if (win.get("drawSign")) {
            signHtml = <Sign sign={win.get("signColumn")} height={win.get("height")} />
        }
        var statusLineHtml
        if (win.get("statusLine")) {
            statusLineHtml = <StatusLine spans={win.get("statusLine").spans} height={win.get("height")} />
        }

        return <div style={style}>
            {popupmenuHtml}
            {signHtml}
            {statusLineHtml}
            <Number drawSign={win.get("drawSign")} numWidth={win.get("numWidth")} num={win.get("numColumn")} height={win.get("height")} />
            <div>{linesHtml}</div>
            </div>
    }
}

export default Window
