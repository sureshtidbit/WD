import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image,
    AsyncStorage,
    Platform,
    TextInput,
    NetInfo,
    YellowBox,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    Modal
} from 'react-native';
import { Content, Left, Right, Icon, Text, List, ListItem, Header } from 'native-base';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {
    withNavigation
} from 'react-navigation';
import { Snackbar } from 'react-native-paper';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { viewSurvey, surveyToken, ReTake, clientID, SavePendingSurvey } from '../../../../redux/surveyAction'
import Toast from 'react-native-simple-toast';
import RNFetchBlob from 'react-native-fetch-blob'
import { API, GetAPI } from '../../../../auth/index'
import { Fonts } from '../../../../utils/fonts'
var track = 0

/*
Home Screen of the WD app, WHere display patient pending survey list.
*/
class HomeScreen extends Component {
    constructor() {
        super();
        YellowBox.ignoreWarnings(
            ['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
            ]);
        this.state = {
            checked: "3",
            PendingSurveyList: [],
            ModalVisibleStatus: false,
            IsOnline: false,
            IsOffline: false,
            selectedIndex: -1,
            SurveyStatus: -1,
            screenHeight: 0,
            SurveyName: '',
            SelectedLanguage: 0,
            LanguageModal: false
        }
    }

    /*
    Start the survey
    */
    StartSurvey() {
        if (this.state.PendingSurveyList.length <= 0) {
            Toast.show('There is no pending survey!', Toast.SHORT);
            return 0;
        }
        if (this.state.selectedIndex == -1) {
            Toast.show('Please select a survey', Toast.SHORT);
            return 0;
        }
        if (this.state.checked === '3') {
            this.props.navigation.navigate('FormSurvey');
        }
    }

    Logout() {
        AsyncStorage.removeItem('SurveyAuthToken');
        AsyncStorage.removeItem('SurveyPatientInfo');
        this.props.navigation.navigate('Login')
    }

    /*
    Display pending surveys
    */
    PendingSurvey() {
        track = 0
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token5 = 'Bearer ' + value
            let url = API + 'surveys?clientId=' + this.props.SurveyRedux.client_id
            this.setState({ token: token5 })
            RNFetchBlob.config({
                trusty: true
            }).fetch('GET', url, {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
                .then((response) => response.json())
                .then((responseData) => {
                    AsyncStorage.getItem('SurveyPatientInfo').then((value) => {
                        var info = JSON.parse(value)
                        this.props.clientID(info.id)
                    })
                    console.log("Pending Survey data===>", responseData)
                    if (responseData.status == 'ok') {
                        if (responseData.result !== undefined && responseData.result != null) {
                            if (responseData.result.length > 0) {
                                let PendingSurveyList = []
                                responseData.result.map((v, i) => {
                                    let pending = { idx: '' }
                                    pending = v
                                    pending.idx = i
                                    PendingSurveyList.push(pending)
                                })
                                this.setState({ PendingSurveyList: PendingSurveyList })
                            }
                            this.props.SavePendingSurvey(responseData.result)
                            if (responseData.result.length == 0) {
                                this.setState({ SurveyStatus: 1 })
                            } else {
                                this.setState({ SurveyStatus: 0 })
                            }
                        } else {
                            this.setState({ SurveyStatus: 1 })
                            this.setState({ PendingSurveyList: [] })
                        }
                    } else {
                        if (responseData.status === 'failed') {
                            this.Logout()
                        }
                    }
                })
        })
    }

    /*
    Submit save survey when internet is available
    */
    submitChat(formBody) {
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token = 'Bearer ' + value
            let url = API + 'submit-response?clientId=' + this.props.SurveyRedux.client_id
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
                    console.log(responseData, 'response==');
                    AsyncStorage.removeItem('PatientOffSurvey');
                    if (responseData.status == 'ok') {
                        Toast.show('This survey has been submitted successfully!', Toast.LONG);
                    } else {
                        Toast.show('Please fill all question of the survey!', Toast.LONG);
                    }
                })
        })
    }

    /*
    Check whether save survey exist or not
    */
    SendStoreDataToBackedAPI() {
        AsyncStorage.getItem('PatientOffSurvey').then((value) => {
            if (value !== undefined && value !== null) {
                this.submitChat(value)
            }
        })
    }

    APIMethods() {
        track = 0
        this.setState({ PendingSurveyList: [] });
        this.setState({ SurveyStatus: -1 })
        this.SendStoreDataToBackedAPI()
        this.PendingSurvey();
    }
    
    /*
    Check language
    */
    CheckLanguageCode() {
        AsyncStorage.getItem('WDLanguageCode').then((value) => {
            if (value !== undefined && value !== null) {
                var Codes = ["en-US", "sv-SE"];
                var n = Codes.includes(value);
                if (n) {
                    this.setState({ LanguageModal: false })
                } else {
                    this.setState({ LanguageModal: true })
                }
            } else {
                this.setState({ LanguageModal: true })
            }
        })
    }

    SetLanguageCode() {
        let SelectedLanguage = this.state.SelectedLanguage
        let code = ''
        if (SelectedLanguage == 1) {
            code = 'en-US'
        } else {
            if (SelectedLanguage == 2) {
                code = 'sv-SE'
            }
        }
        AsyncStorage.setItem('WDLanguageCode', code)
        this.setState({ LanguageModal: false })
    }

    componentDidMount() {
        this.CheckLanguageCode()
        this.CheckConnectivity()
        NetInfo.addEventListener("connectionChange", this.handleConnectionChange);
        this.APIMethods()
    }

    ShowModalFunction(visible) {
        this.setState({ ModalVisibleStatus: visible });
    }

    handleFirstConnectivityChange = isConnected => {
        NetInfo.isConnected.removeEventListener(
            "connectionChange",
            this.handleFirstConnectivityChange
        );
        if (isConnected) {
            this.setState({ IsOnline: true, IsOffline: false })
            this.SendStoreDataToBackedAPI()
            this.PendingSurvey();
        } else {
            this.setState({ IsOnline: false, IsOffline: true, SurveyStatus: -5 })
        }
    };

    /*
    Handle internet connections
    */
    CheckConnectivity = () => {
        // For Android devices
        if (Platform.OS === "android") {
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    this.setState({ IsOnline: true })
                    this.setState({ IsOffline: false })
                } else {
                    this.setState({ IsOffline: true, })
                    this.setState({ IsOnline: false, SurveyStatus: -5 })
                }
            });
        } else {
            // For iOS devices
            NetInfo.isConnected.addEventListener(
                "connectionChange",
                this.handleFirstConnectivityChange
            );
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    this.setState({ IsOnline: true })
                    this.setState({ IsOffline: false })
                } else {
                    this.setState({ IsOffline: true })
                    this.setState({ IsOnline: false, SurveyStatus: -5 })
                }
            });
        }
    };

    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener(
            "connectionChange",
            this.handleConnectionChange
        );
    }

    handleConnectionChange = connectionInfo => {
        if (Platform.OS === "android") {
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    this.setState({ IsOnline: true, IsOffline: false })
                    this.SendStoreDataToBackedAPI()
                    this.PendingSurvey();
                } else {
                    this.setState({ IsOnline: false, IsOffline: true, SurveyStatus: -5 })
                }
                NetInfo.isConnected.addEventListener(
                    "connectionChange",
                    this.handleFirstConnectivityChange
                );
            });
        } else {
            // For iOS devices
            NetInfo.isConnected.addEventListener(
                "connectionChange",
                this.handleFirstConnectivityChange
            );
        }
    };

    ClickOnList(item) {
        if (this.state.selectedIndex == item.idx) {
            this.setState({ selectedIndex: -1 })
        } else {
            this.setState({ selectedIndex: item.idx })
            this.props.viewSurvey(item.id)
            this.props.surveyToken(item.survey_token)
            this.props.ReTake(0)
        }
    }

    onContentSizeChange = (contentWidth, contentHeight) => {
        if (track < 2) {
            this.setState({ screenHeight: contentHeight });
            track++;
        }
    };

    Refresh() {
        this.setState({ SurveyName: '' })
        this.APIMethods()
    }

    /*
    Search surveys by the survey name
    */
    SearchSurveysByName() {
        let name = this.state.SurveyName
        this.setState({ SurveyStatus: -1 })
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            GetAPI('surveys?clientId=' + this.props.SurveyRedux.client_id + '&name=' + name, value).then(response => {
                if (response.result != null && response.result != undefined) {
                    if (response.result.length > 0) {
                        this.setState({ PendingSurveyList: response.result })
                    }
                    if (response.result.length == 0) {
                        this.setState({ SurveyStatus: 1 })
                    } else {
                        this.setState({ SurveyStatus: 0 })
                    }
                } else {
                    this.setState({ SurveyStatus: 1 })
                    this.setState({ PendingSurveyList: [] })
                }
            })
        })
    }

    OnChangeSearch(e) {
        this.setState({ SurveyName: e })
    }

    ToggleLanguages(v) {
        this.setState({ SelectedLanguage: v })
    }

    render() {
        let SelectedLanguage = this.state.SelectedLanguage
        var DisplaySurveys = null
        if (this.state.PendingSurveyList.length > 0) {
            DisplaySurveys = this.state.PendingSurveyList.map((item, index) => {
                return (
                    <ListItem key={index} style={[{ marginLeft: 0, paddingLeft: 0 }, this.state.selectedIndex == item.idx ? { backgroundColor: '#fff' } : null]} onPress={() => this.ClickOnList(item)}>
                        <Left>
                            <Text style={[{ paddingLeft: 8, margin: 0, fontSize: 12 }, this.state.selectedIndex == item.idx ? styles.Validateerror : null]}>{item.survey_name}</Text>
                        </Left>
                        <Right>
                            <Icon style={[this.state.selectedIndex == item.idx ? { color: '#43CC53' } : null]} name="arrow-forward" />
                        </Right>
                    </ListItem>
                )
            })
        }
        return (
            <Content contentContainerStyle={{ backgroundColor: '#f1f2f7', flex: 1 }}>
                <Header style={{ backgroundColor: '#f1f2f7' }}>
                    <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10, marginBottom: 5, flex: 1, justifyContent: 'center' }}>
                        <TextInput defaultValue={this.state.SurveyName} value={this.state.SurveyName} onChangeText={e => this.OnChangeSearch(e)} onSubmitEditing={() => this.SearchSurveysByName()} placeholder="Search Surveys" style={{ paddingLeft: 40, paddingTop: 10, paddingRight: 10, paddingBottom: 10, backgroundColor: '#FFF', borderRadius: 50 }}></TextInput>
                        <TouchableOpacity onPress={() => this.Refresh()} style={{ position: 'absolute', justifyContent: 'center', left: 10, padding: 5 }} >
                            <Ionicons name={Platform == 'android' ? 'md-search' : 'ios-search'} color='#AAA' size={24} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => this.Refresh()} style={{ justifyContent: 'center', alignItems: 'center' }} >
                        <FontAwesome name={Platform == 'android' ? 'refresh' : 'refresh'} color='#43CC53' size={24} />
                    </TouchableOpacity>
                </Header>
                <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
                <View style={styles.container}>
                    <View style={styles.mainbody}>
                        <Image resizeMode='stretch' style={{ width: 150, height: 80 }}
                            source={require('../../../../images/logo1.png')} />
                        <Image resizeMode='stretch' style={{ width: 150, height: 30 }}
                            source={require('../../../../images/logo2.png')} />
                    </View>
                    {this.state.PendingSurveyList.length > 0 ? <View style={[{ height: this.state.screenHeight > 200 ? 200 : this.state.screenHeight }, styles.ScrollViewStyle]}>
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={true}
                            onContentSizeChange={this.onContentSizeChange}
                        >
                            <List style={{ backgroundColor: '#f1f2f7' }}>
                                {DisplaySurveys}
                            </List>
                        </ScrollView>
                    </View> : null}
                    {this.state.SurveyStatus == -1 ? <ActivityIndicator style={{ marginTop: 20 }} size="small" color="#00ff00" /> : null}
                    {this.state.SurveyStatus == 1 ? <View style={{ fontSize: 16, alignItems: 'center', justifyContent: 'center' }}>
                        <Text>There is no survey to attempt.</Text>
                    </View> : null}
                    <TouchableOpacity style={styles.loginStyle} onPress={() => this.StartSurvey()}>
                        <Text style={styles.loginText}>Start Survey</Text>
                        <View style={styles.IconPositionStyle}>
                            <View style={styles.buttonCircle}>
                                <Ionicons
                                    name={Platform.OS === 'android' ? "md-arrow-round-forward" : "ios-arrow-round-forward"}
                                    color='#43CC53'
                                    size={24}
                                    style={{ backgroundColor: 'transparent' }}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Snackbar
                        visible={this.state.IsOnline}
                        duration={2000}
                        onDismiss={() => this.setState({ IsOnline: false })}
                        style={{ backgroundColor: '#009688' }}
                    >
                        You are Online
                    </Snackbar>
                    <Snackbar
                        visible={this.state.IsOffline}
                        duration={3000}
                        onDismiss={() => this.setState({ IsOnline: false })}
                        action={{
                            label: 'Ok',
                            onPress: () => {
                            },
                        }}
                        style={{ backgroundColor: '#f44336' }}
                    >
                        No Internet Connection
                    </Snackbar>
                </View>
                <View>
                    <Modal
                        transparent={true}
                        animationType={"slide"}
                        visible={this.state.LanguageModal}
                        onRequestClose={() => this.setState({ LanguageModal: false })} >
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={styles.ModalInsideView}>
                                <View style={{ flex: 1, borderBottomColor: '#EEE', borderBottomWidth: 1, justifyContent: 'center' }}>
                                    <Text style={styles.TextStyle}>{'Select Language'}</Text>
                                </View>
                                <View style={{ flex: 2, justifyContent: 'center' }}>
                                    <TouchableOpacity onPress={() => this.ToggleLanguages(1)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, margin: 10 }}>
                                        <Text style={styles.LanguageStyle}>English</Text>
                                        <Ionicons name={Platform == 'android' ? 'md-checkmark-circle' : 'ios-checkmark-circle'} color={SelectedLanguage == 1 ? '#43CC53' : '#DDD'} size={28} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.ToggleLanguages(2)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, margin: 10 }}>
                                        <Text style={styles.LanguageStyle}>Swedish</Text>
                                        <Ionicons name={Platform == 'android' ? 'md-checkmark-circle' : 'ios-checkmark-circle'} color={SelectedLanguage == 2 ? '#43CC53' : '#DDD'} size={28} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TouchableOpacity style={styles.SaveLanguageStyle} onPress={() => this.SetLanguageCode()}>
                                        <Text style={styles.loginText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </Content>
        )
    }
}

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
        SavePendingSurvey,
        ReTake
    }, dispatch)
);

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(HomeScreen))

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f1f2f7',
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainbody: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        paddingHorizontal: wp('5%'),
    },
    welcome: {
        flex: 1,
        margin: 20,
        backgroundColor: 'orange',
        margin: 10,
        textAlign: 'center',
        fontSize: 20,
        paddingTop: 70,
    },
    Validateerror: {
        color: 'green'
    },
    ScrollViewStyle: {
        minWidth: '85%',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5
    },
    ModalInsideView: {
        flexDirection: 'column',
        backgroundColor: "#FFF",
        height: 250,
        width: '90%',
        borderRadius: 5,
    },
    TextStyle: {
        fontSize: 18,
        color: "#000",
        textAlign: 'center',
        fontFamily: Fonts.Roboto
    },
    LanguageStyle: {
        fontSize: 14,
        color: "#000",
        fontFamily: Fonts.Roboto
    },
    CheckBoxStyle: {
        flexDirection: 'row',
        margin: 5,
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255,255,0.2)',
        paddingHorizontal: 25,
        width: wp('45%'),
        height: hp('8%'),
        borderRadius: 50
    },
    CheckBoxStyle1: {
        flexDirection: 'row',
        margin: 5,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255,255,0.2)',
        paddingHorizontal: 25,
        width: wp('45%'),
        height: hp('8%'),
        borderRadius: 50
    },
    CheckedStyle: {
        marginRight: 15,
    },
    logoText: {
        marginVertical: 40,
        fontSize: hp('4%'),
        color: '#fff'
    },
    Startbutton: {
        width: wp('40%'),
        height: hp('8%'),
        backgroundColor: '#1c313a',
        borderRadius: 50,
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: hp('2%'),
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    },
    buttonStyle: {
        marginTop: 20
    },
    loginStyle: {
        flexDirection: 'row',
        minWidth: '85%',
        height: Platform.OS === 'ios' ? 50 : 50,
        marginTop: 30,
        backgroundColor: '#43CC53',
        borderColor: '#43CC53',
        borderWidth: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    SaveLanguageStyle: {
        flexDirection: 'row',
        flex: 1,
        marginTop: 10,
        backgroundColor: '#43CC53',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginText: {
        position: 'absolute',
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonCircle: {
        width: Platform.OS === 'ios' ? 25 : 40,
        height: Platform.OS === 'ios' ? 25 : 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    IconPositionStyle: {
        position: 'absolute',
        right: 5
    },
});
