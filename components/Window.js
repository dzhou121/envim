import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as _ from 'lodash'
import Line from './Line'

class Window extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.win != this.props.win
    }

    render() {
        console.log("-----------------------------")
        const { win, bg, fg } = this.props
        var lines = win.get("lines")
        if (lines === undefined || lines.length == 0) {
            return <div></div>
        }

        var lineHeight = 14 * 1.5

        var style = {
            width: win.get("width") * 7,
            height: win.get("height") * lineHeight,
            position: "fixed",
            left: win.get("pos").get(1) * 7,
            top: win.get("pos").get(0) * lineHeight,
            backgroundColor: bg,
            color: fg,
        }

        return (
            <div style={style}>
                {lines.map((line, i) => {
                    return (<Line key={line.get("uniqueId")} line={line.get("spans")} width={win.get("width")} />)
                })}
            </div>)
    }
}

export default Window
