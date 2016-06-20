import React from 'react';
import ReactDOM from 'react-dom';
import Main from '../views/main.js';

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
