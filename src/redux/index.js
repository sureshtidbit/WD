import { combineReducers } from 'redux';
import SurveyReducer from './surveyReducer'
/*
Combine multiple redux reducers here
*/
const reducer = combineReducers({
	SurveyRedux: SurveyReducer,
});
export default reducer;