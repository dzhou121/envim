import React, { Component } from 'react'
import * as _ from 'lodash'


class Sign extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.sign != this.props.sign)
    }

    render() {
        const { height, sign, bg } = this.props
        var style = {
            position: "absolute",
            backgroundColor: bg,
            zIndex: 200,
        }
        var signHtml = []
        for (var i = 0; i < height; i++) {
            var signText = '  '
            var signColumn = sign.get(i)
            if (signColumn != undefined) {
               signText = _.join(signColumn.sign, '')
            }
            signHtml.push(<pre key={i}><span>{signText}</span></pre>)
        }
        return <div style={style}>{signHtml}</div>
    }
}

export default Sign
