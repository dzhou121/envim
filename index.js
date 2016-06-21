import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './containers/App'
import { getInitEditor } from './actions'
import configureStore from './store/configureStore'

const store = configureStore()
store.dispatch(getInitEditor())
store.dispatch(getInitEditor())

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('envim-editor')
)
