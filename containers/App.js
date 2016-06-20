import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as EnvimActions from '../actions'
import Window from '../components/Window'
import Cursor from '../components/Cursor'

class App extends Component {
    constructor(props, context) {
        super(props, context)
    }
    render() {
        const { editor, actions } = this.props
        var wins = ""
        var windows = editor.windows
        if (windows !== undefined) {
            wins = windows.map((win, i) =>
                <Window key={i} win={win} bg={editor.bg} fg={editor.fg} {...actions} />
            )
            
        }
        return (
                <div>
                    {wins}
                    <Cursor editor={editor} />
                </div>
        )
    }
}

App.propTypes = {
  actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    editor: state.editor
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(EnvimActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
