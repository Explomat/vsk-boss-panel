import { combineReducers } from 'redux';
import appReducer from './appReducer';
import learningReducer from './app/learnings/learningReducer';

//import appReducer from './assessment/reducer';

const reducer = combineReducers({
	app: appReducer,
	learning: learningReducer,
	wt: (state = {}) => state
});

export default reducer;
