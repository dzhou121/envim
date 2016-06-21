var React = require('react');
var ReactDOM = require('react-dom');
var cp = require('child_process');
var attach = require('neovim-client');
var _ = require('lodash');

var Content = [[]];
var Section = {};

function DecToHex(n) {
    var padding = 6;
    var hex = n.toString(16);
    while (hex.length < padding) {
        hex = "0" + hex;
    }
    return hex;
}
var canvas = document.getElementById("envim-canvas");
var ctx = canvas.getContext("2d");
ctx.font = "14px Inconsolata for Powerline";
ctx.lineWidth = 1;
var width = 7;
var r = 0;
var c = 0;
var minC = 0;
var maxC = 0;
var line = [];
var vsplit = [];
var bg = "";
var fg = "";
var lastfg = "";
var lastChar = "";
var nvim_proc = cp.spawn('nvim', ['--embed'], {});
attach(nvim_proc.stdin, nvim_proc.stdout, function (err, nvim) {
    nvim.on('notification', function (method, args) {
        // console.log(method);
        // console.log(args);
        for (i = 0; i < args.length; i++) {
            var arg = args[i];
            var e = arg[0];
            // console.log(e);
            switch (e) {
                case "put":
                    ctx.fillStyle = bg;
                    ctx.fillRect(c * width, r * height, arg.length * width, height);
                    ctx.fillStyle = fg;
                    _.map(arg.slice(1), function (e, i) {
                        if (e[0] == "|") {
                            vsplit.push([r, c + i]);
                        }
                    });
                    var text = _.join(_.map(arg.slice(1), function (e) {
                        lastfg = fg;
                        if (e[0] == "|") {
                            lastChar = " ";
                            return " ";
                        } else {
                            lastChar = e[0];
                            return e[0];
                        }
                    }), '');
                    ctx.fillText(text, c * width, (r + 1) * height - 3);
                    c = c + arg.length - 1;
                    // for (j = 1; j < arg.length; j++) {
                    //     var a = arg[j][0];

                    //     if (c > 0 && typeof(Content[r][c - 1]) == 'undefined') {
                    //         for (var k = Content[r].length; k < c; k++) {
                    //             Content[r][k] = " ";
                    //         }
                    //     }
                    //     Content[r][c] = a;
                    //     if (a == "|") {
                    //         vsplit.push([r, c]);
                    //     }

                    //     if (c > 0 && typeof(line[c - 1]) == 'undefined') {
                    //         for (var l = line.length; l < c; l++) {
                    //             line[l] = " ";
                    //         }
                    //     }
                    //     line[c] = a;

                    //     if (c > maxC) {
                    //         maxC = c;
                    //     }
                    //     c = c + 1;
                    // }
                    break;
                case "cursor_goto":
                    // console.log(arg[1][0], arg[1][1]);
                    var pos = arg[1];
                    // if (pos[0] == r && c != pos[1]) {
                    //     ctx.fillStyle(bg);
                    //     ctx.fillRect(c * width, r * height, (pos[1] - c) * width, height);
                    // }

                    c = pos[1];
                    if (pos[0] != r) {
                        var key = minC.toString().concat(maxC.toString());
                        if (typeof Section[key] == 'undefined') {
                            Section[key] = [];
                        } else {
                            Section[key].push(line);
                        }
                        line = [];
                        minC = c;
                        maxC = c;
                    } else {
                        if (minC > c) {
                            minC = c;
                        }
                        if (maxC < c) {
                            maxC = c;
                        }
                    }
                    r = pos[0];
                    if (typeof Content[r] == 'undefined') {
                        Content[r] = [];
                    }
                    break;
                case "update_fg":
                    fg = "#".concat(DecToHex(arg[1][0]));
                    console.log(arg, fg);
                    break;
                case "update_bg":
                    bg = "#".concat(DecToHex(arg[1][0]));
                    console.log(arg, bg);
                    break;
                default:
                    // if (e == "resize") {
                    console.log(arg);
                    // }
                    break;
            }
            // for (j = 1; j < arg.length; j++) {
            //     console.log(arg[j]);
            // }
        }
        // console.log(Section);
        vsplit.sort(function (a, b) {
            if (a[1] == b[1]) {
                return a[0] - b[0];
            } else {
                return a[1] - b[1];
            }
        });
        // console.log(vsplit);

        var last = [];
        for (var i = 0; i < vsplit.length; i++) {
            if (last.length === 0) {
                ctx.beginPath();
                ctx.moveTo(vsplit[i][1] * width + 3.5, vsplit[i][0] * height);
                last = vsplit[i];
            } else if (last[1] == vsplit[i][1] && last[0] + 1 == vsplit[i][0]) {
                last[0] = last[0] + 1;
            } else {
                ctx.lineTo(last[1] * width + 3.5, (last[0] + 1) * height);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(vsplit[i][1] * width + 3.5, vsplit[i][0] * height);
                last = vsplit[i];
            }
        }
        ctx.lineTo(last[1] * width + 3.5, (last[0] + 1) * height);
        ctx.stroke();
    });
    nvim.uiAttach(100, 30, true);
    nvim.getOption("fillchars", function (err, res) {
        console.log(err, res);
    });
    setTimeout(function () {
        nvim.input("<A-h>");
    }, 2000);
    setTimeout(function () {
        nvim.input("<A-v>");
    }, 3000);
});

var EnvimEditor = React.createClass({
    displayName: 'EnvimEditor',

    getInitialState: function () {
        return { value: 'T' };
    },
    handleChange: function () {
        // this.setState({value: this.refs.textarea.value});
        this.setState({ value: Content });
    },
    // rawMarkup: function() {
    //     var md = new Remarkable();
    //     return { __html: md.render(this.state.value) };
    // },
    render: function () {
        var lines = _.map(this.state.value, function (chars, i) {
            // chars = _.map(chars, function(c) {
            //     if (c === ' ') {
            //         return "\u00a0";
            //     } else {
            //         return c;
            //     }
            // });
            var line = _.join(chars, '');
            return React.createElement(
                'pre',
                { key: i },
                line
            );
        });
        return React.createElement(
            'div',
            { className: 'MarkdownEditor' },
            React.createElement(
                'h3',
                null,
                'Input'
            ),
            React.createElement('textarea', {
                onChange: this.handleChange,
                ref: 'textarea',
                defaultValue: this.state.value }),
            React.createElement(
                'h3',
                null,
                'Output'
            ),
            lines,
            React.createElement('div', {
                className: 'content'
            })
        );
    }
});

// ReactDOM.render(<EnvimEditor />, document.getElementById("envim-editor"));
