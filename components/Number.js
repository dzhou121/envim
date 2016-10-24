import React, { Component } from 'react'
import * as _ from 'lodash'


class Number extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.num != this.props.num) || (nextProps.drawSign != this.props.drawSign)
    }

    render() {
        const { drawSign, height, numWidth, num, bg } = this.props
        var left = 0
        if (drawSign) {
            left = 2 * 7
        }
        var style = {
            width: numWidth * 7,
            position: "absolute",
            left: left,
            paddingLeft: "inherit",
            backgroundColor: bg,
            zIndex: 100,
        }
        var spanStyle = {
            float: "none",
        }
        var numHtml = []
        for (var i = 0; i < height; i++) {
            var numText = ''
            var numColumn = num.get(i)
            if (numColumn != undefined) {
               numText = _.join(numColumn.num, '')
            }
            numHtml.push(<pre key={i}><span style={spanStyle}>{numText}</span></pre>)
        }
        return <div style={style}>{numHtml}</div>
    }
}

export default Number
