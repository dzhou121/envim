import React, { Component } from 'react'

class DocMsg extends Component {
    constructor(props, context) {
        super(props, context)
    }

//     shouldComponentUpdate(nextProps, nextState) {
//         return (nextProps.editor.docmsg != this.props.editor.docmsg)
//     }

    render() {
        const { editor } = this.props
        const docmsg = editor.docmsg
        if (!docmsg) {
            return <div></div>
        }
        var docpos = editor.docpos
        if (!docpos) {
            return <div></div>
        }

        const win = editor.wins.get(editor.curWin)
        if (win == undefined) {
            return <div></div>
        }
        const pos = win.get("cursorPos")
        if (pos == undefined) {
            return <div></div>
        }
        const fontSize = editor.fontSize
        var lineHeight = editor.lineHeight
        var padding = 0
        if (win.get("floating")) {
            lineHeight = editor.floatingLineHeight
            padding = - ((editor.width - 100) * (fontSize / 2) / 2 + 1.5)
        }

        var style = {
            position: "absolute",
            left: (docpos[1] + win.get("col") - (docmsg.indexOf("(") - 5)) * (fontSize / 2) - padding,
            bottom: ((win.get("height") - docpos[0]) + win.get("row")) * fontSize * lineHeight,
            padding: "4px 6px 4px 6px",
            maxWidth: 400,
            backgroundColor: "#1f2326",
            color: editor.fg,
            border: "1px solid #000",
            zIndex: 1300,
        }

        var doccom = editor.doccom
        var funcParams = docmsg.slice(docmsg.indexOf("(") + 1, docmsg.indexOf(")"))
        if (funcParams == undefined) {
            return <div></div>
        }
        var currentParam = ""
        var docHtml = <span>({funcParams})</span>
        var paramHmtl = []
        if (funcParams.trim()) {
            funcParams.split(",").forEach((param, i) => {
                var className = ""
                if (i == doccom) {
                    className = "doc-current"
                }

                var comma = ""
                if (i > 0) {
                    comma = ", "
                }
                param = param.trim()
                paramHmtl.push(<span key={i}>{comma}<span className={className}>{param}</span></span>)
            })
            // currentParam = funcParams.split(",")[doccom]
            // if (currentParam != undefined) {
            //     currentParam = currentParam.trim()
            // }
        }
        if (currentParam) {
            var parts = funcParams.split(currentParam)
            // docHtml = <div><span>({parts[0]}</span><span className="doc-current">{currentParam}</span><span>{parts[1]})</span></div>

        }
        docHtml = <div>{docmsg.slice(0, docmsg.indexOf("(") - 5)}({paramHmtl}){docmsg.slice(docmsg.indexOf(")") + 1)}</div>
        // console.log("current param is", currentParam)
        // var msg = JSON.parse(docmsg)
        //
        // var comma = msg.comma
        // var contents = msg.contents
        // var funcMsg = contents[0].value
        // var funcParams = funcMsg.slice(funcMsg.indexOf("(") + 1, funcMsg.indexOf(")"))
        // var currentParam = ""
        // if (funcParams.trim()) {
        //     currentParam = (funcParams.split(",")[comma]).trim()
        // }
        // console.log("current param is", currentParam)
        return <div className="doc" style={style}>{docHtml}</div>
    }
}

export default DocMsg
