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
        const { tab, editor } = this.props

        var tabHeight = editor.tabHeight

        var active = tab[0]
        var items = tab.splice(1, tab.length)
        var spans = []
        items.forEach((item, i) => {
            var className = "tab"
            var paddingTop = (tabHeight - 16 - 2) / 2
            var height = tabHeight - 2 - paddingTop
            if (active == item[0]) {
                className = className + " activetab"
                height = height + 2
            }
            var style = {
                paddingTop: paddingTop,
                height: height,
            }
            var txt = item[1]
            var tabText
            if (txt.startsWith("term://")) {
                tabText = txt
            } else {
                var tabs = item[1].split("/")
                tabText = tabs[tabs.length - 1]
            }
            spans.push(<li style={style} key={i} className={className}><span>{tabText}</span></li>)
        })

        var style = {
            height: tabHeight - 2,
        }
        return <div>
            <ul style={style} className={"tab-bar"}>
            {spans}
            </ul>
            </div>
    }
}

export default Tab
