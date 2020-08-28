export const constants = {
	'CHNAGE_REQUIRE_PASSING': 'CHNAGE_REQUIRE_PASSING',
	'CHANGE_SELECTED_PERIOD': 'CHANGE_SELECTED_PERIOD',
	'CHANGE_DATE_SETTINGS': 'CHANGE_DATE_SETTINGS'
};

export function changeRequirePassing(isRequirePassing){
	return {
		type: constants.CHNAGE_REQUIRE_PASSING,
		payload: isRequirePassing
	}
};

export function changeSelectedPeriod(passingPeriod){
	return {
		type: constants.CHANGE_SELECTED_PERIOD,
		payload: passingPeriod
	}
}

export function changeDateSettings(date) {
	return {
		type: constants.CHANGE_DATE_SETTINGS,
		payload: date
	}
}
