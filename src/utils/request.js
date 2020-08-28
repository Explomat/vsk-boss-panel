export function pureUrl(){
	//return window.location.protocol + '//192.168.73.37';
	//return process.env.NODE_ENV === 'production' ?
	//		(window.location.protocol + '//e-learning.vsk.ru:' + window.location.port) : window.location.protocol + '//192.168.73.37';
	return 'https://e-learning.vsk.ru:444';
	//return (window.location.protocol + '//e-learning.vsk.ru:' + window.location.port);
}

export function createBaseUrl(action_name, params = {}){
	action_name = action_name || '';

	const baseUrl = pureUrl() + '/custom_web_template.html';

	window.routerId = process.env.NODE_ENV === 'production' ? '6789943271516957593' : '6727531844004172765'; //'6727531844004172765'; //'6789943271516957593' - prod // '6727531844004172765' - dev
	window.serverId = '6768355125845062473';
	const url = new URL(`${baseUrl}?object_id=${window.routerId}&server_id=${window.serverId}&action_name=${action_name}&r=${(new Date()).getTime()}`);
	Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
	return url.href;
}

const request = (action_name, urlParams = {}) => {
	const _url = createBaseUrl(action_name, urlParams);

	return {
		get: (params = {}, config) => {
			const url = new URL(_url);
			Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
			return fetch(url, {
				method: 'GET',
				//credentials: 'include',
				//mode: 'no-cors',
				//credentials: 'omit',
				...config
			});
		},
		post: (data, config) => {
			return fetch(_url, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				},
				//credentials: 'include',
				//mode: 'no-cors',
				//credentials: 'omit',
				...config
			});
		},
		delete: (data, config) => {
			return fetch(_url, {
				method: 'DELETE',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				},
				//credentials: 'include',
				//mode: 'no-cors',
				//credentials: 'same-origin',
				...config
			});
		},
	}
}

export default request;