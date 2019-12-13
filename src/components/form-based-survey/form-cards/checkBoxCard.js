import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import QuestionImage from './QuestionImage'
import { Fonts } from '../../../utils/fonts'

var checkBoxData = []
var CheckBoxArray = []
var UserSurveyResponseP = {}
var CheckBoxIndex = -1
export default class CheckBoxCard extends Component {
    constructor() {
        super();
        this.state = {
            Array: [],
            ChatArray: [],
            chat: "",
            text: "", value: "",
            checked: false,
            NextQ: 1,
            QuestionsSection: [],
            questionText: "",
            Question: { response: [] },
            CheckBoxQuestionData: [],
            email: "",
            QNumber: 0,
            QuestionData: "",
            ErrorWarning: -1,
            SectionImage: []
        }
    }
    GetUserResponseObject(len, data, inCompleteRespose) {
        var isValid = 1
        for (let i = 0; i < len; i++) {
            if (UserSurveyResponseP[data[i].attributes.varName] == undefined) {
                UserSurveyResponseP[data[i].attributes.varName] = null
            }
            if (UserSurveyResponseP[data[i].attributes.varName]) {
                isValid = 0
            }
        }
        if (inCompleteRespose == 1 && isValid == 0) {
            this.props.PushTextDataToObject({ isValid, jumpFlag: 0, inCompleteRespose, UserSurveyResponseP })
        } else {
            this.props.PushTextDataToObject({ isValid, jumpFlag: 0, inCompleteRespose, UserSurveyResponseP })
        }

    }
    componentDidMount() {
        console.log(this.props.Question)
        this.setState({ ErrorWarning: this.props.ErrorWarning })
        this.setState({ CheckBoxQuestionData: this.props.Question.response })
        UserSurveyResponseP = this.props.UserSurveyResponse
        console.log('UserSurveyResponse==', UserSurveyResponseP)
        this.setState({ Question: this.props.Question })
        this.setState({ questionText: this.props.Question.text })
        this.setState({ QNumber: this.props.NextQuestion })
        this.setState({ SectionImage: this.props.SectionImage })
        this.GetUserResponseObject(this.props.Question.response.length, this.props.Question.response, this.props.inCompleteRespose)

    }
    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.Question !== nextProps.Question) {

            this.setState({ CheckBoxQuestionData: nextProps.Question.response })
            UserSurveyResponseP = nextProps.UserSurveyResponse
            console.log('UserSurveyResponse=next=', UserSurveyResponseP)
            this.setState({ Question: nextProps.Question })
            this.setState({ questionText: nextProps.Question.text })
            this.setState({ QNumber: nextProps.NextQuestion })
            this.setState({ SectionImage: nextProps.SectionImage })
            this.GetUserResponseObject(nextProps.Question.response.length, nextProps.Question.response, nextProps.inCompleteRespose)
            return true;
        }
        if (this.props.ErrorWarning !== nextProps.ErrorWarning) {
            this.setState({ ErrorWarning: nextProps.ErrorWarning })
            return true;
        }
        return true;
    }

    HandleCheckBox(value, index) {
        console.log(value, index);
        var VarName = this.state.Question.response[index]

        if (UserSurveyResponseP[VarName.attributes.varName]) {
            UserSurveyResponseP[VarName.attributes.varName] = null;
        } else {
            UserSurveyResponseP[VarName.attributes.varName] = value;
        }
        // UserSurveyResponseP[VarName.attributes.varName] = value;

        this.setState({ QuestionData: value + 1 })
        console.log('app===', UserSurveyResponseP[VarName.attributes.varName]);
        var isValid = 1
        let jumpFlag = 0
        let flag = true
        var data = this.state.Question.response
        for (let i = 0; i < data.length; i++) {
            if (UserSurveyResponseP[data[i].attributes.varName]) {
                jumpFlag = 0
                isValid = 0
            }
        }
        for (let i = 0; i < data.length; i++) {
            if (UserSurveyResponseP[data[i].attributes.varName] == null) {
                flag = false
            }
        }

        if (flag) {
            jumpFlag = 1
            isValid = 0
            this.props.PushTextDataToObject({ isValid, jumpFlag, UserSurveyResponseP })
            return;
        }
        this.setState({ QuestionData: value })
        this.props.PushTextDataToObject({ isValid, jumpFlag, UserSurveyResponseP })
    }
    render() {
        console.log(this.state.Question.response, this.state.CheckBoxQuestionData)
        var firstQ = (
            <Text
                style={[styles.customStyle1, {
                    // fontSize: 20,
                    padding: 5,
                    color: '#000',
                    fontWeight: '600'
                }]}
            ><Text
                style={[styles.customStyle1, {
                    // fontSize: 20,
                    color: 'red',
                    fontWeight: '600'
                }]}
            >*</Text>{this.state.questionText}</Text>
        )
        var firstOptionQ = null
        if (this.state.CheckBoxQuestionData.length > 0 || this.state.CheckBoxQuestionData) {
            firstOptionQ = this.state.CheckBoxQuestionData.map((item, index) => {
                return (<CheckBox key={index}
                    containerStyle={{
                        backgroundColor: '#f1f2f7',
                    }}
                    checkedColor="#62CC54"
                    textStyle={{
                        // fontSize: 16,
                        // fontFamily: Fonts.NotoSans,
                        fontSize: 14,
                        color: '#000',
                        fontWeight: 'normal'
                    }}
                    size={30}
                    fontFamily={Fonts.Roboto}
                    title={item.fixed.category.label}
                    // value={item.fixed.category.value}
                    checked={UserSurveyResponseP[item.attributes.varName] === item.fixed.category.value}
                    onPress={() => this.HandleCheckBox(item.fixed.category.value, index)}
                />)
            })

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
                    {this.state.SectionImage.length > 0 ? <View style={{
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
                    </View> : null}
                    {this.state.ErrorWarning >0 ?
                        <View
                            style={styles.QuestionStyle1}
                        >
                            <Text style={[styles.customStyle, styles.ErrorText]}>This question is mandatory</Text>
                        </View> : null}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            // paddingLeft: 10,
                            marginLeft: 15,
                            marginRight: 15,
                            backgroundColor: '#f1f2f7',
                        }}
                    >
                        <View
                            style={{
                                // alignItems: 'center',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                paddingTop: 10,
                                paddingBottom: 50

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

    checkBoxQ: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        // margin: 50,
        // width: hp('100%')
    },
    QuestionStyle: {
        flex: 1,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        // alignItems: 'center',
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: '#f1f2f7',
        borderRadius: 5,
        paddingVertical: 5,
        // fontSize: 18
    },
    ErrorText: {
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 10,
        // fontSize: 16,
        color: '#f00',
        // marginVertical: 15
    },
    QuestionStyle1: {
        flex: 1,
        marginLeft: 15,
        marginRight: 15,
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: '#f1f2f7',
        paddingVertical: 5,
        // fontSize: 18
    },
    customStyle: {
        fontFamily: Fonts.Roboto,
        fontSize: 14
    },
    customStyle1: {
        fontFamily: Fonts.Roboto,
        fontSize: 16
    },

});