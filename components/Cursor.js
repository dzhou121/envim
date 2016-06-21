import React, { Component } from 'react'
import * as _ from 'lodash'

class Cursor extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        console.log("cursor render")
        const { editor, left, top, padding } = this.props

        var pos = editor.get('cursorPos')
        var fontSize = editor.get('fontSize')
        var lineHeight = editor.get('lineHeight')
        var fg = editor.get('fg')

        var style = {
            width: fontSize / 2,
            height: fontSize * lineHeight,
            position: "absolute",
            left: left * fontSize / 2 + padding,
            backgroundColor: "#fdf6e3",
            opacity: 0.5,
        }
        if (top != undefined) {
            style.top = top * fontSize * lineHeight
        }
        console.log("cursor style", style)

        return (<div style={style}></div>)
    }
}

export default Cursor
