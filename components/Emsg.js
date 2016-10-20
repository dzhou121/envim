import React, { Component } from 'react'
import * as _ from 'lodash'


class Emsg extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.emsg != this.props.emsg)
    }

    render() {
        const { emsg } = this.props
        var style = {
            position: "absolute",
            right: 0,
            top: 0,
            color: "#a94442",
            backgroundColor: "#f2dede",
            padding: 21,
            boxShadow: "0 6px 12px rgba(0,0,0,.175)",
        }
        return <div style={style}><pre><span>{emsg}</span></pre></div>
    }
}

export default Emsg
