import { constants } from './learningsActivateParamsActions';

const learningsActivateParamsReducer = (state = {
	isRequirePassing: false,
	passingPeriod: 2,
	date: null
}, action) => {
	switch(action.type) {

		case constants.CHNAGE_REQUIRE_PASSING: {
			return {
				...state,
				isRequirePassing: action.payload
			}
		}

		case constants.CHANGE_SELECTED_PERIOD: {
			return {
				...state,
				passingPeriod: action.payload
			};
		}

		case constants.CHANGE_DATE_SETTINGS: {
			return {
				...state,
				data: action.payload
			};
		}

		default: return state;
	}
}

export default learningsActivateParamsReducer;