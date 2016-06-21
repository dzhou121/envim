import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as _ from 'lodash'

export default class Span extends Component {
    constructor(props, context) {
        super(props, context)
        // this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        // if (nextProps.char != this.props.char) {
        //     if (this.props.char != undefined) {
        //         console.log(this.props.char.toJS())
        //     } else {
        //         console.log(this.props.char)
        //     }

        //     if (nextProps.char != undefined) {
        //         console.log(nextProps.char.toJS())
        //     } else {
        //         console.log(nextProps.char)
        //     }
        // }
        return nextProps.span != this.props.span
    }

    render() {
        const { span, last } = this.props
        if (span === undefined) {
            return <span>{""}</span>
        }
        console.log(span.toJS())
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
