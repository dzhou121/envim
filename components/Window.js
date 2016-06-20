import React, { Component } from 'react'
import * as _ from 'lodash'

class Window extends Component {
    constructor(props, context) {
        super(props, context)
    }

    render() {
        const { win, bg, fg } = this.props
        if (win.lines === undefined || win.lines.length == 0) {
            return <div></div>
        }

        var lineHeight = 14 * 1.5

        var style = {
            width: (win.width * 7).toString().concat("px"),
            height: (win.height * lineHeight).toString().concat("px"),
            position: "fixed",
            left: win.pos[1] * 7,
            top: win.pos[0] * lineHeight,
            backgroundColor: bg,
            color: fg,
        }

        return (
            <div style={style}>
                {win.lines.map((line, i) => {
                    if (line === undefined) {
                        return <pre key={i}></pre>
                    }
                    var a = []
                    for (var j = 0; j < win.width; j++) {
                        if (line[j] === undefined) {
                            a.push(" ")
                        } else {
                            a.push(line[j])
                        }
                    }
                    return <pre key={i}>{_.join(a, '')}</pre>
                }
                    // <pre key={i}>{_.join(line, '')}</pre>
                )}
            </div>)
    }
}

export default Window
