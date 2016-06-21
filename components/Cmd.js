import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as _ from 'lodash'
import Line from './Line'
import Cursor from './Cursor'

export default class Cmd extends Component {
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
        var width = 60
        var height = 2
        var top = 0
        var left = (editor.get("width") - width) / 2
        var style = {
            width: width * 7,
            // height: height * lineHeight,
            padding: 7,
            left: left * 7,
            top: top * lineHeight,
            position: "fixed",
            backgroundColor: bg,
            color: fg,
            // padding: 10,
            border: "1px solid rgba(255, 255, 255, 0.07)",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        }
        var display = false

        var cmd = []
        if (cursor) {
            var pos = editor.get("cursorPos")
            var winPos = win.get("pos")
            var left = pos[1] - winPos.get(1) + 1
            cmd.push(<Cursor key={"cursor"} left={left} editor={editor} />)
        }
        lines.map((line, i) => {
            if (line != undefined) {
                line.get("spans").forEach(span => {
                    if (span != undefined) {
                        span.get("text").split("").some(char => {
                            if (char != " ") {
                                display = true
                                return true
                            }
                        })
                    }
                })
                cmd.push(<Line key={line.get("uniqueId")} line={line.get("spans")} width={win.get("width")} />)
            }
        })

        if (!display) {
            style.display = "none"
        } else {
        }

        return <div style={style}><div>{cmd}</div></div>
    }
}
