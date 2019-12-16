import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView
} from 'react-native';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import QuestionImage from './QuestionImage'
import { Fonts } from '../../../utils/fonts'
var RadioData = null
var UserSurveyResponseP = {}
var RadioText = ""

/*
Display radio button survey's question here
*/
export default class RadioCard extends Component {
    constructor() {
        super();
        this.state = {
            chat: "",
            text: "", 
            value: "",
            questionText: "",
            Question: null,
            NextRadioQ: -1,
            QNumber: 0,
            secondLoop: 0,
            RadData: "",
            RadioQuestion: [],
            RadioIndex: -1,
            ErrorWarning: -1,
            SectionImage: []
        }
        this.RadioArray = [{}]
    }

    GetUserResponseObject(varName, inCompleteRespose) {
        var isValid = 0
        this.setState({ RadioIndex: varName.attributes.varName })
        if (UserSurveyResponseP[varName.attributes.varName] !== undefined && UserSurveyResponseP[varName.attributes.varName] !== null) {
            isValid = 0
        } else {
            UserSurveyResponseP[varName.attributes.varName] = null;
            isValid = 1
        }
        if (inCompleteRespose == 1 && isValid == 0) {
            this.props.PushTextDataToObject({ isValid, check: 0, inCompleteRespose, UserSurveyResponseP })
        } else {
            this.props.PushTextDataToObject({ isValid, check: 0, UserSurveyResponseP, inCompleteRespose })
        }
    }

    componentDidMount() {
        this.setState({ ErrorWarning: this.props.ErrorWarning })
        UserSurveyResponseP = this.props.UserSurveyResponse
        this.setState({ RadioQuestion: [] })
        this.setState({ RadioQuestion: this.props.Question.response.fixed.category })
        this.setState({ NextRadioQ: this.props.NextRadioQ })
        this.setState({ Question: this.props.Question })
        this.setState({ questionText: this.props.Question.text })
        this.setState({ QNumber: this.props.NextQuestion })
        this.setState({ SectionImage: this.props.SectionImage })
        RadioText = ""
        if (this.props.Question.subQuestion !== undefined && this.props.Question.subQuestion !== null) {
            RadioText = this.props.Question.subQuestion[this.props.NextRadioQ].text
            this.GetUserResponseObject(this.props.Question.subQuestion[this.props.NextRadioQ], this.props.inCompleteRespose)
        } else {
            this.GetUserResponseObject(this.props.Question.response, this.props.inCompleteRespose)
        }
        this.setState({ secondLoop: this.props.secondLoop })
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.Question !== nextProps.Question || this.props.secondLoop !== nextProps.secondLoop || this.props.NextRadioQ !== nextProps.NextRadioQ) {
            this.setState({ RadioQuestion: [] })
            this.setState({ RadioQuestion: nextProps.Question.response.fixed.category })
            UserSurveyResponseP = nextProps.UserSurveyResponse
            this.setState({ Question: nextProps.Question })
            this.setState({ questionText: nextProps.Question.text })
            this.setState({ NextRadioQ: nextProps.NextRadioQ })
            this.setState({ QNumber: nextProps.NextQuestion })
            RadioText = ""
            if (nextProps.Question.subQuestion !== undefined && nextProps.Question.subQuestion !== null) {
                RadioText = nextProps.Question.subQuestion[nextProps.NextRadioQ].text
                this.GetUserResponseObject(nextProps.Question.subQuestion[nextProps.NextRadioQ], nextProps.inCompleteRespose)
            } else {
                this.GetUserResponseObject(nextProps.Question.response, nextProps.inCompleteRespose)
            }
            this.setState({ secondLoop: nextProps.secondLoop })
            this.setState({ SectionImage: nextProps.SectionImage })
            return true;
        }
        if (this.props.ErrorWarning !== nextProps.ErrorWarning) {
            this.setState({ ErrorWarning: nextProps.ErrorWarning })
            return true;
        }
        return true;
    }

    onSelect(index, value) {
        RadioData = value
        var VarName = null
        if (this.state.Question.subQuestion !== undefined && this.state.Question.subQuestion !== null) {
            VarName = this.state.Question.subQuestion[this.state.NextRadioQ]
        } else {
            VarName = this.state.Question.response
        }
        UserSurveyResponseP[VarName.attributes.varName] = value;
        if (RadioData !== null) {
            this.props.PushTextDataToObject({ isValid: 0, RadioData, check: 1, UserSurveyResponseP })
        } else {
            this.props.PushTextDataToObject({ isValid: 1, RadioData, check: 1, UserSurveyResponseP })
        }
        this.setState({ RadData: value })
    }

    findIndex() {
        var index = this.state.RadioQuestion.map(item => item.value).indexOf(UserSurveyResponseP[this.state.RadioIndex]);
        return index
    }

    render() {
        var firstQ = (
            <View>
                <Text
                    style={[styles.customStyle1,{
                        padding: 5,
                        color: '#000',
                        fontWeight: '600'
                    }]}
                ><Text
                    style={[styles.customStyle1,{
                        color: 'red',
                        fontWeight: '600'
                    }]}
                >*</Text>{this.state.questionText}</Text>
                {RadioText !== "" ?
                    <Text
                        style={[styles.customStyle,{
                            padding: 5,
                            color: '#000',
                        }]}
                    >{RadioText}</Text> : null}
            </View>
        )
        var firstOptionQ = null
        if (this.state.RadioQuestion.length > 0) {
            firstOptionQ = this.state.RadioQuestion.map((item, index) => {
                return (<RadioButton value={item.value} key={index}
                >
                    <Text
                        style={[styles.customStyle,{
                            paddingLeft: 10,
                            paddingRight: 30,
                            color: '#000',
                        }]}
                    >{(item.label).trim()}</Text>
                </RadioButton>)
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
                            <Text style={[styles.customStyle,styles.ErrorText]}>This question is mandatory</Text>
                        </View> : null}
                    <View
                        style={{
                            flexDirection: 'row',
                            paddingLeft: 10,
                            marginTop: 15,
                            marginLeft: 15,
                            marginRight: 15,
                            backgroundColor: '#f1f2f7',
                        }}
                    >
                        <View
                            style={{
                                width: wp('100%'),
                                flexDirection: 'column',
                            }}
                        >
                            <View
                                style={styles.checkBoxQ}
                            >
                                <RadioGroup
                                    color='#62CC54'
                                    onSelect={(index, value) => this.onSelect(index, value)}
                                    style={{
                                        width: '100%',
                                        marginRight: 20,
                                        paddingRight: 20
                                    }}
                                    selectedIndex={this.findIndex()}
                                >
                                    {firstOptionQ}
                                </RadioGroup>
                            </View >
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
        width: wp('100%'),
        alignItems: 'center',
        flexDirection: 'row',
        paddingBottom: 50,
        marginRight: 20,
        overflow: 'hidden'
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
    customStyle1: {
        fontFamily: Fonts.Roboto,
        fontSize: 16
    },
    customStyle: {
        fontFamily: Fonts.Roboto,
        fontSize: 14
    },
    customBoldStyle: {
        // fontFamily: Fonts.NotoSansBold,
        fontSize: 14
    }
});
