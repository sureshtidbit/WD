/*
Redux actions
*/
export const viewSurvey = SurveyID => (
    {
      type: 'SURVEY_ID',
      payload: SurveyID,
    }
  );
  export const clientID = client_id => (
    {
      type: 'CLIENT_ID',
      payload: client_id,
    }
  );
  export const surveyToken = survey_token => (
    {
      type: 'SURVEY_TOKEN',
      payload: survey_token,
    }
  );
  export const CongratulationFlag = flag => (
    {
      type: 'CONGRATULATION_FLAG',
      payload: flag,
    }
  );
  export const InternetStatus = flag => (
    {
      type: 'INTERNET',
      payload: flag,
    }
  );
  export const SavePendingSurvey = flag => (
    {
      type: 'PENDING',
      payload: flag,
    }
  );
  export const SurveyResponse = flag => (
    {
      type: 'SURVEY_RESPONSE',
      payload: flag,
    }
  );
  export const ReTake = flag => (
    {
      type: 'RETAKE',
      payload: flag,
    }
  );
  export const ReTakeAPIResponse = flag => (
    {
      type: 'RETAKEAPIRESPONSE',
      payload: flag,
    }
  );
  export const ActionUpdate = flag => (
    {
      type: 'ACTIONUPDATE',
      payload: flag,
    }
  );