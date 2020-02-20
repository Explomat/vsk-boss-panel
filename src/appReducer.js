import { constants } from './appActions';

const appReducer = (state = {
	subordinates: [],
	selectedSubordinates: [],
	user: {},
	meta: {
		search: '',
		total: 0,
		page: 1,
		pageSize: 10
	},
	ui: {
		initLoading: false,
		isLoading: false,
		isLoadingList: false,
		info: '',
		error: ''
	}
}, action) => {
	switch(action.type) {
		case constants.FETCH_USER_SUCCESS: {
			return {
				...state,
				user: action.payload,
				ui: {
					...state.ui,
					initLoading: true
				}
			}
		}

		case constants.FETCH_SUBORDINATES_SUCCESS: {

			const { payload } = action;
			let _subordinates = [ ...payload.data.subordinates ];

			if (state.selectedSubordinates.length > 0) {
				_subordinates.forEach(s => {
					for (let i = state.selectedSubordinates.length - 1; i >= 0; i--) {
						const item = state.selectedSubordinates[i];
						if (item.id === s.id) {
							s.checked = true;
						}
					}
				});
			}

			return {
				...state,
				subordinates: _subordinates,
				meta: {
					...state.meta,
					...action.payload.data.meta,
					page: action.payload.page
				}  
			}
		}

		case constants.SELECT_ITEM: {
			const { checked, item } = action.payload;

			const items = state.subordinates.map(s => {
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
					subordinates: items,
					selectedSubordinates: state.selectedSubordinates.concat(item)
				}
			} else {
				return {
					...state,
					subordinates: items,
					selectedSubordinates: state.selectedSubordinates.filter(s => s.id !== item.id)
				}
			}
		}

		case constants.SET_SEARCH: {
			return {
				...state,
				meta: {
					...state.meta,
					search: action.payload
				}
			}
		}

		case constants.LOADING_LIST: {
			return {
				...state,
				ui: {
					...state.ui,
					isLoadingList: action.payload
				}
			};
		}

		case constants.LOADING: {
			return {
				...state,
				ui: {
					...state.ui,
					isLoading: action.payload
				}
			};
		}

		case constants.ERROR: {
			return {
				...state,
				ui: {
					...state.ui,
					error: action.payload
				}
			}
		}

		case constants.INFO: {
			return {
				...state,
				ui: {
					...state.ui,
					info: action.payload
				}
			}
		}

		default: return state;
	}
}

export default appReducer;