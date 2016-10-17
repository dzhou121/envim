import React, { Component } from 'react'
import * as _ from 'lodash'

class Cursor extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { editor, left, top, padding, mode } = this.props

        var fontSize = editor.fontSize
        var lineHeight = editor.lineHeight
        var fg = editor.fg

        var style = {
            width: fontSize / 2 - 0.5,
            height: fontSize * lineHeight,
            position: "absolute",
            left: left * fontSize / 2 + padding,
        }
        if (top != undefined) {
            style.top = top * fontSize * lineHeight
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
