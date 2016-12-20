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
        const { menu, editor, floating, drawWidth, drawHeight } = this.props
        if (!menu.get("show")) {
            return <div></div>
        }
        var pos = menu.get("pos")
        var style = {
            position: "absolute",
            zIndex: 100,
            top: (pos[0] + 1) * drawHeight,
            left: (pos[1] + 1) * drawWidth - 4,
        }
        if (floating) {
            style.left = pos[1] * drawWidth - 2
        }
        var iconStyle = {
            backgroundColor: "#658d30",
            paddingLeft: 2,
            paddingRight: 2,
        }
        var innerstyle = {
            backgroundColor: "#0e1112",
            color: "#cdd3de",
            marginLeft: - drawWidth * 4 - 4,
            boxShadow: "0px 2px 10px 0px #000",
        }
        var menuHtml = []
        menu.get("items").slice(0,20).forEach((item, i) => {
            var iconText = item[1]
            var iconClass = "icon-b"
            if (!iconText) {
                iconText = "b"
            }
            if (iconText == "function") {
                iconClass = "icon-f"
                iconText = "f"
            } else if (iconText == "func") {
                iconClass = "icon-f"
                iconText = "f"
            } else if (iconText == "var") {
                iconClass = "icon-v"
                iconText = "v"
            } else if (iconText == "statement") {
                iconClass = "icon-v"
                iconText = "v"
            } else if (iconText == "instance") {
                iconClass = "icon-v"
                iconText = "v"
            } else if (iconText == "param") {
                iconClass = "icon-v"
                iconText = "v"
            } else if (iconText == "instance") {
                iconClass = "icon-v"
                iconText = "v"
            } else if (iconText == "import") {
                iconClass = "icon-v"
                iconText = "v"
            } else if (iconText == "const") {
                iconClass = "icon-v"
                iconText = "c"
            } else if (iconText == "type") {
                iconClass = "icon-t"
                iconText = "t"
            } else if (iconText == "class") {
                iconClass = "icon-t"
                iconText = "c"
            } else if (iconText == "module") {
                iconClass = "icon-p"
                iconText = "m"
            } else if (iconText == "keyword") {
                iconClass = "icon-p"
                iconText = "k"
            } else if (iconText == "package") {
                iconClass = "icon-p"
                iconText = "p"
            }
            iconClass = "icon " + iconClass
            iconText = " " + iconText + " "
            var preStyle = {
            }
            if (i == menu.get("selected")) {
                preStyle.backgroundColor = "#519aba"
            }
            menuHtml.push(<pre style={preStyle} key={i}><span className={iconClass}>{iconText}</span><span> {item[0]} </span></pre>)
        })
        return <div className={"popupmenu"} style={style}><div style={innerstyle}>{menuHtml}</div></div>
    }
}

export default Popupmenu
