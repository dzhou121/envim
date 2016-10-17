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
        const { span, last } = this.props
        if (span === undefined) {
            return <span>{""}</span>
        }
        // console.log(span.toJS())
        var style = {}
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
        if (last) {
            style.float = "none"
        }
        return (<span style={style}>{span.get("text")}</span>)
    }
}
