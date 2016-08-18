import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import {Provider} from 'react-redux';
import Store from './reducers';

ReactDOM.render(
  <Provider store={Store}><App/></Provider>, document.getElementById('app'));
