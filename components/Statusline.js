import React, { Component } from 'react'
import * as _ from 'lodash'
import Span from './Span'

export default class StatusLine extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.spans != this.props.spans
    }

    render() {
        const { spans, height, width } = this.props
        if (spans === undefined) {
            return <pre></pre>
        }

        var spansHtml = []
        var lastIndex = 0
        for (var i = spans.size -1; i >= 0; i--) {
            var span = spans.get(i)
            if (span != undefined) {
                lastIndex = i
                break
            }
        }

        spans.map((span, i) => {
            if (span != undefined) {
                var last = false
                if (i == lastIndex) {
                    last = true
                }
                spansHtml.push(<Span key={i} span={span} last={last} />)
            }
        })

        var style = {
            width: width * 7,
            position: "absolute",
            top: height * 14 * 1.5,
        }

        return (
            <div style={style}><pre>{spansHtml}</pre></div>
        )
    }
}
