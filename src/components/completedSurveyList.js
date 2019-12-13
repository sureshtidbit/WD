import React from 'react';
import { AsyncStorage, Text, TouchableOpacity, ActivityIndicator, StatusBar, View } from 'react-native'
import {
    Container,
    Content,
    List,
    ListItem,
    Header,
    Left,
    Button,
    Right,
    Title,
    Icon,
    Body
} from 'native-base';
import {
    withNavigation
} from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Toast from 'react-native-simple-toast';
import { ReTake, ReTakeAPIResponse } from '../redux/surveyAction'
import moment from 'moment'
import { API } from '../auth/index'
import RNFetchBlob from 'react-native-fetch-blob'

/*
Display Patient completed surveys here and also patient can retake any survey again from here
*/
class CompletedSurveyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            CompletedSurveysList: [],
            Progress: true,
            Loader: false
        }
    }

    componentDidMount() {
        this.setState({ Loader: true })
        this.CompletedSurvey();
    }

    /*
    Retake any survey method action
    */
    RetakeMethod(survey) {
        const details = {
            'survey_id': survey.id,
        };
        let formBody = [];
        for (let property in details) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        let url = API + 'add-participants?clientId=' + this.props.SurveyRedux.client_id
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token = 'Bearer ' + value
            RNFetchBlob.config({
                trusty: true
            }).fetch('POST', url, {
                'Authorization': token,
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            }, formBody)
                .then((response) => response.json())
                .then((responseData) => {
                    if (responseData.status == 'ok') {
                        Toast.show(responseData.message, Toast.SHORT);
                        this.props.ReTakeAPIResponse(responseData)
                        this.props.ReTake(1)
                        this.props.navigation.navigate('FormSurvey')
                    } else {
                        Toast.show(responseData.message, Toast.SHORT);
                    }
                })
        })
    }

    /*
    Display patient completed surveys
    */
    CompletedSurvey() {
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token = 'Bearer ' + value
            let url = API + 'completed-surveys?clientId=' + this.props.SurveyRedux.client_id
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Cache-Control': 'no-cache',
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((response) => response.json())
                .then((responseData) => {
                    if (responseData.status === 'ok') {
                        this.setState({ CompletedSurveysList: responseData.result.surveys })
                    } else {
                        if (responseData.status === 'failed') {
                            this.Logout()
                        }
                    }
                    this.setState({ Loader: false })
                }).catch(function (error) {
                    this.setState({ Loader: false })
                })
        })

    }

    Logout() {
        AsyncStorage.removeItem('SurveyAuthToken');
        AsyncStorage.removeItem('SurveyPatientInfo');
        this.props.navigation.navigate('Login')
    }

    GoBack() {
        this.props.navigation.navigate('Profile');
    }

    /*
    Convert time into minutes/hours/days/months/years
    */
    GetTimeOfSurvey(time) {
        const now = moment(time);
        const expiration = moment();
        const diff = expiration.diff(now);
        let SurveyTime = null
        const diffDuration = moment.duration(diff);
        if (diffDuration.asMinutes() < 60) {
            SurveyTime = Math.floor(diffDuration.asMinutes()) + ' minute(s) ago'
        } else if (diffDuration.asHours() < 24) {
            SurveyTime = Math.floor(diffDuration.asHours()) + ' hour(s) ago'
        } else if (diffDuration.asDays() < 30) {
            SurveyTime = Math.floor(diffDuration.asDays()) + ' day(s) ago'
        } else if (diffDuration.asMonths() < 12) {
            SurveyTime = Math.floor(diffDuration.asMonths()) + ' month(s) ago'
        } else if (diffDuration.asYears() >= 1) {
            SurveyTime = Math.floor(diffDuration.asYears()) + ' year(s) ago'
        }
        return SurveyTime;
    }
    render() {
        let completedSurveysView = null;
        if (this.state.CompletedSurveysList.length > 0) {
            completedSurveysView = this.state.CompletedSurveysList.map((item, index) => {
                return (<ListItem key={index}>
                    <Left>
                        <View style={{ flexDirection: 'column' }}>
                            <Text style={{ alignItems: 'center' }}>{item.survey_name}</Text>
                            <Text style={{ fontSize: 12, alignItems: 'center', color: '#BBB', paddingTop: 5 }}>{this.GetTimeOfSurvey(item.response_time)}</Text>
                        </View>
                    </Left>
                    <Right>
                        <TouchableOpacity onPress={() => this.RetakeMethod(item)} style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 5, paddingBottom: 5, backgroundColor: '#808080', borderRadius: 20 }}>
                            <Text style={{ color: '#FFF', fontSize: 14 }}>Retake</Text>
                        </TouchableOpacity>
                    </Right>
                </ListItem>)
            })
        }
        return (
            <Container>
                <Header style={{ backgroundColor: "#43CC53" }}>
                    <Left style={{ flex: 0.7 }}>
                        <Button onPress={() => this.GoBack()} transparent>
                            <Icon style={{ color: '#fff' }} name='arrow-back' />
                        </Button>
                    </Left>
                    <Body style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <Title style={{ color: '#fff' }}>Completed Surveys</Title>
                    </Body>
                    <Right style={{ flex: 0.7 }}>
                    </Right>
                </Header>
                <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
                <Content>
                    {this.state.Loader ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
                        <ActivityIndicator size='large' color="#00ff00" />
                    </View> : null}
                    <List>
                        {completedSurveysView}
                    </List>
                </Content>
            </Container>
        );
    }
}

/*
Redux store connection to this component
*/
const mapStateToProps = (state) => {
    return {
        SurveyRedux: state.SurveyRedux,
    };
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        ReTake,
        ReTakeAPIResponse
    }, dispatch)
);
export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(CompletedSurveyList));