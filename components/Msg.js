import React, { Component } from 'react'
import * as _ from 'lodash'


class Msg extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.msg != this.props.msg)
    }

    render() {
        const { msg } = this.props
        var style = {
            width: 300,
            zIndex: 1000,
            // position: "absolute",
            // right: 0,
            // top: 0,
            color: "#fff",
            backgroundColor: "#337ab7",
            padding: 21,
            boxShadow: "0 6px 12px rgba(0,0,0,.175)",
        }
        return <div style={style}><span>{msg}</span></div>
    }
}

export default Msg
