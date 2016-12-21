import React, { Component } from 'react'
import * as _ from 'lodash'

export default class Char extends Component {
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
        return nextProps.char != this.props.char
    }

    render() {
        const { char } = this.props
        if (char === undefined) {
            return <span>{" "}</span>
        }
        var style = {}
        var highlight = {}
        if (char.get("highlight") != undefined) {
            highlight = char.get("highlight")
        }

        if (highlight.foreground != undefined) {
            style.color = highlight.foreground
        }
        if (highlight.foreground != undefined) {
            style.backgroundColor = highlight.background
        }
        return (<span style={style}>{char.get("char")}</span>)
    }
}
