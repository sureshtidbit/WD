import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    Dimensions,
    BackHandler,
    AsyncStorage,
    Modal, Platform,
    YellowBox,
    Keyboard,
    NetInfo,
    StatusBar
} from 'react-native';
import { DotsLoader } from 'react-native-indicator';
import { Snackbar } from 'react-native-paper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dropdown } from 'react-native-material-dropdown';
import Toast from 'react-native-simple-toast';
import {
    withNavigation
} from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toaster from 'react-native-toaster'
import Header from '../header/app_header';
import TextInputCard from './form-cards/textInputCard';
import RadioCard from './form-cards/radioCard';
import IntegerTextInputCard from './form-cards/IntegerTextInputCard';
import CheckboxCard from './form-cards/checkBoxCard';
import VoiceButton from './form-cards/voicerecord'
import ErrorAlerts from '../alertMessage/errorAlert'
import RNFetchBlob from 'react-native-fetch-blob'
import { API } from '../../auth/index'
import { CongratulationFlag, SurveyResponse, ReTake } from '../../redux/surveyAction'
import { Fonts } from '../../utils/fonts'
import DisplayTextComponent from './form-cards/displayText'
var firstLoop = -1;
var secondLoop = -1;
var NextQuestion = 0;
var currentQuestion = 0;
var NextRadioQ = -1;
var CurrentNextRadioQ = -1;
var flag = 0;
var loopFlag = 0;
var goBackWord = 0
var currentLoop = 0;
var CurrentSecondLoop = -1;
var QLength = 0;
var SubQStatus = -1;
var QType = "";
var QuestionType = ""
var errorCode = -2
var SurveyLength = 0
var goBack = 0
var GroupProperty = []
var ValidationProperties = []
var QuestionID = 0

class FormBasedSurvey extends Component {
    constructor() {
        super();
        YellowBox.ignoreWarnings(
            ['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
            ]);
        console.disableYellowBox = true;
        this.state = {
            HideFooter: true,
            isListening: false,
            Array: [],
            message: null,
            ChatArray: [],
            chat: "",
            visible: true,
            text: "", value: "",
            checked: false,
            NextQ: 1,
            QuestionsSection: [],
            loader: true,
            Question: null,
            SurveyStatus: 0,
            NextQuestion: 0,
            Survey: [],
            RadioSingleQData: "",
            RDaata: [{}],
            ErrorWarning: 0,
            progress: 100,
            progressWithOnComplete: 0,
            progressCustomized: 0,
            PregresPer: 0,
            ModalVisibleStatus: false,
            OfflineModal: false,
            inCompleteRespose: 0,
            IsInternetConnected: false,
            IsOnline: false,
            Internet: false,
            DisplayText: "",
            YesLoader: false,
            TranslationDataArray: [],
            ErrorMessage: '',
            ErrorStatus: false,
            SpeechLoader: false
        }
        this.ModalText = ''
        this.NextPrevToggle = 0
        this.isComplete = 0
        this.TrackNextPrev = 0
        this.TrackNextPrev1 = 0;
        this.QuestionStack = [];
        this.AnsArray = [{}]
        this.SurveyAnswer = [];
        this.isValid = -1
        this.UserSurveyResponse = {};
        this.BreakPoint = -5;
        this.SectionImage = []
        this.Surveytitle = null;
        this.survey_id = ""
        this.survey_token = ""
        this.client_id = ""
        this.ValidationStatus = -1
    }

    push(item) {
        this.QuestionStack.push(item)
    }

    pop() {
        return this.QuestionStack.pop()
    }

    size() {
        return this.QuestionStack.length
    }

    handleBackButton = () => {
        this.isComplete = 0
        if (this.state.Internet) {
            this.ModalText = 'Do you want to save this survey?'
            this.setState({ OfflineModal: false })
            this.setState({ ModalVisibleStatus: true })
        } else {
            this.ModalText = 'Do you want to save the response? You are currently offline. Your responses will be saved locally and submitted when you have internet connection.'
            this.setState({ ModalVisibleStatus: false })
            this.setState({ OfflineModal: true })
        }
        return true;
    };

    NoPause() {
        this.setState({ ModalVisibleStatus: false, YesLoader: false })
        this.setState({ OfflineModal: false })
        this.props.navigation.navigate('TakeSurvey');
    }

    Logout() {
        AsyncStorage.removeItem('SurveyAuthToken');
        AsyncStorage.removeItem('SurveyPatientInfo');
        this.props.navigation.navigate('Login')
    }

    CheckConnectivity = () => {
        // For Android devices
        if (Platform.OS === "android") {
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    this.setState({ IsOnline: true })
                    this.setState({ IsInternetConnected: false })
                } else {
                    this.setState({ IsInternetConnected: true })
                    this.setState({ IsOnline: false })
                }
                this.setState({ Internet: isConnected })
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
                    this.setState({ IsInternetConnected: false })
                } else {
                    this.setState({ IsInternetConnected: true })
                    this.setState({ IsOnline: false })
                }
                this.setState({ Internet: isConnected })
            });
        }
    };

    handleFirstConnectivityChange = isConnected => {
        NetInfo.isConnected.removeEventListener(
            "connectionChange",
            this.handleFirstConnectivityChange
        );
        if (isConnected) {
            this.setState({ IsOnline: true })
            this.setState({ IsInternetConnected: false })
        } else {
            this.setState({ IsInternetConnected: true })
            this.setState({ IsOnline: false })
        }
        this.setState({ Internet: isConnected })
    };

    handleConnectionChange = connectionInfo => {
        if (Platform.OS === "android") {
            NetInfo.isConnected.fetch().then(isConnected => {
                this.setState({ Internet: isConnected })
                if (isConnected) {
                    this.setState({ IsOnline: true })
                    this.setState({ IsInternetConnected: false })
                } else {
                    this.setState({ IsInternetConnected: true })
                    this.setState({ IsOnline: false })
                }
            });
        } else {
            // For iOS devices
            NetInfo.isConnected.addEventListener(
                "connectionChange",
                this.handleFirstConnectivityChange
            );
        }
    };

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        NetInfo.isConnected.removeEventListener(
            "connectionChange",
            this.handleConnectionChange
        );
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener.remove();
    }

    _keyboardDidShow(e) {
        this.setState({ HideFooter: false })
    }

    _keyboardDidHide() {
        this.setState({ HideFooter: true })
    }

    _keyboardWillShow() {
        this.setState({ HideFooter: false })
    }

    _keyboardWillHide() {
        this.setState({ HideFooter: true })
    }
    
    componentDidMount() {
        this.CheckConnectivity();
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow.bind(this));
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide.bind(this));
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        NetInfo.addEventListener("connectionChange", this.handleConnectionChange);
        firstLoop = -1;
        secondLoop = -1;
        NextQuestion = 0;
        currentQuestion = 0;
        NextRadioQ = -1;
        flag = 0;
        loopFlag = 0;
        goBackWord = 0;
        currentLoop = 0;
        QLength = 0;
        this.TrackNextPrev = 0
        var id = this.props.SurveyRedux.survey_id
        this.survey_id = id
        this.survey_token = this.props.SurveyRedux.survey_token
        this.client_id = this.props.SurveyRedux.client_id
        if (this.props.SurveyRedux.ReTake == 1) {
            this.RetakeSameSurveyAgain(this.props.SurveyRedux.ReTakeAPIResponse)
        } else {
            this.PendingSurvey(id, this.props.SurveyRedux.survey_token, this.client_id)
        }
    }

    PendingSurvey(survey_id, survey_token, clientId) {
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token = 'Bearer ' + value
            let url = API + 'surveys?clientId=' + clientId
            RNFetchBlob.config({
                trusty: true
            }).fetch('GET', url, {
                'Authorization': token,
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
                .then((response) => response.json())
                .then((responseData) => {
                    console.log(responseData, 'data=> PendingSurvey')
                    if (responseData.status == 'ok') {
                        if (responseData.result.length > 0) {
                            var FilterSurvey = responseData.result.filter(item => item.survey_token == survey_token)
                            if (FilterSurvey[0].inCompleteRespose !== undefined && FilterSurvey[0].inCompleteRespose !== null) {
                                if (Object.keys(FilterSurvey[0].inCompleteRespose).length > 0) {
                                    this.setState({ inCompleteRespose: 1 })
                                } else {
                                    this.setState({ inCompleteRespose: 0 })
                                }
                            } else {
                                this.setState({ inCompleteRespose: 0 })
                            }
                            this.getSurveys(survey_id, FilterSurvey[0].inCompleteRespose, clientId)
                        }
                    } else {
                        if (responseData.status == 'failed') {
                            this.Logout()
                            this.setState({ loader: false })
                        }
                    }
                })
        })
    }

    RetakeSameSurveyAgain(responseJson) {
        this.UserSurveyResponse = {};
        GroupProperty = responseJson.result.groupProperties;
        ValidationProperties = responseJson.result.validationProperties;
        this.SurveyAnswer = responseJson.result.questionnaire.section;
        SurveyLength = responseJson.result.questionnaire.section.length
        this.setState({ QuestionsSection: responseJson.result.questionnaire.section })
        this.GetQuestion(responseJson.result.questionnaire.section, NextQuestion);
        this.ArrayInitialize(responseJson.result.questionnaire.section.length)
        this.setState({ loader: false })
    }

    getSurveys(survey_id, PausedData, clientId) {
        let APIURL = null
        if (this.props.SurveyRedux.ReTake == 1) {
            APIURL = API + 'survey-detail?survey_id=' + survey_id + "&clientId=" + clientId
        } else {
            APIURL = API + 'survey-detail?survey_id=' + survey_id + "&clientId=" + clientId
        }
        AsyncStorage.getItem('SurveyAuthToken').then((value) => {
            var token = 'Bearer ' + value
            RNFetchBlob.config({
                trusty: true
            }).fetch('GET', APIURL, {
                'Authorization': token,
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log('Survey details==>>', responseJson, PausedData);
                    if (responseJson.status == 'ok') {
                        GroupProperty = responseJson.result.groupProperties;
                        ValidationProperties = responseJson.result.validationProperties;
                        this.SurveyAnswer = responseJson.result.questionnaire.section;
                        SurveyLength = responseJson.result.questionnaire.section.length
                        if (PausedData !== undefined && PausedData !== null) {
                            if (PausedData.length == 0) {
                                this.UserSurveyResponse = {}
                            } else {
                                this.UserSurveyResponse = PausedData;
                            }
                        } else {
                            this.UserSurveyResponse = {};
                        }
                        this.setState({ QuestionsSection: responseJson.result.questionnaire.section })
                        this.GetQuestion(responseJson.result.questionnaire.section, NextQuestion);
                        this.ArrayInitialize(responseJson.result.questionnaire.section.length)
                        this.setState({ loader: false })
                    } else {
                        if (responseJson.status == 'failed') {
                            this.Logout()
                            this.setState({ loader: false })
                        }
                    }
                }).catch((error) => {
                    if ('errors', error) {
                        this.setState({ loader: false })
                    }
                });
        })
    }

    ArrayInitialize(len) {
        var array = this.state.Survey;
        for (let i = 0; i < len; i++) {
            array.push([])
        }
        this.setState({ Survey: array })
    }

    GoFromTextBox(data, id) {
        let flag = true
        if (id == 0) {
            for (let i = 0; i < data.length; i++) {
                if (this.UserSurveyResponse[data[i].attributes.varName]) {
                } else {
                    flag = false;
                }
            }
        } else {
            if (this.UserSurveyResponse[data.attributes.varName]) {
            } else {
                flag = false
            }
        }
        if (flag) {
            this.isValid = 0
            this.onPressNext(0);
        } else {
            this.setState({ loader: false })
            this.setState({ inCompleteRespose: 0 })
        }
    }

    GetTextBoxCard(question, id) {
        if (question.subQuestion !== undefined) {
            QuestionType = 'textbox'
            this.setState({ Question: question })
        } else {
            QuestionType = 'IntegerTextBox'
            this.setState({ Question: question })
        }
        if (id === 0) {
            NextQuestion++;
            this.TrackNextPrev = NextQuestion
        }
        if (question.subQuestion !== undefined) {
            if (this.state.inCompleteRespose == 1) {
                this.GoFromTextBox(question.subQuestion, 0);
            }
        } else {
            if (this.state.inCompleteRespose == 1) {
                this.GoFromTextBox(question.response, 1);
            }
        }
    }

    GetCheckBoxFrom(data) {
        let flag = false
        for (let i = 0; i < data.length; i++) {
            if (this.UserSurveyResponse[data[i].attributes.varName]) {
                flag = true;
                break;
            }
        }
        if (flag) {
            this.isValid = 0
            this.onPressNext(0);
        } else {
            this.setState({ loader: false })
            this.setState({ inCompleteRespose: 0 })
        }
    }

    GetCheckBoxCard(question) {
        QuestionType = 'checkbox'
        this.setState({ Question: question })
        if (this.state.inCompleteRespose == 1) {
            this.GetCheckBoxFrom(question.response)
        }
    }

    GetRadioFrom(VarName) {
        let flag = true
        var res = this.UserSurveyResponse[VarName.attributes.varName]
        if (res !== undefined && res !== null) {
        } else {
            flag = false
        }
        if (flag) {
            this.isValid = 0
            this.onPressNext(0);
        } else {
            this.isValid = -1
            this.setState({ inCompleteRespose: 0 })
            this.setState({ loader: false })
        }
    }

    GetRadioButtonCard(question, len) {
        if (question.subQuestion !== undefined) {
            if (currentQuestion !== NextQuestion) {
                for (let i = 0; i < question.subQuestion.length; i++) {
                    this.AnsArray = [{}]
                }
            }
            CurrentNextRadioQ = NextRadioQ
            NextRadioQ = NextRadioQ + 1;
            QuestionType = 'radio'
            this.setState({ Question: question })
            if (question.subQuestion.length - 1 === NextRadioQ) {
                loopFlag = 0;

            }
            if (len - 1 === NextRadioQ) {
                NextQuestion++;
                flag = 1;
                this.TrackNextPrev = NextQuestion
            }
            if (this.state.inCompleteRespose == 1) {
                this.GetRadioFrom(question.subQuestion[NextRadioQ])
            }
        } else {
            if (question.response.fixed.category.length > 10) {
                QuestionType = 'dropdown'
                this.setState({ Question: question })
                if (this.UserSurveyResponse[question.response.attributes.varName] == undefined) {
                    this.UserSurveyResponse[question.response.attributes.varName] = null;
                }
                if (this.UserSurveyResponse[question.response.attributes.varName]) {
                    this.isValid = 0;
                }
            } else {
                QuestionType = 'radio'
                this.setState({ Question: question })
            }
            if (this.state.inCompleteRespose == 1) {
                this.GetRadioFrom(question.response)
            }
        }
    }

    buttonClicked = () => {
        this.isComplete = 1
        this.setState({ SurveyStatus: 1 })
        if (this.state.Internet) {
            this.ModalText = 'You have filled the survey. Do you want to save this survey?'
            this.setState({ OfflineModal: false })
            this.setState({ ModalVisibleStatus: true })
        } else {
            this.ModalText = 'Do you want to save the response? You are currently offline. Your responses will be saved locally and submitted when you have internet connection.'
            this.setState({ ModalVisibleStatus: false })
            this.setState({ OfflineModal: true })
        }
    };

    onPressNext(idx) {
        this.TrackNextPrev1 = this.TrackNextPrev1 + 1
        if (idx == 1) {
            NextQuestion++;
        }
        goBackWord = 0
        if (SurveyLength === NextQuestion) {
            this.buttonClicked()
            return 0;
        }
        this.AnsArray = [{}]
        if (QuestionType === 'dropdown') {
            this.GoFromDropDown()
        }
        if (this.isValid === 0) {
            if (this.ValidationStatus == 0) {
                this.props.SurveyResponse(this.UserSurveyResponse)
                this.props.navigation.navigate('CompleteSurvey');
                this.ValidationStatus = -1
                return;
            }
            this.setState({ ErrorWarning: 0 })
            errorCode = 0;
            if (flag === 1) {
                NextRadioQ = -1;
                flag = 0;
            }
            var lp = loopFlag;
            if (SubQStatus === 5) {
                lp = 1;
            }
            var OB = {
                type: QType,
                firstLoop: firstLoop, NextQuestion: NextQuestion,
                NextRadioQ: NextRadioQ, secondLoop: secondLoop,
                CurrentNextRadioQ: CurrentNextRadioQ,
                CurrentSecondLoop: CurrentSecondLoop,
                currentQuestion: currentQuestion, currentLoop: currentLoop,
                QLength: QLength,
                loopFlag: lp,
                SubQStatus: SubQStatus,
                flag: flag,
                goBack: goBack
            }
            this.isValid = -1
            this.push(OB);
            currentQuestion = NextQuestion;
            this.GetQuestion(this.SurveyAnswer, NextQuestion)
        }
        else {
            errorCode = 1 + Math.floor(Math.random() * (100 - 1 + 1)) + 1
            this.setState({ ErrorWarning: 1 + Math.floor(Math.random() * (100 - 1 + 1)) + 1 })
        }
        this.NextPrevToggle = 1
    }

    onPressPrev() {
        if (this.QuestionStack.length < 1) {
            return 0;
        }
        goBackWord = 1
        var PopData = null;
        PopData = this.pop()
        this.setState({ inCompleteRespose: 0 })
        currentQuestion = PopData.currentQuestion;
        if (this.BreakPoint == currentQuestion) {
            PopData = this.pop()
            NextQuestion = PopData.NextQuestion;
            this.BreakPoint = -5
        } else {
            NextQuestion = currentQuestion;
        }
        currentQuestion = PopData.currentQuestion;
        firstLoop = PopData.firstLoop;
        NextRadioQ = PopData.CurrentNextRadioQ;
        if (PopData.CurrentSecondLoop != PopData.secondLoop) {
            if (PopData.CurrentSecondLoop >= 0) {
                secondLoop = PopData.secondLoop;
            } else {
                secondLoop = PopData.secondLoop;
            }
        } else {
            secondLoop = PopData.secondLoop;
        }
        currentLoop = PopData.currentLoop;
        loopFlag = PopData.loopFlag;
        SubQStatus = PopData.SubQStatus;
        goBack = PopData.goBack;
        flag = PopData.flag;
        this.TrackNextPrev = NextQuestion
        this.GetQuestion(this.SurveyAnswer, NextQuestion)
        this.isValid = 0
        this.TrackNextPrev1 = this.TrackNextPrev1 - 1
        this.NextPrevToggle = 2
    }

    GetQuestion(QuestionsSection, nextNumber) {
        let j = 0
        var type = ""
        SubQStatus = loopFlag;
        QuestionID = QuestionsSection[nextNumber].attributes.id
        var FilteredOB = GroupProperty.find(item => item.gid == QuestionsSection[nextNumber].attributes.id)
        if (FilteredOB !== undefined && FilteredOB !== null) {
            this.SectionImage = FilteredOB.image
            this.Surveytitle = FilteredOB.group_name
        }
        if (QuestionsSection.length > 0) {
            if (QuestionsSection[nextNumber] !== undefined) {
                if (QuestionsSection[nextNumber].question === undefined) {
                    NextQuestion++;
                    this.isValid = 0;
                    secondLoop = -1;
                    NextRadioQ = -1
                    if (QuestionsSection[nextNumber].input_type === "Text display") {
                        QuestionType = "Text display"
                        if (QuestionsSection[nextNumber].sectionInfo.length >= 2) {
                            this.setState({ DisplayText: QuestionsSection[nextNumber].sectionInfo[1].text })
                        } else {
                            this.setState({ DisplayText: QuestionsSection[nextNumber].sectionInfo[0].text })
                        }
                    }
                    return 0;
                }
            }
        }
        
        let i = nextNumber
        if (QuestionsSection.length > 0) {
            if (QuestionsSection[i].question !== undefined) {
                if (QuestionsSection[i].question.length <= 1 && i === nextNumber) {
                    firstLoop = i;
                    secondLoop = -1;
                    CurrentSecondLoop = secondLoop
                    type = QuestionsSection[i].question[0].input_type;
                    if (type == undefined) {
                        if (NextQuestion < SurveyLength - 1) {
                            this.onPressNext(1)
                        } else {
                            this.buttonClicked();
                        }
                    }
                    QType = type;
                    if (type === 'textbox') {
                        QLength = 0;
                        this.GetTextBoxCard(QuestionsSection[i].question[j], 0)
                    } else if (type === 'checkbox') {
                        QLength = 0;
                        this.GetCheckBoxCard(QuestionsSection[i].question[j])
                    } else if (type === 'radio') {
                        QLength = 0;
                        this.GetRadioButtonCard(QuestionsSection[i].question[0], QuestionsSection[i].question[0].subQuestion.length)
                    }
                } else {
                    if (QuestionsSection[i].question.length > 1 && i === nextNumber) {
                        CurrentSecondLoop = secondLoop
                        if (firstLoop !== i) {
                            secondLoop = -1;
                            firstLoop = i;
                        } else {
                            if (loopFlag === 0 && goBackWord != 1) {
                                if (QuestionsSection[i].question.length > secondLoop + 1) {
                                    secondLoop = secondLoop + 1;
                                }
                            }
                        }
                        if (secondLoop === -1) {
                            secondLoop = 0;
                            NextRadioQ = -1;
                        }
                        for (j = 0; j < QuestionsSection[i].question.length; j++) {
                            if (secondLoop === j) {
                                type = QuestionsSection[i].question[j].input_type;
                                if (type == undefined) {
                                    if (NextQuestion < SurveyLength - 1) {
                                        this.onPressNext(1)
                                        break;
                                    } else {
                                        this.buttonClicked();
                                        break;
                                    }
                                }
                                QType = type;
                                if (type === 'textbox') {
                                    if (QuestionsSection[i].question.length - 1 === secondLoop) {
                                        NextQuestion++;
                                        secondLoop = -1;
                                        this.TrackNextPrev = NextQuestion
                                    }
                                    QLength = QuestionsSection[i].question.length
                                    this.GetTextBoxCard(QuestionsSection[i].question[j], 1)
                                } else if (type === 'checkbox') {
                                    if (QuestionsSection[i].question.length - 1 === secondLoop) {
                                        NextQuestion++;
                                        secondLoop = -1;
                                        this.TrackNextPrev = NextQuestion
                                    }
                                    QLength = QuestionsSection[i].question.length
                                    this.GetCheckBoxCard(QuestionsSection[i].question[j])
                                } else if (type === 'radio') {
                                    QLength = QuestionsSection[i].question.length
                                    if (QuestionsSection[i].question[j].subQuestion !== undefined) {
                                        if (QuestionsSection[i].question[j].subQuestion.length - 1 === NextRadioQ + 1) {
                                            if (QuestionsSection[i].question.length - 1 === secondLoop) {
                                                NextQuestion++;
                                                this.TrackNextPrev = NextQuestion
                                            }
                                        }
                                    } else {
                                        if (QuestionsSection[i].question.length - 1 === secondLoop) {
                                            NextQuestion++;
                                            this.TrackNextPrev = NextQuestion
                                        }
                                    }
                                    if (QuestionsSection[i].question[j].subQuestion !== undefined) {
                                        if (QuestionsSection[i].question[j].subQuestion.length - 1 === NextRadioQ + 1) {
                                            SubQStatus = 5;
                                        }
                                        if (QuestionsSection[i].question[j].subQuestion.length > 1) {
                                            if (loopFlag === 0) {
                                                NextRadioQ = -1
                                            }
                                            loopFlag = 1;
                                        }
                                    } else {
                                        loopFlag = 0;
                                    }
                                    this.GetRadioButtonCard(QuestionsSection[i].question[j], -5)
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    SaveSurvey() {
        let app = this
        const details = {
            'token': this.state.survey_token,
            'client_id': this.state.client_id,
            'id': this.state.survey_id,
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
        AsyncStorage.setItem(
            'PatientOffSurvey',
            formBody
        );
        this.props.navigation.navigate('TakeSurvey');
    }

    submitChat1() {
        let app = this
        this.setState({ YesLoader: true })
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
            let url = API + 'submit-response?clientId=' + app.client_id
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
                    console.log(responseData, 'response');
                    if (responseData.status == 'ok') {
                        if (this.isComplete == 0) {
                            Toast.show("This Survey's partial response has been submitted successfully!", Toast.LONG);
                        } else {
                            Toast.show('This Survey response has been submitted successfully!', Toast.LONG);
                        }
                        this.setState({ YesLoader: false })
                        setTimeout(() => this.props.navigation.navigate('TakeSurvey'), 600)
                    } else {
                        this.setState({ YesLoader: false })
                        if (responseData.status == "failed") {

                            this.Logout();
                        } else {
                            Toast.show('All Questions are mendatory.Please Review again all the Survey Questions!', Toast.LONG);
                        }
                    }
                })
        })
    }

    GetDataFromComponent(e) {
        let app = this;
        const { isValid, jumpFlag, inCompleteRespose, UserSurveyResponseP } = e
        if (isValid === 0) {
            app.isValid = 0
            errorCode = 0
            if (inCompleteRespose == 1) {
                this.onPressNext(0)
            }
            app.setState({ ErrorWarning: 0 })
            if (jumpFlag == 1) {
                app.UserSurveyResponse = UserSurveyResponseP
                setTimeout(() => this.onPressNext(0), 500)
            }
        } else {
            app.isValid = -1
        }
    }

    GetRadioDataFromComponent(e) {
        let app = this;
        const { isValid, inCompleteRespose, check, UserSurveyResponseP } = e
        if (isValid === 0) {
            app.isValid = 0
            if (inCompleteRespose == 1) {
                this.onPressNext(0)
            }
            errorCode = 0
            app.setState({ ErrorWarning: 0 })
            if (check !== 0) {
                app.UserSurveyResponse = UserSurveyResponseP
                setTimeout(() => app.onPressNext(0), 500)
            }
        } else {
            app.isValid = -1
        }
    }

    GetIntegerInputData(e) {
        let app = this;
        const { isValid, jumpFlag, inCompleteRespose, UserSurveyResponseP, status } = e
        app.ValidationStatus = status
        if (isValid === 0) {
            app.isValid = 0
            errorCode = 0
            app.setState({ ErrorWarning: 0 })
            if (inCompleteRespose == 1) {
                this.onPressNext(0)
            }
            if (jumpFlag == 1) {
                app.UserSurveyResponse = UserSurveyResponseP
                setTimeout(() => app.onPressNext(0), 500)
            }
        } else {
            app.isValid = -1
        }
    }

    GetCheckData(e) {
        let app = this;
        const { isValid, jumpFlag, inCompleteRespose, UserSurveyResponseP } = e
        if (isValid === 0) {
            app.isValid = 0
            errorCode = 0
            app.setState({ ErrorWarning: 0 })
            if (inCompleteRespose == 1) {
                this.onPressNext(0)
            }
            if (jumpFlag == 1) {
                app.UserSurveyResponse = UserSurveyResponseP
                setTimeout(() => app.onPressNext(0), 500)
            }
        } else {
            app.isValid = -1
        }
    }

    GoFromDropDown() {
        let flag = true;
        if (this.state.inCompleteRespose == 1) {
            if (this.UserSurveyResponse[this.state.Question.response.attributes.varName]) {
                this.isValid = 0
                this.onPressNext(0)
                QuestionType = 'X'
            } else {
                this.isValid = -1
                this.setState({ loader: false })
                this.setState({ inCompleteRespose: 0 })
            }
        } else if (this.UserSurveyResponse[this.state.Question.response.attributes.varName]) {
            this.isValid = 0
        }
    }

    DisplayTextNext(e) {
        const { isValid, inCompleteRespose } = e
        if (isValid == 0) {
            this.isValid = 0;
            if (inCompleteRespose == 1) {
                this.onPressNext(0)
            }
        }
    }

    onChangeTextPress(Dropdown) {
        var VarName = this.state.Question.response
        this.UserSurveyResponse[VarName.attributes.varName] = Dropdown;
        this.isValid = 0;
        setTimeout(() => this.onPressNext(0), 800)
    }

    ShowModalFunction(visible) {
        this.setState({ ModalVisibleStatus: visible, YesLoader: false });
    }

    ShowModalFunction1(visible) {
        this.setState({ OfflineModal: visible });
    }

    HeaderGoBack() {
        this.handleBackButton();
    }

    DropDown(data, VarName) {
        VarName = this.UserSurveyResponse[VarName]
        if (VarName == null) {
            VarName = ""
        }
        return (
            <View style={styles.container}>
                <View
                >
                    <View
                        style={styles.QuestionStyle1}
                    >
                        <View>
                            <Text
                                style={[styles.customStyle1, {
                                    padding: 5,
                                    color: '#000',
                                    fontWeight: '600'
                                }]}
                            ><Text
                                style={[styles.customStyle1, {
                                    color: 'red',
                                    fontWeight: '600'
                                }]}
                            >*</Text>{this.state.Question.text}</Text>
                        </View>
                    </View>
                    {this.state.ErrorWarning > 0 ?
                        <View
                            style={styles.QuestionStyle1}
                        >
                            <Text style={[styles.customStyle, styles.ErrorText]}>This question is mandatory</Text>
                        </View> : null}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 15,
                            marginRight: 15,
                            backgroundColor: '#f1f2f7',
                            paddingTop: 10,
                            paddingBottom: 50,
                        }}
                    >
                        <Dropdown
                            dropdownOffset={{ top: 10, left: 0 }}
                            containerStyle={{
                                borderWidth: 2, margin: 15,
                                paddingLeft: 10,
                                borderColor: '#9e9e9e', borderRadius: 5, width: wp('60%'), height: 45,
                            }}
                            rippleCentered={true}
                            inputContainerStyle={{ borderBottomColor: 'transparent' }}
                            label=''
                            data={data}
                            value={VarName}
                            onChangeText={(value) => this.onChangeTextPress(value)}
                        />
                    </View>
                </View>
            </View>
        )
    }
    translationData(v) {
        let Words = []
        if (v) {
            if (v.length > 0) {
                if (QuestionType === 'textbox' || QuestionType === 'IntegerTextBox') {
                    v.map(item => {
                        if (item.alternatives) {
                            item.alternatives.map(ev => {
                                if (ev.words) {
                                    ev.words.map(word => {
                                        if (word.word) {
                                            Words.push(word.word)
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            }
        }
        this.setState({ TranslationDataArray: Words })
        this.setState({ ErrorMessage: '', ErrorStatus: false })
    }

    ErrorAlert(v) {
        this.setState({ ErrorMessage: '', ErrorStatus: false }, () => {
            if (v) {
                this.setState({ ErrorMessage: v, ErrorStatus: true })
            }
        })
    }

    OnSpeechLoader(v) {
        this.setState({ SpeechLoader: v })
    }

    ListeningMethod(e) {
        this.setState({ isListening: e })
    }

    render() {
        const barWidth = Dimensions.get('screen').width - 30;
        const barWidth1 = 20;
        let percentage = 0
        let app = this
        let data = []
        let VarName = null
        if (QuestionType === 'dropdown') {
            if (this.state.Question.response.fixed.category.length > 0) {
                data = this.state.Question.response.fixed.category;
                VarName = this.state.Question.response.attributes.varName
            } else {
                data = []
            }
        }
        if (app.state.QuestionsSection.length > 0) {
            percentage = Math.ceil((100 * (NextQuestion)) / app.state.QuestionsSection.length)
            if (percentage > 100) {
                percentage = 100;
            }
            if (this.state.PregresPer === 1) {
                percentage = 100;
            }
            if (this.state.SurveyStatus == 1) {
                percentage = 100;
            }
        }
        if (app.state.loader) {
            return (
                <View style={[styles.container1, styles.horizontal]}>
                    <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
                    <ActivityIndicator size='large' color="#00ff00" />
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <View>
                        <Toaster message={this.state.message} />
                    </View>
                    <Header HeaderGoBack={() => app.HeaderGoBack()} title={app.Surveytitle}></Header>
                    <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
                    {this.state.ErrorStatus ? <ErrorAlerts message={this.state.ErrorMessage}></ErrorAlerts> : null}
                    <KeyboardAwareScrollView
                        keyboardShouldPersistTaps='handled'
                        enableAutomaticScroll={true}
                    >
                        <View
                        >
                            <View style={styles.ProgressBar}>
                                <ProgressBarAnimated
                                    width={barWidth}
                                    borderWidth={2}
                                    height={barWidth1}
                                    backgroundColor="#4288CC"
                                    value={percentage}
                                    backgroundColorOnComplete="#4288CC"
                                />
                                <View style={styles.buttonContainer}>

                                    <Text style={{ color: '#62CC54', fontWeight: '700', fontSize: 16 }}
                                    >{percentage}%</Text>

                                </View>
                            </View>

                            {QuestionType === 'IntegerTextBox' ?
                                <IntegerTextInputCard TranslationDataArray={this.state.TranslationDataArray} SectionImage={app.SectionImage} ValidationProperties={ValidationProperties} QuestionID={QuestionID} UserSurveyResponse={app.UserSurveyResponse} ErrorWarning={errorCode} inCompleteRespose={this.state.inCompleteRespose} PushTextDataToObject={(e) => app.GetIntegerInputData(e)} Question={app.state.Question} NextRadioQ={NextRadioQ} NextQuestion={currentQuestion} secondLoop={secondLoop}></IntegerTextInputCard> : null}
                            {QuestionType === 'textbox' ?
                                <TextInputCard TranslationDataArray={this.state.TranslationDataArray} SectionImage={app.SectionImage} UserSurveyResponse={app.UserSurveyResponse} ErrorWarning={errorCode} inCompleteRespose={this.state.inCompleteRespose} PushTextDataToObject={(e) => app.GetDataFromComponent(e)} Question={app.state.Question} NextQuestion={currentQuestion} secondLoop={secondLoop}></TextInputCard> : null}
                            {QuestionType === 'radio' ?
                                <RadioCard SectionImage={app.SectionImage} UserSurveyResponse={app.UserSurveyResponse} ErrorWarning={errorCode} inCompleteRespose={this.state.inCompleteRespose} PushTextDataToObject={(e) => app.GetRadioDataFromComponent(e)} Question={app.state.Question} NextRadioQ={NextRadioQ} NextQuestion={currentQuestion} secondLoop={secondLoop}></RadioCard> : null}
                            {QuestionType === 'checkbox' ?
                                <CheckboxCard SectionImage={app.SectionImage} UserSurveyResponse={app.UserSurveyResponse} ErrorWarning={errorCode} inCompleteRespose={this.state.inCompleteRespose} PushTextDataToObject={(e) => app.GetCheckData(e)} Question={app.state.Question} NextRadioQ={NextRadioQ} NextQuestion={currentQuestion} secondLoop={secondLoop}></CheckboxCard> : null}
                            {QuestionType === 'dropdown' ?
                                this.DropDown(data, VarName) : null}
                            {QuestionType === 'Text display' ?
                                <DisplayTextComponent NextQuestion={currentQuestion} inCompleteRespose={this.state.inCompleteRespose} PushTextDataToObject={(e) => app.DisplayTextNext(e)} DisplayText={app.state.DisplayText} ></DisplayTextComponent> : null}
                        </View>
                    </KeyboardAwareScrollView>
                    {this.state.isListening ? <View style={styles.listeningStyle}>
                        <Text style={{ fontSize: 18, color: '#1E887B', fontFamily: Fonts.Roboto, fontWeight: '600' }}>Speak</Text>
                    </View> : null}
                    {this.state.SpeechLoader ? <View style={styles.listeningStyle}>
                        <Text style={{ fontSize: 18, color: '#1E887B', fontFamily: Fonts.Roboto, paddingRight: 5, fontWeight: '600' }}>Analyzing speech</Text>
                        <DotsLoader color={"#F00"} size={15} />
                    </View> : null}
                    {this.state.HideFooter ? <View style={[styles.footer]}>
                        <TouchableOpacity style={[styles.bottomButtons, { backgroundColor: this.NextPrevToggle == 2 ? (this.QuestionStack.length >= 1 ? '#62CC54' : '#DFF7E2') : '#DFF7E2', height: 50 }]} onPress={() => this.onPressPrev(0)}>
                            {this.QuestionStack.length >= 1 ? <Text style={[styles.footerText, { color: this.NextPrevToggle == 2 ? '#FFFFFF' : '#62CC54' }]}>PREV</Text> : null}
                        </TouchableOpacity>
                        {['IntegerTextBox', 'textbox'].includes(QuestionType) ? <View style={[styles.bottomButtons, { backgroundColor: '#DFF7E2', height: 50, }]}>
                            {!this.state.SpeechLoader ? <VoiceButton ListeningMethod={(e) => this.ListeningMethod(e)} onLoad={(e) => this.OnSpeechLoader(e)} ErrorAlert={(v) => this.ErrorAlert(v)} translationData={(e) => this.translationData(e)}></VoiceButton>
                                : (!this.state.SpeechLoader ? <ActivityIndicator size='large' color="#00ff00" /> : null)}
                        </View> : null}
                        <TouchableOpacity style={[styles.bottomButtons, { backgroundColor: this.NextPrevToggle == 1 ? '#62CC54' : '#DFF7E2', height: 50 }]} onPress={() => this.onPressNext(0)}>
                            <Text style={[styles.footerText, { color: this.NextPrevToggle == 1 ? '#FFFFFF' : '#62CC54' }]}>NEXT</Text>
                        </TouchableOpacity>
                    </View> : null}
                    <View style={styles.MainContainer}>
                        <Modal
                            transparent={true}
                            animationType={"slide"}
                            visible={this.state.ModalVisibleStatus}
                            onRequestClose={() => { this.ShowModalFunction(!this.state.ModalVisibleStatus) }} >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={styles.ModalInsideView}>
                                    <Text style={styles.TextStyle}>{this.ModalText}</Text>
                                    {this.state.YesLoader ? <ActivityIndicator size='small' color="#00ff00" /> : null}
                                    <View style={styles.ModalButtonStyle}>

                                        <TouchableOpacity onPress={() => this.submitChat1()} style={styles.buttonYes}>
                                            <Text style={[styles.buttonText, { color: '#000' }]}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.NoPause()} style={styles.buttonYes}>
                                            <Text style={[styles.buttonText, { color: '#62CC54' }]}>No</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.ShowModalFunction(!this.state.ModalVisibleStatus)} style={styles.buttonYes}>
                                            <Text style={[styles.buttonText, { color: '#AAA' }]}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                    <View style={styles.MainContainer}>
                        <Modal
                            transparent={true}
                            animationType={"slide"}
                            visible={this.state.OfflineModal}
                            onRequestClose={() => { this.ShowModalFunction1(!this.state.OfflineModal) }} >
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={styles.ModalInsideView1}>
                                    <Text style={styles.TextStyle}>{this.ModalText}</Text>

                                    <View style={styles.ModalButtonStyle}>
                                        <TouchableOpacity onPress={() => this.SaveSurvey()} style={styles.buttonYes}>
                                            <Text style={[styles.buttonText, { color: '#000' }]}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.NoPause()} style={styles.buttonYes}>
                                            <Text style={[styles.buttonText, { color: '#62CC54' }]}>No</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.ShowModalFunction1(!this.state.OfflineModal)} style={styles.buttonYes}>
                                            <Text style={[styles.buttonText, { color: '#AAA' }]}>Close</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                    <Snackbar
                        visible={this.state.IsInternetConnected}
                        duration={3000}
                        onDismiss={() => this.setState({ IsInternetConnected: false })}
                        action={{
                            label: 'Ok',
                            onPress: () => {
                            },
                        }}
                        style={{ backgroundColor: '#f44336' }}
                    >
                        No Internet Connection
                    </Snackbar>
                    <Snackbar
                        visible={this.state.IsOnline}
                        duration={2000}
                        onDismiss={() => this.setState({ IsOnline: false })}
                        style={{ backgroundColor: '#009688' }}
                    >
                        You are Online
                    </Snackbar>
                </View >
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        SurveyRedux: state.SurveyRedux,
    };
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        CongratulationFlag,
        SurveyResponse,
        ReTake
    }, dispatch)
);

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(FormBasedSurvey))

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f1f2f7',
        margin: 0,
        flex: 1,
    },
    lottie: {
        width: 100,
        height: 100
    },
    container55: {
        flex: 1,
        justifyContent: 'space-evenly',
        padding: 10,
    },
    ModalButtonStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        justifyContent: 'space-around',
        marginBottom: 10
    },
    listeningStyle: {
        position: 'absolute',
        flex: 0.1,
        left: 0,
        right: 0,
        bottom: 85,
        flexDirection: 'row',
        height: 50,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        flex: 0.1,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
    },
    bottomButtons: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    footerText: {
        fontWeight: '400',
        alignItems: 'center',
        fontSize: 18,
    },
    YesButtonStyle: {
        width: 200,
        height: 30,
        padding: 20,
        marginRight: 50
    },
    NoButtonStyle: {
        height: 30,
        padding: 20,
        marginLeft: 50
    },
    container1: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    ProgressBar: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 25,
        marginRight: 25,
        marginTop: 20
    },
    PrevButton: {
        width: 300,
    },
    NextButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        marginTop: -20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonInner: {

    },
    ErrorTextView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ErrorText: {
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 16,
        color: '#f00',
    },
    button1: {
        height: 50,
        flex: 1,
        justifyContent: 'center',
        marginLeft: 10,
        marginRight: 10,
        borderRadius: 5,
    },
    signupTextCont: {
        flexDirection: 'row',
        height: 70,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingVertical: 10,
        marginVertical: 0,
        marginLeft: 0,
        marginBottom: -15,
        backgroundColor: '#fff'
    },
    checkBoxQ: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    QuestionStyle: {
        flex: 1,
        margin: 20,
        alignItems: 'center',
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        paddingVertical: 5,
        fontSize: 18
    },

    ChatTextField: {
        backgroundColor: '#fff',
        flex: 0.8,
        borderColor: 'white',
        borderWidth: 1,
        marginLeft: 0,
        borderRadius: 50,
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: '400',
        width: 80,
        height: 50,
    },
    button: {
        flex: 1,
        height: 50,
        borderColor: '#f00',
        borderRadius: 25,
        justifyContent: 'center',
        marginLeft: 10
    },

    buttonYes: {
        flex: 0.3,
        width: 50,
        borderRadius: 5,
        marginVertical: 10,
        height: 35,
        justifyContent: 'center',
        margin: 10

    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center'
    },

    picker: {
        alignSelf: 'stretch',
        width: wp('80%'),
        backgroundColor: '#fafafa',
        paddingHorizontal: 8,
        paddingVertical: 10,
        margin: 20,
        borderRadius: 5,
    },
    pickerText: {
        color: 'green',
    },
    ErrorText: {
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 16,
        color: '#f00',
    },
    QuestionStyle1: {
        flex: 1,
        marginLeft: 15,
        marginRight: 15,
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: '#f1f2f7',
        paddingVertical: 5,
    },
    MainContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: (Platform.OS == 'ios') ? 20 : 0

    },
    ModalInsideView: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        width: '90%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    ModalInsideView1: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
        width: '90%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc'
    },

    TextStyle: {
        marginTop: 10,
        fontSize: 16,
        marginBottom: 5,
        color: "#000",
        padding: 15,
        textAlign: 'center'
    },
    customStyle: {
        fontFamily: Fonts.Roboto,
        fontSize: 14
    },
    customStyle1: {
        fontFamily: Fonts.Roboto,
        fontSize: 16
    }
});
