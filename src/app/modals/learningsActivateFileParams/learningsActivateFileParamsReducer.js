import { constants } from './learningsActivateFileParamsActions';

const learningsActivateFileParamsReducer = (state = {
	isRequirePassing: false,
	passingPeriod: 2,
	date: null,
	fileUploaded: {
		isUpload: false,
		errors: '',
		collaboratorsCount: 0,
		learningsCount: 0
	}
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

		case constants.FILE_UPLOADED: {
			return {
				...state,
				fileUploaded: {
					isUpload: !state.fileUploaded.isUpload,
					...action.payload
				}
			}
		}

		case constants.RESET_FILE_UPLOADED: {
			return {
				...state,
				fileUploaded: {
					isUpload: false,
					errors: '',
					collaboratorsCount: 0,
					learningsCount: 0
				}
			}
		}

		default: return state;
	}
}

export default learningsActivateFileParamsReducer;