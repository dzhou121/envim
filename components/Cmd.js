import React, { Component } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin';
import * as _ from 'lodash'
import Line from './Line'
import Cursor from './Cursor'

export default class Cmd extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true
    }

    render() {
        const { text, pos, editor } = this.props
        var style = {
            zIndex: 100,
            position: "fixed",
            backgroundColor: "#0e1112",
            color: "#cdd3de",
            padding: 16,
        }
        return <div style={style}>
            <Cursor padding={16} left={pos} editor={editor} mode={"insert"} />
            <pre><span>{text}</span></pre>
            </div>
    }
}
