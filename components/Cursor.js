import React, { Component } from 'react'
import * as _ from 'lodash'

class Cursor extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { editor, left, top, padding, mode } = this.props
        var { drawHeight, lineHeight, paddingTop, lengthShift } = this.props
        if (paddingTop == undefined) {
            paddingTop = 0
        }
        if (lengthShift == undefined) {
            lengthShift = 0
        }

        var fontSize = editor.fontSize
        if (lineHeight == undefined) {
            lineHeight = editor.lineHeight
        }
        if (drawHeight == undefined) {
            drawHeight = editor.drawHeight
        }
        var fg = editor.fg

        var style = {
            width: editor.drawWidth - 0.5,
            height: drawHeight - lengthShift,
            position: "absolute",
            left: left * fontSize / 2 - padding,
            zIndex: 1300,
        }
        if (top != undefined) {
            style.top = top * drawHeight + paddingTop + lengthShift / 2
        }


        if (mode == "normal") {
            style.backgroundColor = "#ffffff"
            style.opacity = 0.5
        }

        if (mode == "insert") {
            style.borderLeft = "1px solid #fdf6e3"
        }

        return (<div style={style}></div>)
    }
}

export default Cursor
