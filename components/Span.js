import React, { Component } from 'react'
import * as _ from 'lodash'

export default class Span extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.span != this.props.span) || (nextProps.last != this.props.last)
    }

    render() {
        const { span, last, col } = this.props
        // console.log("render span", span.toJS())
        if (span === undefined) {
            return <span>{""}</span>
        }
        // console.log(span.toJS())
        var style = {
            position: "absolute",
            left: col * 7,
        }
        var highlight = {}
        if (span.get("highlight") != undefined) {
            highlight = span.get("highlight")
        }

        if (highlight.background != undefined) {
            style.backgroundColor = highlight.background
        }

        if (highlight.foreground != undefined) {
            style.color = highlight.foreground
        }
        // if (last) {
        //     style.float = "none"
        // }
        // if (pos != undefined) {
        //     style.position = "absolute"
        //     style.left = pos * 7
        //     style.float = "none"
        // }
        var text = span.get("text")
        // var charsHtml = []
        // text.split('').forEach((char, i) => {
        //     var charStyle = {
        //         position: "absolute",
        //         left: i * 7,
        //     }
        //     charsHtml.push(<span style={charStyle} key={i}>{char}</span>)
        // })
        return (<span style={style}>{text}</span>)
        // return (<span style={style}>{charsHtml}</span>)
    }
}
