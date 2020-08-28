import { constants } from './learningsReportParamsActions';

const learningsReportParamsReducer = (state = {
	coursesParams: {
		selectedCollaborators: 1,
		selectedItems: 1
	},
	assessmentsParams: {
		selectedCollaborators: 1,
		selectedItems: 1
	}
}, action) => {
	switch(action.type) {

		case constants.CHANGE_COURSES_COLLABORATORS: {
			return {
				...state,
				coursesParams: {
					...state.coursesParams,
					selectedCollaborators: action.payload
				}
			}
		}

		case constants.CHANGE_COURSES_ITEMS: {
			return {
				...state,
				coursesParams: {
					...state.coursesParams,
					selectedItems: action.payload
				}
			}
		}

		case constants.CHANGE_ASSESSMENTS_COLLABORATORS: {
			return {
				...state,
				assessmentsParams: {
					...state.assessmentsParams,
					selectedCollaborators: action.payload
				}
			}
		}

		case constants.CHANGE_ASSESSMENTS_ITEMS: {
			return {
				...state,
				assessmentsParams: {
					...state.assessmentsParams,
					selectedItems: action.payload
				}
			}
		}
		
		default: return state;
	}
}

export default learningsReportParamsReducer;