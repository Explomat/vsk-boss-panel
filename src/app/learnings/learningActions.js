import createRemoteActions from '../../utils/createRemoteActions';
import request from '../../utils/request';
import { error, info } from '../../appActions';

export const constants = {
	...createRemoteActions([
		'FETCH_LEARNINGS',
		'POST_LEARNINGS'
	]),
	'LOADING_LEARNINGS': 'LOADING_LEARNINGS',
	'SELECT_LEARNING_ITEM': 'SELECT_LEARNING_ITEM',
	'RESET_SELECTED_LEARNINGS': 'RESET_SELECTED_LEARNINGS',
	'SET_LEARNINGS_SEARCH': 'SET_LEARNINGS_SEARCH',
	'ASSIGN_LEARNINGS': 'ASSIGN_LEARNINGS'
};

export function loadingLearnings(isLoading){
	return {
		type: constants.LOADING_LEARNINGS,
		payload: isLoading
	}
};

export function resetSelectedLearnings(){
	return {
		type: constants.RESET_SELECTED_LEARNINGS
	}
}

export function selectItem(checked, item) {
	return {
		type: constants.SELECT_LEARNING_ITEM,
		payload: {
			checked,
			item
		}
	}
}

function setSearch(s){
	return {
		type: constants.SET_LEARNINGS_SEARCH,
		payload: s
	}
}

function assigning(isAssigning){
	return {
		type: constants.ASSIGN_LEARNINGS,
		payload: isAssigning
	}
}

export function assignLearningsByFile(fileType, data) {
	return dispatch => {
		dispatch(assigning(true));
		const actionName = 'assessments' ? 'ActivateAssementsByFile' : 'ActivateCoursesByFile';

		request(actionName)
		.post(data)
		.then(r => r.json())
		.then(d => {
			if (d.type === 'error'){
				throw d;
			}

			dispatch({
				type: constants.POST_LEARNINGS_SUCCESS
			});
			dispatch(assigning(false));

			if (d.data) {
				dispatch(
					info(`
						Ошибки при назначении: ${d.data.errors ? d.data.errors : 'нет'} \n
						Количество сотрудников: ${d.data.collaboratorsCount} \n
						Количество назначенных курсов / тестов: ${d.data.learningsCount} \n
					`)
				);
			}
		})
		.catch(e => {
			dispatch(assigning(false));
			dispatch(error(e.message));
		});
	}
}

export function assignLearnings(learningType, isAll, is_require_settings_passing, selected_settings_passing_period, settings_date){
	return (dispatch, getState) => {
		dispatch(assigning(true));

		const state = getState();
		const sendObj = {
			is_all: isAll,
			learnings: state.learning.selectedLearnings,
			collaborators: [],
			is_require_settings_passing,
			selected_settings_passing_period,
			settings_date
		}

		if (!isAll){
			sendObj.collaborators = state.app.selectedSubordinates;
		}

		request(learningType)
		.post(sendObj)
		.then(r => r.json())
		.then(d => {
			if (d.type === 'error'){
				throw d;
			}
			dispatch({
				type: constants.POST_LEARNINGS_SUCCESS
			});
			dispatch(assigning(false));

			if (d.message !== ''){
				dispatch(info(d.message));
			} else {
				dispatch(info('Назначение выполнено'));
			}
		})
		.catch(e => {
			dispatch(assigning(false));
			dispatch(error(e.message));
		});
	}
}

export function getLearnings(type, page, pageSize, search){
	return (dispatch, getState) => {

		dispatch(loadingLearnings(true));
		const state = getState();
		const p = page || state.learning.meta.page;
		const s = (search === undefined || search === null) ? state.learning.meta.search : search;
		dispatch(setSearch(s));

		request(type)
		.get({
			search: s,
			page: p,
			page_size: pageSize || state.learning.meta.pageSize
		})
		.then(r => r.json())
		.then(d => {
			if (d.type === 'error'){
				throw d;
			}
			dispatch({
				type: constants.FETCH_LEARNINGS_SUCCESS,
				payload: {
					data: d.data,
					page: p
				}
			});
			dispatch(loadingLearnings(false));
		})
		.catch(e => {
			dispatch(loadingLearnings(false));
			console.error(e);
			dispatch(error(e.message));
		});
	}
};
