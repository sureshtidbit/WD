import React from 'react';
import { StyleSheet, StatusBar,Text,AsyncStorage, View,ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';
import Header from '../../header/app_header';
import { connect } from 'react-redux';
import RNFetchBlob from 'react-native-fetch-blob'
import {API} from '../../../auth/index'
import { Fonts } from '../../../utils/fonts'

/*
Survey Complete screen
*/
class CompleteSurvey extends React.Component {
    constructor() {
        super();
        this.state ={
            loader: false
        }
        this.survey_id = ""
        this.survey_token = ""
        this.client_id = ""
        this.isComplete = 1
        this.UserSurveyResponse ={}
    }

    componentDidMount(){
        var id = this.props.SurveyRedux.survey_id
        this.survey_id = id
        this.survey_token = this.props.SurveyRedux.survey_token
        this.client_id = this.props.SurveyRedux.client_id
        this.UserSurveyResponse = this.props.SurveyRedux.SurveyResponse
        console.log('survey is', id, this.props.SurveyRedux.client_id,this.survey_token,this.props.SurveyRedux.SurveyResponse)
    }

    _GoToLogin() {
        this.setState({loader: true})
        this.submitChat1()
    }

    HeaderGoBack() {
        let app = this
        this.props.navigation.navigate('TakeSurvey')
    }

    Logout() {
        AsyncStorage.removeItem('SurveyAuthToken');
        AsyncStorage.removeItem('SurveyPatientInfo');
        this.props.navigation.navigate('Login')
    }

    /*
    Submit Survey response to backend API
    */
    submitChat1() {
        let app = this
        const details = {
            'token': this.survey_token,
            'client_id': this.client_id,
            'survey_id': this.survey_id,
            'survey_status': this.isComplete,
        };
        let formBody = [];
        for (let property in details) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody.push('response' + "=" + JSON.stringify(app.UserSurveyResponse));
        formBody = formBody.join("&");
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token = 'Bearer ' + value
            let url =API+'delete-survey?clientId='+app.client_id
                RNFetchBlob.config({
                    trusty: true
                }).fetch('POST', url, {
                    'Authorization': token,
                    'Cache-Control': 'no-cache',
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },formBody)
                    .then((response) => response.json())
                    .then((responseData) => {
                    console.log(responseData, 'response');
                    if (responseData.status == 'ok') {
                        this.setState({loader: false})
                        this.props.navigation.navigate('TakeSurvey')
                    } else {
                        this.setState({loader: false})
                        if (responseData.status == "failed") {
                            this.Logout();
                        } else {
                            Toast.show('Oops! Internal server error.', Toast.LONG);
                        }
                    }
                })
        })
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Header HeaderGoBack={() => this.HeaderGoBack()}></Header>
                <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
                <View style={styles.container}>
                    <Text style={[styles.customStyle,styles.TitleStyle]}>
                        Your response profile raises no concerns about mental illness and you therefore do not need to complete the survey as a whole.
                        </Text>
                        <Text style={[styles.customStyle,styles.TitleStyle]}>
                        If you feel that you are feeling mentally ill and that the survey failed to pay attention to this, please contact the treating staff at the reception for further assistance and support.
                    </Text>
                    <TouchableOpacity onPress={() => this._GoToLogin()} style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 15, marginBottom: 15, height: 50, backgroundColor: 'rgba(67,204,83,1)', borderColor: '#43CC53', borderWidth: 1, borderRadius: 5 }}>
              <TouchableOpacity onPress={() => this._GoToLogin()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {!this.state.loader ? <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFF' }}>Exit</Text> : <ActivityIndicator size="small" color="#00ff00" />}
              </TouchableOpacity>
            </TouchableOpacity>
                </View>
            </View>
        );
    }
}

/*
Redux store connection to this component
*/
const mapStateToProps = state => {
    return {
        SurveyRedux: state.SurveyRedux,
    };
};
export default withNavigation(connect(mapStateToProps)(CompleteSurvey))

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        marginTop: 30
    },
    TitleStyle: {
        color: '#000',
        paddingLeft: 30,
        paddingRight: 30,
    },
    loginStyle: {
        flexDirection: 'row',
        width: 250,
        height: Platform.OS === 'ios' ? 40 : 50,
        marginTop: 30,
        backgroundColor: '#0A58FF',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonCircle: {
        width: Platform.OS === 'ios' ? 35 : 40,
        height: Platform.OS === 'ios' ? 35 : 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    IconPositionStyle: {
        paddingLeft: Platform.OS === 'ios' ? 210 : 200
    },
    customStyle: {
        fontFamily: Fonts.Roboto,
        fontSize: 16
    },
});

