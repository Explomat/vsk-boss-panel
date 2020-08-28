import { combineReducers } from 'redux';
import appReducer from './appReducer';
import learningReducer from './app/learnings/learningReducer';
import learningsActivateParamsReducer from './app/modals/learningsActivateParams/learningsActivateParamsReducer';
import learningsActivateFileParamsReducer from './app/modals/learningsActivateFileParams/learningsActivateFileParamsReducer';
import learningsReportParamsReducer from './app/modals/learningsReportParams/learningsReportParamsReducer';

const reducer = combineReducers({
	app: appReducer,
	learning: learningReducer,
	learningsActivateParams: learningsActivateParamsReducer,
	learningsActivateFileParams: learningsActivateFileParamsReducer,
	learningsReportParams: learningsReportParamsReducer,
	wt: (state = {}) => state
});

export default reducer;
