import createRemoteActions from './utils/createRemoteActions';
import request from './utils/request';

export const constants = {
	...createRemoteActions([
		'FETCH_SUBORDINATES',
		'FETCH_USER'
	]),
	'LOADING': 'LOADING',
	'ERROR': 'ERROR',
	'INFO': 'INFO',
	'LOADING_LIST': 'LOADING_LIST',
	'SELECT_ITEM': 'SELECT_ITEM',
	'SET_SEARCH': 'SET_SEARCH',
	'FILE_UPLOADED': 'FILE_UPLOADED'
};

export function loading(isLoading){
	return {
		type: constants.LOADING,
		payload: isLoading
	}
};

export function loadingList(isLoading){
	return {
		type: constants.LOADING_LIST,
		payload: isLoading
	}
};

export function error(err){
	return {
		type: constants.ERROR,
		payload: err
	}
};

export function info(message){
	return {
		type: constants.INFO,
		payload: message
	}
}

function getUser(){
	return request('User')
		.get()
		.then(r => r.json());
};

function setSearch(s){
	return {
		type: constants.SET_SEARCH,
		payload: s
	}
}

export function selectItem(checked, item) {
	return {
		type: constants.SELECT_ITEM,
		payload: {
			checked,
			item
		}
	}
}

export function onFileUploaded(data) {
	return {
		type: constants.FILE_UPLOADED,
		payload: data
	}
}

export function getSubordinates(page, pageSize, search){
	return (dispatch, getState) => {

		const state = getState();
		if (!state.app.ui.initLoading) {
			dispatch(loading(true));
		}

		getUser().then(d => {
			if (d.type === 'error'){
				throw d;
			}

			dispatch({
				type: constants.FETCH_USER_SUCCESS,
				payload: d.data
			});

			if (d.data && d.data.position_parent_id) {
				dispatch(loadingList(true));

				const state = getState();
				const s = (search === undefined || search === null) ? state.app.meta.search : search;
				const p = page || state.app.meta.page;
				dispatch(setSearch(s));

				request('Subordinates')
				.get({
					search: s,
					sub_id: d.data.position_parent_id,
					page: p,
					page_size: pageSize || state.app.meta.pageSize
				})
				.then(r => r.json())
				.then(data => {
					if (data.type === 'error'){
						throw data;
					}
					dispatch({
						type: constants.FETCH_SUBORDINATES_SUCCESS,
						payload: {
							data: data.data,
							page: p
						}
					});
					dispatch(loading(false));
					dispatch(loadingList(false));
				})
				.catch(e => {
					dispatch(loading(false));
					dispatch(loadingList(false));
					console.error(e);
					dispatch(error(e.message));
				});
				} else {
					dispatch(info('У вас нет подчиненных'));
					dispatch(loading(false));
				}
		}).catch(e => {
			dispatch(loading(false));
			console.error(e);
			dispatch(error(e.message));
		});
	}
};
