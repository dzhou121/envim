import React, { Component } from 'react'
import * as _ from 'lodash'
import Line from './Line'
import Cursor from './Cursor'

class Window extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.win != this.props.win) || (this.props.cursor)
    }

    render() {
        const { win, bg, fg, editor, cursor } = this.props
        var lines = win.get("lines")
        if (lines === undefined || lines.length == 0) {
            return <div></div>
        }

        var lineHeight = 14 * 1.5
        var padding = 0

        var pos = win.get("pos")
        var left = 0
        if (pos.get(1) > 0) {
            var left = (pos.get(1) - 1 ) * 7
        }

        var style = {
            width: win.get("width") * 7,
            height: win.get("height") * lineHeight,
            position: "fixed",
            left: left,
            top: win.get("pos").get(0) * lineHeight,
            backgroundColor: bg,
            boxShadow: "inset -3px 0 0 rgba(0, 0, 0, 0.05)",
            color: fg,
        }

        if (left > 0) {
            style.borderLeft = "1px solid #000000"
            style.paddingLeft = 6
            padding = 6
        }

        var linesHtml = []
        if (cursor) {
            var pos = editor.get("cursorPos")
            var winPos = win.get("pos")
            var left = pos[1] - winPos.get(1)
            var top = pos[0] - winPos.get(0)
            linesHtml.push(<Cursor key={"cursor"} padding={padding} left={left} top={top} editor={editor} />)
        }
        lines.map((line, i) => {
            linesHtml.push(<Line key={line.get("uniqueId")} line={line.get("spans")} width={win.get("width")} />)
        })

        return <div style={style}>{linesHtml}</div>
    }
}

export default Window
