/*
Redux reducers
*/
const initialState = {
    survey_id: 0,
    client_id: 0,
    survey_token: "",
    congratesFlag: false,
    internetStatus: false,
    pendingSurvey: [],
    SurveyResponse: {},
    ReTake: -1,
    ReTakeAPIResponse: {},
    ActionUpdate: ''
};
const SurveyReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SURVEY_ID':
            return { ...state, survey_id: action.payload };
        case 'CLIENT_ID':
            return { ...state, client_id: action.payload };
        case 'SURVEY_TOKEN':
            return { ...state, survey_token: action.payload };
        case 'CONGRATULATION_FLAG':
            return { ...state, congratesFlag: action.payload };
        case 'INTERNET':
            return { ...state, internetStatus: action.payload };
        case 'PENDING':
            return { ...state, pendingSurvey: action.payload };
        case 'SURVEY_RESPONSE':
            return { ...state, SurveyResponse: action.payload };
        case 'RETAKE':
            return { ...state, ReTake: action.payload };
        case 'RETAKEAPIRESPONSE':
            return { ...state, ReTakeAPIResponse: action.payload };
        case 'ACTIONUPDATE':
            return { ...state, ActionUpdate: action.payload }; 
        default:
            return state;
    }
};

export default SurveyReducer;