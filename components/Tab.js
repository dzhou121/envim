import React, { Component } from 'react'
import * as _ from 'lodash'
import Line from './Line'


class Tab extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.tab != this.props.tab)
    }

    render() {
        const { tab } = this.props

        var active = tab[0]
        var items = tab.splice(1, tab.length)
        var spans = []
        items.forEach((item, i) => {
            var className = "tab"
            if (active == item[0]) {
                className = className + " activetab"
            }
            var tabText = item[1].slice(0, 30)
            spans.push(<li key={i} className={className}>{tabText}</li>)
        })

        var style = {
        }
        return <div style={style}>
            <ul className={"tab-bar"}>
            {spans}
            </ul>
            </div>
    }
}

export default Tab
