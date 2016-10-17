import React, { Component } from 'react'
import * as _ from 'lodash'
import Char from './Char'
import Span from './Span'

export default class Line extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.lineObject != this.props.lineObject) {
         console.log("line update", this.props.i)
        }
        return nextProps.lineObject != this.props.lineObject
    }

    render() {
        const { line, width } = this.props
        if (line === undefined) {
            return <pre key={i}></pre>
        }

        var spans = []
        var lastIndex = 0
        for (var i = line.size -1; i >= 0; i--) {
            var span = line.get(i)
            if (span != undefined) {
                lastIndex = i
                break
            }
        }

        line.forEach((span, i) => {
            if (span != undefined) {
                var last = false
                if (i == lastIndex) {
                    last = true
                }
                spans.push(<Span key={i} span={span} last={last} />)
            }
        })

        if (line.size == 1) {
            var span = line.get(0)
            if (span.get("text") === undefined) {
                span = span.set("text", "")
            }
            if (span.get("text").length < width) {
                spans = []
                spans.push(<Span key={0} span={span} last={false} />)
                span = span.set("text", " ")
                span = span.set("highlight", {})
                spans.push(<Span key={1} span={span} last={true} />)
            }
        }

        // if (spans.length == 1) {
        //     if (spans[0].get("text").length < width) {
        //         spans.push(<Span />)
        //     }
        // }

        return (
            <pre>{spans}</pre>
        )

        var spans = []
        line.forEach((char, i) => {
            if (spans.length == 0) {
                if (char === undefined) {
                    spans[0] = {highlight: {}, text: " "}
                } else {
                    spans[0] = {highlight: char.get("highlight"), text: char.get("char")}
                }
            }  else {
                var span = spans[spans.length - 1]
                var spanHighlight = span.highlight
                var currentHighlight = {}
                var charContent = " "
                if (char != undefined) {
                    currentHighlight = char.get("highlight")
                    charContent = char.get("char")
                }
                if (currentHighlight.foreground != spanHighlight.foreground || currentHighlight.background != spanHighlight.background) {
                    var newSpan = {highlight: currentHighlight, text: charContent}
                    spans.push(newSpan)
                } else {
                    span.text = span.text + charContent
                }
            }
        })

        return (
            <pre>{spans.map((span, i) => {
                var style = {}
                if (i == spans.length - 1) {
                    style.float = "none";
                }
                var highlight = span.highlight
                if (highlight.foreground != undefined) {
                    style.color = highlight.foreground
                }
                if (highlight.background != undefined) {
                    style.backgroundColor = highlight.background
                }
                return <span key={i} style={style}>{span.text}</span>
            })}</pre>
        )


        return (
            <pre>{line.map((char, i) => {
                return <Char key={i} char={char} />
            })}</pre>
        )
        // var a = []
        // for (var j = 0; j < width; j++) {
        //     if (line.get(j) === undefined) {
        //         a.push({char: " ", highlight: {}})
        //         // a.push(" ")
        //     } else {
        //         a.push({char: line.get(j).get("char"), highlight: line.get(j).get("highlight")})
        //     }
        // }
        var lineObject = _.map(a, function(char, i) {
            var style = {}
            var highlight = {}
            if (char.highlight != undefined) {
                highlight = char.highlight
            }

            if (highlight.foreground != undefined) {
                style.color = highlight.foreground
            }
            if (highlight.foreground != undefined) {
                style.backgroundColor = highlight.background
            }
            return (<span style={style} key={i}>{char.char}</span>)
        })
        return <pre>{lineObject}</pre>
        // return <pre>{_.join(a, '')}</pre>
    }
}
