import React, { Component } from 'react'
import * as _ from 'lodash'
import Line from './Line'
import Cursor from './Cursor'

export default class Cmd extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true
    }

    // componentDidMount(props) {
    // }

    // componentDidUpdate() {
    //     var { pos, text }  = this.props
    //     var cmd = document.getElementById("cmd")
    //     cmd.focus()
    //     cmd.value = text
    //     cmd.setSelectionRange(pos, pos)
    //     console.log("updated text", text)
    // }

    render() {
        const { editor, wildmenu, wildmenuMatch } = this.props
        var { text, pos } = this.props
        if (text == "") {
            text = " "
        }

        var padding = 16
        var cmdmenuHtml
        var menuHtml = []
        wildmenu.forEach((item, i) => {
            var preStyle = {
                lineHeight: 2,
            }
            var innerstyle = {
                backgroundColor: "#15191b",
                color: "#cdd3de",
                paddingLeft: padding,
                paddingRight: padding,
            }
            if (i == wildmenuMatch) {
                innerstyle.backgroundColor = "#519aba"
            }
            menuHtml.push(<pre key={i} style={preStyle}><span style={innerstyle}>{item}</span></pre>)
        })

        if (menuHtml.length > 0) {
            var cmdmenuStyle = {
                paddingBottom: padding / 2,
            }
            cmdmenuHtml = <div style={cmdmenuStyle} className="cmdmenu">{menuHtml}</div>
        }

        var chars = 70
        var width = 7 * chars + padding * 2
        var style = {
            zIndex: 1000,
            position: "absolute",
            backgroundColor: "#15191b",
            border: "1px solid #000",
            borderTop: "none",
            // backgroundColor: "#252526",
            color: "#cdd3de",
            boxShadow: "0px 2px 8px #000",
            width: width,
            left: (editor.width * 7 - width) / 2,
        }
        // if (text.length > chars) {
        //     var offset = 0
        //     if (pos > chars) {
        //        offset = pos - chars 
        //     }
        //     pos = pos - offset
        //     text = text.slice(offset, text.length)
        //     if (text.length > chars) {
        //         text = text.slice(0, chars)
        //     }
        // }
        var spanStyle = {
            float: "none",
        }
        var spansHtml = []
        var trunks = text.match(new RegExp('.{1,' + chars + '}', 'g'));
        trunks.forEach((trunk, i) => {
            spansHtml.push(<span key={i} style={spanStyle}>{trunk}</span>)
        })
        var top = parseInt(pos / chars)
        var left = pos % chars
        var cmdlineStyle = {
            padding: padding / 2,
        }
        var cmdlineInnerStyle = {
            backgroundColor: "#252526",
            // backgroundColor: "#3c3c3c",
            paddingLeft: padding / 2,
            paddingRight: padding / 2,
            lineHeight: 2,
        }
        return <div className="cmd" style={style}>
            <Cursor lengthShift={10} padding={-padding} top={top} left={left} editor={editor} mode={"insert"} drawHeight={2 * editor.fontSize} paddingTop={padding / 2} />
            <div style={cmdlineStyle} className="cmdline">
                <pre style={cmdlineInnerStyle}>{spansHtml}</pre>
            </div>
            {cmdmenuHtml}
            </div>
    }
}
