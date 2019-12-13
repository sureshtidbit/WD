import React from 'react';
import { AsyncStorage, StatusBar, ActivityIndicator, View } from 'react-native'
import {
    Container,
    Content,
    List,
    ListItem,
    Text,
    Header,
    Left,
    Button,
    Right,
    Title,
    Icon,
    Body,
} from 'native-base';
import {
    withNavigation
} from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { viewSurvey, surveyToken, clientID, ReTake } from '../redux/surveyAction'
import { API } from '../auth/index'
import RNFetchBlob from 'react-native-fetch-blob'

/*
Display Patient pending surveys here and also can attempt any survey from here
*/

class pendingSurveyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PendingSurvey: [],
            Loader: false
        }
    }

    componentDidMount() {
        this.setState({ Loader: true })
        this.PendingSurvey();
    }

    /*
    Take survey actions
    */
    TakePendingSurvey(id, survey_token) {
        this.props.viewSurvey(id)
        this.props.surveyToken(survey_token)
        this.props.ReTake(0)
        this.props.navigation.navigate('FormSurvey');
    }

    /*
    Fetch all patient surveys
    */
    PendingSurvey() {
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token5 = 'Bearer ' + value
            this.setState({ token: token5 })
            let url = API + 'surveys?clientId=' + this.props.SurveyRedux.client_id
            RNFetchBlob.config({
                trusty: true
            }).fetch('GET', url, {
                'Authorization': token5,
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
                .then((response) => response.json())
                .then((responseData) => {
                    if (responseData.status == 'ok') {
                        AsyncStorage.getItem('SurveyPatientInfo').then((value) => {
                            var info = JSON.parse(value)
                            this.props.clientID(info.id)
                        })
                        this.setState({ PendingSurvey: responseData.result })
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

    render() {
        let pendingSurveys = null;
        if (this.state.PendingSurvey.length > 0) {
            pendingSurveys = this.state.PendingSurvey.map((item, index) => {
                return (<ListItem key={index} onPress={() => this.TakePendingSurvey(item.id, item.survey_token)}>
                    <Left>
                        <Text>{item.survey_name}</Text>
                    </Left>
                    <Right>
                        <Icon name="arrow-forward" />
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
                        <Title style={{ color: '#fff' }}>Pending Surveys</Title>
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
                        {pendingSurveys}
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
        viewSurvey,
        clientID,
        surveyToken,
        ReTake
    }, dispatch)
);

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(pendingSurveyList))