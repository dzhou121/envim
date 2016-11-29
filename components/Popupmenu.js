import React, { Component } from 'react'
import * as _ from 'lodash'


class Popupmenu extends Component {
    constructor(props, context) {
        super(props, context)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (nextProps.menu != this.props.menu)
    }

    render() {
        const { menu } = this.props
        console.log("popupmenuShow", menu.get("show"))
        if (!menu.get("show")) {
            return <div></div>
        }
        var pos = menu.get("pos")
        var style = {
            position: "absolute",
            zIndex: 100,
            top: (pos[0] + 1) * 14 * 1.5,
            left: (pos[1] + 1) * 7 - 4,
        }
        var iconStyle = {
            backgroundColor: "#658d30",
            paddingLeft: 2,
            paddingRight: 2,
        }
        var innerstyle = {
            backgroundColor: "#0e1112",
            color: "#cdd3de",
            marginLeft: - 7 * 4 - 4,
        }
        var iconText = " n "
        var menuHtml = []
        menu.get("items").forEach((item, i) => {
            var preStyle = {
            }
            if (i == menu.get("selected")) {
                preStyle.backgroundColor = "#519aba"
            }
            menuHtml.push(<pre style={preStyle} key={i}><span style={iconStyle}>{iconText}</span><span> {item[0]} </span><span>{item[2]}</span><span>{item[3]}</span></pre>)
        })
        return <div className={"popupmenu"} style={style}><div style={innerstyle}>{menuHtml}</div></div>
    }
}

export default Popupmenu
