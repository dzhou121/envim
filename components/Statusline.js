import React, { Component } from 'react'
import * as _ from 'lodash'

export default class StatusLine extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.text != this.props.text
    }

    render() {
        const { editor, text, width } = this.props

        var statusLineStyle = {
            height: editor.statusLineHeight - 2,
            width: width, 
        }

        var modes = {
            'n': ['normal', '#6699cc'],
            't': ['terminal', '#6699cc'],
            'i': ['insert', '#99c794'],
            'v': ['visual', '#fac863'],
        }

        var parts = text.split(",")
        var spans = []
        var ro = parts[8]
        var modified = parts[9]
        var ale = parts[10]

        var mode = parts[0]
        if (modes[mode]) {
            var mode = modes[mode]
            var style = {
                backgroundColor: mode[1],
                padding: "0px 6px 0px 6px",
            }
            var span = <span key={"mode"} style={style}>{mode[0]}</span>
            spans.push(span)
        }

        var branch = parts[1]
        if (branch) {
            var span = <span className={"git"} key={"branch"}>{branch}</span>
            spans.push(span)
        }

        var filename = parts[2]
        if (filename) {
            if (!filename.startsWith("term://")) {
                var items = filename.split("/")
                filename = items[items.length - 1]
            }
            var span = <span key={"filename"}>{filename} {modified} {ro}</span>
            spans.push(span)
        }

        var filetype = parts[3]
        if (filetype) {
            var span = <span className={"right"} key={"filetype"}>{filetype.slice(1, filetype.length - 1)}</span>
            spans.push(span)
        }

        var encode = parts[4]
        if (encode) {
            var span = <span className={"right"} key={"encode"}>{encode}</span>
            spans.push(span)
        }

        var line = parts[5]
        var col = parts[6]
        var per = parts[7]
        if (per || line || col) {
            var pos = ""
            if (line) {
                pos = "L: " + line
            }
            if (col) {
                pos = pos + " C: " + col
            }
            if (per) {
                pos = pos + " " + per + "%"
            }
            var span = <span className={"right"} key={"pos"}>{pos}</span>
            spans.push(span)
        }

        if (ale) {
            // console.log("ale is", ale)
            var style = {
            }
            var error = ""
            var warning = ""
            var ok = ""
            if (ale == "ok") {
                style.color = "#99c794"
                ok = "✓ ok"
            } else if (ale.indexOf(" ") > 0) {
                var items = ale.split(" ")
                error = items[0].slice(1)
                warning = items[1].slice(1)
            } else if (ale.startsWith("e")) {
                error = ale.slice(1)
            } else if (ale.startsWith("w")) {
                warning = ale.slice(1)
            }
            if (error) {
                var style = {
                    color: "#ec5f67",
                }
                error = <span style={style}>{"x " + error}</span>
            }
            if (warning) {
                var style = {
                    color: "#fac863",
                }
                warning = <span style={style}>{"! " + warning}</span>
            }
            var span = <span style={style} className={"right"} key={"ale"}>{error} {warning} {ok}</span>
            spans.push(span)
        }
        return <div style={statusLineStyle} className={"statusline"}>{spans}</div>

    }
}
