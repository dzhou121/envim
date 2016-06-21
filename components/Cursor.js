import React, { Component } from 'react'
import * as _ from 'lodash'

class Cursor extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { editor, left, top, padding } = this.props

        var pos = editor.get('cursorPos')
        var fontSize = editor.get('fontSize')
        var lineHeight = editor.get('lineHeight')
        var fg = editor.get('fg')

        var style = {
            width: fontSize / 2 - 0.5,
            height: fontSize * lineHeight,
            position: "absolute",
            left: left * fontSize / 2 + padding,
        }
        if (top != undefined) {
            style.top = top * fontSize * lineHeight
        }


        if (editor.get("mode") == "normal") {
            style.backgroundColor = "#ffffff"
            style.opacity = 0.5
        }

        if (editor.get("mode") == "insert") {
            console.log(editor.get("mode"))
            style.borderLeft = "1px solid #fdf6e3"
        }

        return (<div style={style}></div>)
    }
}

export default Cursor
