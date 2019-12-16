import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import QuestionImage from './QuestionImage'
import Feather from 'react-native-vector-icons/Feather';
import { Fonts } from '../../../utils/fonts'
var TextValidationArray = [];
var TextErrorWarning = 0
var UserSurveyResponseP = {}

/*
Display text input survey's questions here
*/
export default class TextInputCard extends Component {
    constructor() {
        super();
        this.state = {
            Array: [],
            Trigger: null,
            chat: "",
            text: "",
            value: "",
            checked: false,
            NextQ: 1,
            QuestionsSection: [],
            WordsArray: [],
            Question: null,
            email: "",
            QNumber: 0,
            SurveyAns: [],
            ErrorWarning: -1,
            AutoFocused: -1,
            AutoFocu: 0,
            SectionImage: [],
        }
        this.questionText = ""
        this.inputRef = []
        this.TextInputFocusArray = []
        this.ConcatWordsArray = []
    }

    GetUserResponseObject(len, data, inCompleteRespose) {
        var isValid = 0
        var validation = []
        TextValidationArray = []
        for (let i = 0; i < len; i++) {
            validation[i] = false
            this.inputRef[i] = i
            if (UserSurveyResponseP[data[i].attributes.varName] == undefined) {
                UserSurveyResponseP[data[i].attributes.varName] = ""
            }
            if (UserSurveyResponseP[data[i].attributes.varName] == undefined || UserSurveyResponseP[data[i].attributes.varName] == null || UserSurveyResponseP[data[i].attributes.varName] == "") {
                isValid = 1
            }
        }
        TextValidationArray = validation
        if (inCompleteRespose == 1 && isValid == 0) {
            this.props.PushTextDataToObject({ isValid, inCompleteRespose: 1, UserSurveyResponseP })
        } else {
            this.props.PushTextDataToObject({ isValid, inCompleteRespose: 0, UserSurveyResponseP })
        }
        this.setState({ AutoFocused: 0 })
    }

    AutoFillTranslationData(len, data, inCompleteRespose, WordsArray) {
        var isValid = 0
        var validation = []
        TextValidationArray = []
        let FilteredWords = []
        if (WordsArray.length > 0) {
            FilteredWords = WordsArray.filter(function (el) {
                return el != null && el != "" && el != undefined
            })
        }
        if (FilteredWords.length > 0) {
            let DataLength = FilteredWords.length
            var regex = /[.,]/g;
            for (let i = 0; i < DataLength; i++) {
                FilteredWords[i] = FilteredWords[i].replace(regex, '');
            }
        }
        if (this.ConcatWordsArray.length == 0) {
            this.ConcatWordsArray = FilteredWords
        } else {
            const CLen = Number(this.ConcatWordsArray.length)
            const FLen = Number(FilteredWords.length)
            if (FilteredWords.length > 0) {
                for (let j = 0; j < FLen; j++) {
                    for (let k = 0; k < CLen + FLen; k++) {
                        if (this.ConcatWordsArray[k] == null || this.ConcatWordsArray[k] == '' || this.ConcatWordsArray[k] == undefined) {
                            this.ConcatWordsArray[k] = FilteredWords[j]
                            break;
                        }
                    }
                }
            }
        }
        for (let x = 0; x < this.ConcatWordsArray.length; x++) {
            let i = x%len
            validation[i] = false
            this.inputRef[i] = i
            if (UserSurveyResponseP[data[i].attributes.varName] == undefined) {
                if (this.ConcatWordsArray[x] == undefined) {
                    UserSurveyResponseP[data[i].attributes.varName] = ""
                } else {
                    UserSurveyResponseP[data[i].attributes.varName] = this.ConcatWordsArray[x]
                }
            } else {
                if (this.ConcatWordsArray[x] == undefined) {
                    if (!UserSurveyResponseP[data[i].attributes.varName]) {
                        UserSurveyResponseP[data[i].attributes.varName] = ""
                    }
                } else {
                    UserSurveyResponseP[data[i].attributes.varName] = this.ConcatWordsArray[x]
                }
            }
            if (UserSurveyResponseP[data[i].attributes.varName] == undefined || UserSurveyResponseP[data[i].attributes.varName] == null || UserSurveyResponseP[data[i].attributes.varName] == "") {
                isValid = 1
            }
        }
        TextValidationArray = validation
        TextErrorWarning = 0
        if (inCompleteRespose == 1 && isValid == 0) {
            this.props.PushTextDataToObject({ isValid, inCompleteRespose: 1, UserSurveyResponseP })
        } else {
            this.props.PushTextDataToObject({ isValid, inCompleteRespose: 0, UserSurveyResponseP })
        }
        this.setState({ AutoFocused: Math.random() + Math.random() })
    }

    componentWillMount() {
        UserSurveyResponseP = this.props.UserSurveyResponse
    }

    componentDidMount() {
        AutoFocu = 0
        this.ConcatWordsArray = []
        TextValidationArray = []
        UserSurveyResponseP = this.props.UserSurveyResponse
        this.GetUserResponseObject(this.props.Question.subQuestion.length, this.props.Question.subQuestion, this.props.inCompleteRespose)
        this.setState({ SectionImage: this.props.SectionImage })
        this.setState({ ErrorWarning: this.props.ErrorWarning })
        this.setState({ AutoFocused: 0 })
        if (this.props.Question !== null) {
            this.setState({ Question: this.props.Question })
            this.questionText = this.props.Question.text
            this.setState({ QNumber: this.props.NextQuestion })
            this.setState({ SurveyAns: this.props.SurveyAns })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.Question !== nextProps.Question || this.props.NextQuestion !== nextProps.NextQuestion || this.props.secondLoop !== nextProps.secondLoop) {
            TextValidationArray = []
            AutoFocu = 0
            this.ConcatWordsArray = []
            UserSurveyResponseP = nextProps.UserSurveyResponse
            this.GetUserResponseObject(nextProps.Question.subQuestion.length, nextProps.Question.subQuestion, nextProps.inCompleteRespose)
            this.setState({ Question: nextProps.Question })
            this.questionText = nextProps.Question.text
            this.setState({ QNumber: nextProps.NextQuestion })
            this.setState({ SurveyAns: this.props.SurveyAns })
            this.setState({ SectionImage: nextProps.SectionImage })
            this.setState({ AutoFocused: 0 })
            return true;
        }
        if (this.props.ErrorWarning !== nextProps.ErrorWarning) {
            this.ShowValidationError(nextProps.ErrorWarning);
            this.setState({ ErrorWarning: nextProps.ErrorWarning })
            return true;
        }
        if (this.props.TranslationDataArray != nextProps.TranslationDataArray) {
            this.AutoFillTranslationData(nextProps.Question.subQuestion.length, nextProps.Question.subQuestion, nextProps.inCompleteRespose, nextProps.TranslationDataArray)
            return true;
        }
        return true;
    }

    ShowValidationError(error) {
        if (error > 0) {
            let i = 0
            for (i = 0; i < this.state.Question.subQuestion.length; i++) {
                if (UserSurveyResponseP[this.state.Question.subQuestion[i].attributes.varName] == "") {
                    TextValidationArray[i] = true
                }
            }
            this.setState({ SurveyAns: 7 + Math.random() })
        }
    }

    ValidateWhiteSpace(text) {
        return /\s/g.test(text);
    }

    ValidationText = (text, id) => {
        var re = /^[a-zA-ZäöåÄÖÅ]+$/;
        if (id == 0) {
            return re.test(text.trim());
        } else {
            return re.test(text);
        }
    }

    RemoveDataFromTheTextBox(index, varName) {
        UserSurveyResponseP[varName] = ""
        this.ConcatWordsArray[index] = ""
        this.setState({ Trigger: index + varName })
        var isValid = 1, jumpFlag = 0;
        this.props.PushTextDataToObject({ isValid, jumpFlag, UserSurveyResponseP })
    }

    HandleTextChange(value, index, varName) {
        this.setState({ AutoFocused: index })
        AutoFocu = index
        this.setState({ ErrorWarning: -5 })
        let isValid = 0
        let jumpFlag = 0
        if (this.ValidationText(value, 0)) {
            TextErrorWarning = 0
            isValid = 0
        } else {
            TextErrorWarning = 1
            isValid = 1
        }
        UserSurveyResponseP[varName] = value.trim();
        this.ConcatWordsArray[index] = value.trim();
        for (let j = 0; j < this.state.Question.subQuestion.length; j++) {
            if (UserSurveyResponseP[varName] && index == j) {
                TextValidationArray[j] = false
            }
            if ((UserSurveyResponseP[varName] == null || UserSurveyResponseP[varName] == "" || UserSurveyResponseP[varName] == 'null') && index == j) {
                TextValidationArray[j] = true
                isValid = 1
            }
        }
        var FieldsValueStatus = false
        var ValueStatus = false
        var FieldsValueStatus1 = true
        var ValueStatus1 = true
        for (let j = 0; j < this.state.Question.subQuestion.length; j++) {
            var keyName = this.state.Question.subQuestion[j].attributes.varName
            if ((UserSurveyResponseP[keyName] !== null && UserSurveyResponseP[keyName] !== "") && this.ValidateWhiteSpace(value)) {
                FieldsValueStatus = true
            } else {
                FieldsValueStatus1 = false
            }
            if (UserSurveyResponseP[keyName] !== null && UserSurveyResponseP[keyName] !== "") {
                ValueStatus = true
            } else {
                ValueStatus1 = false
            }
        }
        isValid = 1
        this.setState({ SurveyAns: 9 })
        if (ValueStatus && ValueStatus1) {
            jumpFlag = 0
            isValid = 0
            for (let j = 0; j < this.state.Question.subQuestion.length; j++) {
                var keyName = this.state.Question.subQuestion[j].attributes.varName
                if (!this.ValidationText(UserSurveyResponseP[keyName], 0)) {
                    TextErrorWarning = 1
                    isValid = 1
                }
            }
        }
        if (FieldsValueStatus && FieldsValueStatus1) {
            jumpFlag = 1
            isValid = 0
            for (let j = 0; j < this.state.Question.subQuestion.length; j++) {
                var keyName = this.state.Question.subQuestion[j].attributes.varName
                if (!this.ValidationText(UserSurveyResponseP[keyName], 0)) {
                    TextErrorWarning = 1
                    isValid = 1
                }
            }
        }
        if (this.ValidateWhiteSpace(value)) {
            if (isValid == 1) {
                this.OnSubmitData(index)
            }
        }
        this.props.PushTextDataToObject({ isValid, jumpFlag, UserSurveyResponseP })
    }

    OnSubmitData(index) {
        let length = 0
        if (this.state.Question.subQuestion.length > 0) {
            length = this.state.Question.subQuestion.length
        }
        if (length - 1 == index) {
            this.TextInputFocusArray[0].focus()
        } else {
            this.TextInputFocusArray[index + 1].focus()
        }
    }

    render() {
        var firstQ = (
            <Text
                style={[styles.customStyle1, {
                    padding: 5,
                    color: '#000',
                    fontWeight: '600',
                }]}
            >
                <Text
                    style={[styles.customStyle1, {
                        color: 'red',
                        fontWeight: '600',
                    }]}
                >*</Text>
                {this.questionText}</Text>
        )
        if (this.state.Question) {
            if (this.state.Question.subQuestion.length > 0) {
                var firstOptionQ = this.state.Question.subQuestion.map((item, index) => {
                    return <View key={index}
                        style={styles.checkBoxQ}
                    >
                        <Text
                            style={[styles.customStyle, {
                                padding: 5,
                                color: '#000',
                            }, TextValidationArray[index] ? styles.Validateerror1 : null]}
                        >{item.text}</Text>
                        <TextInput style={[styles.input, styles.customStyle, TextValidationArray[index] ? styles.Validateerror : null]}
                            underlineColorAndroid="transparent"
                            placeholder=""
                            placeholderTextColor="#757575"
                            autoCapitalize="none"
                            ref={(input) => this.TextInputFocusArray[index] = input}
                            onSubmitEditing={() => this.OnSubmitData(index)}
                            value={UserSurveyResponseP[item.attributes.varName]}
                            onChangeText={(e) => this.HandleTextChange(e, index, item.attributes.varName)}
                        />
                        <TouchableOpacity
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                top: -20,
                                left: -15,
                                backgroundColor: '#DDD',
                                borderRadius: 50,
                            }}
                            onPress={() => this.RemoveDataFromTheTextBox(index, item.attributes.varName)}
                        >
                            <Feather onPress={() => this.RemoveDataFromTheTextBox(index, item.attributes.varName)} style={{ padding: 5, margin: 0 }} name="minus" size={18} color="#F00" />
                        </TouchableOpacity>
                    </View >
                })
            }
        }
        return (

            <View style={styles.container}>
                <View
                >
                    <View
                        style={styles.QuestionStyle}
                    >
                        {firstQ}
                    </View>
                    <View style={{
                        flex: 1, marginTop: 20,
                    }}>
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            {this.state.SectionImage.map((item, index) => {
                                return <QuestionImage imageUri={item}
                                    key={index} />
                            })}

                        </ScrollView>
                    </View>
                    {this.state.ErrorWarning > 0 ?
                        <View
                            style={styles.QuestionStyle1}
                        >
                            <Text style={[styles.customStyle, styles.ErrorText]}>This question is mandatory</Text>
                        </View> : null}
                    {TextErrorWarning === 1 ?
                        <View
                            style={styles.QuestionStyle1}
                        >
                            <Text style={[styles.customStyle, styles.ErrorText]}>Please check the format of your answer.</Text>
                        </View> : null}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingLeft: 10,
                            marginLeft: 15,
                            marginRight: 15,
                            backgroundColor: '#f1f2f7',
                        }}
                    >
                        <View
                            style={{
                                alignItems: 'center',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                paddingTop: 10,
                                paddingBottom: 50,
                                width: wp('100%')
                            }}
                        >
                            {firstOptionQ}
                        </View>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f1f2f7',
        flex: 1,
    },
    input: {
        marginLeft: 15,
        marginTop: 15,
        marginBottom: 15,
        height: 45,
        paddingLeft: 10,
        borderColor: '#9e9e9e',
        borderWidth: 2,
        borderRadius: 5,
        width: wp('50%')
    },
    checkBoxQ: {
        alignItems: 'center',
        flexDirection: 'row',
        width: wp('100%')
    },
    QuestionStyle: {
        flex: 1,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: '#f1f2f7',
        borderRadius: 5,
        paddingVertical: 5,
    },
    ErrorText: {
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 10,
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
    Validateerror: {
        borderColor: 'red',
        borderWidth: 2
    },
    Validateerror1: {
        color: 'red'
    },
    customStyle: {
        fontFamily: Fonts.Roboto,
        fontSize: 14
    },
    customStyle1: {
        fontFamily: Fonts.Roboto,
        fontSize: 16
    },
    customBoldStyle: {
        // fontFamily: Fonts.NotoSansBold,
        fontSize: 14
    }
});