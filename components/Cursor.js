import React, { Component } from 'react'
import * as _ from 'lodash'

class Cursor extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { editor } = this.props

        var pos = editor.get('cursorPos')
        var fontSize = editor.get('fontSize')
        var lineHeight = editor.get('lineHeight')
        var fg = editor.get('fg')

        var style = {
            width: fontSize / 2,
            height: fontSize * lineHeight,
            position: "fixed",
            left: pos[1] * fontSize / 2,
            top: pos[0] * fontSize * lineHeight,
            backgroundColor: fg,
        }

        return (
            <div style={style}>
            </div>)
    }
}

export default Cursor
