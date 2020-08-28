export const constants = {
	'CHANGE_COURSES_COLLABORATORS': 'CHANGE_COURSES_COLLABORATORS',
	'CHANGE_COURSES_ITEMS': 'CHANGE_COURSES_ITEMS',
	'CHANGE_ASSESSMENTS_COLLABORATORS': 'CHANGE_ASSESSMENTS_COLLABORATORS',
	'CHANGE_ASSESSMENTS_ITEMS': 'CHANGE_ASSESSMENTS_ITEMS'
};

export function changeCoursesCollaborators(selectedCollaborators){
	return {
		type: constants.CHANGE_COURSES_COLLABORATORS,
		payload: selectedCollaborators
	}
};

export function changeCoursesItems(selectedItems){
	return {
		type: constants.CHANGE_COURSES_ITEMS,
		payload: selectedItems
	}
}

export function changeAssessmentsCollaborators(selectedCollaborators){
	return {
		type: constants.CHANGE_ASSESSMENTS_COLLABORATORS,
		payload: selectedCollaborators
	}
};

export function changeAssessmentsItems(selectedItems){
	return {
		type: constants.CHANGE_ASSESSMENTS_ITEMS,
		payload: selectedItems
	}
}

