import React, { Component } from 'react'
import * as _ from 'lodash'

class Cursor extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { editor } = this.props

        var pos = editor.cursorPos

        var style = {
            width: editor.fontSize / 2,
            height: editor.fontSize * editor.lineHeight,
            position: "fixed",
            left: pos[1] * editor.fontSize / 2,
            top: pos[0] * editor.fontSize * editor.lineHeight,
            backgroundColor: editor.fg,
        }

        return (
            <div style={style}>
            </div>)
    }
}

export default Cursor
