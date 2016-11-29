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

        var menuHtml = []
        wildmenu.forEach((item, i) => {
            var preStyle = {
                lineHeight: 2,
            }
            var innerstyle = {
                backgroundColor: "#0e1112",
                color: "#cdd3de",
            }
            if (i == wildmenuMatch) {
                innerstyle.backgroundColor = "#519aba"
            }
            menuHtml.push(<pre style={preStyle}><span style={innerstyle}>{item}</span></pre>)
        })

        var chars = 70
        var width = 7 * chars
        var padding = 21
        var style = {
            zIndex: 100,
            position: "absolute",
            backgroundColor: "#0e1112",
            color: "#cdd3de",
            padding: padding,
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
        var top = parseInt(pos / chars) + 1
        var left = pos % chars
        return <div style={style}>
            <Cursor padding={padding} top={top} left={left} editor={editor} mode={"insert"} />
            <pre>{spansHtml}</pre>
            {menuHtml}
            </div>
    }
}
