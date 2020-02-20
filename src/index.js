import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
//import { HashRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import configureStore from './store';
import './index.css';
import 'antd/dist/antd.css';


const store = configureStore({
	wt: {
		routerId: window.routerId,
		serverId: window.serverId
	}
});

const render = () => (
	<Provider store={store}>
		<App />
	</Provider>
);

ReactDOM.render(render(), document.getElementById('root'));

