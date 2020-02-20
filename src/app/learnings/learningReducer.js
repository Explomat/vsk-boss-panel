import { constants } from './learningActions';

const learningReducer = (state = {
	learnings: [],
	selectedLearnings: [],
	meta: {
		search: '',
		total: 0,
		page: 1,
		pageSize: 10
	},
	ui: {
		isLoadingLearnings: false,
		isAssignLearnings: false
	}
}, action) => {
	switch(action.type) {

		case constants.FETCH_LEARNINGS_SUCCESS: {
			return {
				...state,
				learnings: action.payload.data.learnings,
				meta: {
					...state.meta,
					...action.payload.data.meta,
					page: action.payload.page
				}  
			}
		}

		case constants.SELECT_LEARNING_ITEM: {
			const { checked, item } = action.payload;

			const items = state.learnings.map(s => {
				if (s.id === item.id){
					return {
						...s,
						checked: checked
					}
				}
				return s;
			});

			if (checked){
				return {
					...state,
					learnings: items,
					selectedLearnings: state.selectedLearnings.concat(item)
				}
			} else {
				return {
					...state,
					learnings: items,
					selectedLearnings: state.selectedLearnings.filter(s => s.id !== item.id)
				}
			}
		}

		case constants.RESET_SELECTED_LEARNINGS: {
			return {
				...state,
				learnings: state.learnings.map(s => {
					return {
						...s,
						checked: false
					}
				}),
				selectedLearnings: []
			}
		}

		case constants.SET_LEARNINGS_SEARCH: {
			return {
				...state,
				meta: {
					...state.meta,
					search: action.payload
				}
			}
		}

		case constants.LOADING_LEARNINGS: {
			return {
				...state,
				ui: {
					...state.ui,
					isLoadingLearnings: action.payload
				}
			};
		}

		case constants.ASSIGN_LEARNINGS: {
			return {
				...state,
				ui: {
					...state.ui,
					isAssignLearnings: action.payload
				}
			};
		}

		default: return state;
	}
}

export default learningReducer;