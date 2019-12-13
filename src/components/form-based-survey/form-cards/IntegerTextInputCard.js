import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import QuestionImage from './QuestionImage'
import { withNavigation } from 'react-navigation';
import { bindActionCreators } from 'redux';
import { SurveyResponse } from '../../../redux/surveyAction'
import { connect } from 'react-redux';
import { Fonts } from '../../../utils/fonts'
import Feather from 'react-native-vector-icons/Feather';


var UserSurveyResponseP = {}
var ValidationProperties = {}
var QuestionID = 0
class IntegerTextInputCard extends Component {
    constructor() {
        super();
        this.state = {
            text: "", value: "",
            Trigger: '',
            questionText: "",
            Question: null,
            email: "",
            QNumber: 0,
            secondLoop: 0,
            text: "",
            ErrorWarning: -1,
            IntTextName: null,
            SectionImage: [],
            QValidation: 0
        }
    }
    GetUserResponseObject(varName, inCompleteRespose) {
        var isValid = 0
        console.log('attributes===', UserSurveyResponseP[varName.attributes.varName])
        this.setState({ IntTextName: varName.attributes.varName })
        if (UserSurveyResponseP[varName.attributes.varName] !== undefined && UserSurveyResponseP[varName.attributes.varName] !== null) {
            isValid = 0
            // this.props.PushTextDataToObject({ isValid,jumpFlag: 0, UserSurveyResponseP })
        } else {
            UserSurveyResponseP[varName.attributes.varName] = null;
            isValid = 1

        }
        console.log('UserSurveyResponseP---->>>>>isValid 111', UserSurveyResponseP, isValid)
        if (inCompleteRespose == 1 && isValid == 0) {
            this.props.PushTextDataToObject({ isValid, jumpFlag: 0, inCompleteRespose, UserSurveyResponseP })
        } else {
            this.props.PushTextDataToObject({ isValid, jumpFlag: 0, inCompleteRespose, UserSurveyResponseP })
        }
    }
    AutoFillTranslationData(varName, inCompleteRespose, WordsArray) {
        var isValid = 0
        console.log('attributes===', UserSurveyResponseP[varName.attributes.varName])
        var regex = /[.,]/g;
        WordsArray[0] = WordsArray[0].replace(regex, '');
        this.setState({ IntTextName: varName.attributes.varName })
        if (UserSurveyResponseP[varName.attributes.varName] !== undefined && UserSurveyResponseP[varName.attributes.varName] !== null) {
            isValid = 0
            if (WordsArray[0] != undefined) {
                UserSurveyResponseP[varName.attributes.varName] = WordsArray[0]
            }
            // this.props.PushTextDataToObject({ isValid,jumpFlag: 0, UserSurveyResponseP })
        } else {
            if (WordsArray[0] != undefined) {
                isValid = 0
                UserSurveyResponseP[varName.attributes.varName] = WordsArray[0]
            } else {
                isValid = 0
                if (!UserSurveyResponseP[varName.attributes.varName]) {
                    isValid = 1
                    UserSurveyResponseP[varName.attributes.varName] = null;
                }

            }
        }
        console.log('UserSurveyResponseP---->>>>>isValid  222', UserSurveyResponseP, isValid)
        if (inCompleteRespose == 1 && isValid == 0) {
            this.props.PushTextDataToObject({ isValid, jumpFlag: 0, inCompleteRespose, UserSurveyResponseP })
        } else {
            this.props.PushTextDataToObject({ isValid, jumpFlag: 0, inCompleteRespose, UserSurveyResponseP })
        }
        console.log('UserSurveyResponseP---->>>>>', UserSurveyResponseP)
    }
    componentDidMount() {
        console.log(this.props.Question)
        UserSurveyResponseP = this.props.UserSurveyResponse
        ValidationProperties = this.props.ValidationProperties
        QuestionID = this.props.QuestionID
        this.GetQuestionValidation(this.props.ValidationProperties, this.props.Question)
        console.log('UserSurveyResponse==', UserSurveyResponseP)
        console.log('Integer=QQ=did=', this.props.Question)
        this.setState({ ErrorWarning: this.props.ErrorWarning })
        this.setState({ Question: this.props.Question })
        this.setState({ questionText: this.props.Question.text })
        this.setState({ QNumber: this.props.NextQuestion })
        this.setState({ secondLoop: this.props.secondLoop })
        this.setState({ SectionImage: this.props.SectionImage })
        this.setState({ ErrorWarning: this.props.ErrorWarning })
        this.props.SurveyResponse(UserSurveyResponseP)
        console.log('props.secondLoop=next=', this.props.secondLoop, this.props.NextRadioQ)

        this.GetUserResponseObject(this.props.Question.response, this.props.inCompleteRespose)
    }
    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.Question !== nextProps.Question) {
            console.log('Integer=QQ=next=', nextProps.Question)
            UserSurveyResponseP = nextProps.UserSurveyResponse
            ValidationProperties = nextProps.ValidationProperties;
            QuestionID = nextProps.QuestionID
            this.GetQuestionValidation(nextProps.ValidationProperties, nextProps.Question)
            console.log('UserSurveyResponse=next=', ValidationProperties, UserSurveyResponseP)
            this.setState({ Question: nextProps.Question })
            this.setState({ questionText: nextProps.Question.text })
            this.setState({ QNumber: nextProps.NextQuestion })
            this.setState({ secondLoop: nextProps.secondLoop })
            this.setState({ SectionImage: nextProps.SectionImage })
            console.log('UsnextProps.secondLoop=next=', nextProps.secondLoop, nextProps.NextRadioQ)
            this.GetUserResponseObject(nextProps.Question.response, nextProps.inCompleteRespose)
            this.props.SurveyResponse(UserSurveyResponseP)

            return true;
        }
        if (this.props.ErrorWarning !== nextProps.ErrorWarning) {
            this.setState({ ErrorWarning: nextProps.ErrorWarning })
            return true;
        }
        if (this.props.TranslationDataArray != nextProps.TranslationDataArray) {
            console.log('nextProps.TranslationDataArray=>>>', this.props.TranslationDataArray, nextProps.TranslationDataArray)
            this.AutoFillTranslationData(this.props.Question.response, this.props.inCompleteRespose, nextProps.TranslationDataArray)
            return true;
        }
        return true;
    }
    GetQuestionValidation(ValidationProperties5, Question) {
        var ValidationArray = []
        for (let property in ValidationProperties5) {
            console.log(property, ValidationProperties5, ValidationProperties5[property], ValidationProperties5[property].attributes)
            if (ValidationProperties5[property].gid == QuestionID) {
                console.log('fouund===>>>', ValidationProperties5[property])
                ValidationArray.push(ValidationProperties5[property])
            }
        }
        console.log('foValidationArray>>>', ValidationArray)
        var ValidationValues = null
        for (let j = 0; j < ValidationArray.length; j++) {
            console.log('foValidationArray>>>', Question.response.attributes.varName, ValidationArray[j].title)
            if (Question.response.attributes.varName == ValidationArray[j].title) {
                // this.setState({QValidation: ValidationArray[j].attributes})
                ValidationValues = ValidationArray[j].attributes
                console.log('foValidationArray>>>', ValidationArray[j].attributes)
            }
        }
        console.log('ValidationValues>>======>', ValidationValues)
        if (ValidationValues) {
            console.log('min_num_value_n', ValidationValues.min_num_value_n)
            if (ValidationValues.min_num_value_n !== undefined) {
                this.setState({ QValidation: ValidationValues.min_num_value_n })
            } else {
                this.setState({ QValidation: 0 })
            }
        }
    }
    BreakTheSurvey(value) {
        console.log('break-->>', value, this.state.QValidation)
        if (this.state.QValidation == 0) {
            return 1;
        } else {
            console.log('QValidation==>>', Number(this.state.QValidation), this.state.QValidation, value, Number(this.state.QValidation) < Number(value))
            if (Number(this.state.QValidation) < Number(value)) {
                return 1;
            } else {
                return 0;
            }
        }
    }
    ValidateWhiteSpace(text) {
        return /\s/g.test(text);
    }
    RemoveDataFromTheTextBox(varName) {
        console.log(varName)
        UserSurveyResponseP[varName] = ""
        this.setState({ Trigger: varName + Math.random() })
        var isValid = 1, jumpFlag = 0, status = -1;
        this.props.PushTextDataToObject({ isValid, jumpFlag, UserSurveyResponseP, status })
    }
    HandleTextChange(value) {
        let app = this
        let isValid = 0
        let jumpFlag = 0
        if (value) {
            isValid = 0;
            this.setState({ text: value })
        } else {
            isValid = 1;
            this.setState({ text: value })
        }
        var status = this.BreakTheSurvey(value)
        console.log('integer status===>>>>', status)

        UserSurveyResponseP[this.state.Question.response.attributes.varName] = value;
        this.props.SurveyResponse(UserSurveyResponseP)
        if (this.ValidateWhiteSpace(value) && value) {
            jumpFlag = 1
            isValid = 0;
            console.log('integer status===>>>>1', isValid, status, jumpFlag)
            if (status == 0) {
                app.props.navigation.navigate('CompleteSurvey');
                return;
            } else {
                this.props.PushTextDataToObject({ isValid, jumpFlag, UserSurveyResponseP, status })
                return;
            }
        }
        console.log('integer status===>>>>2', isValid, status, jumpFlag)
        this.props.PushTextDataToObject({ isValid, jumpFlag, UserSurveyResponseP, status })

    }
    render() {
        console.log('integer-Q', this.state.Question)
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
                    {this.state.ErrorWarning > 0 ?
                        <View
                            style={styles.QuestionStyle1}
                        >
                            <Text style={[styles.customStyle, styles.ErrorText]}>This question is mandatory</Text>
                        </View> : null}
                    {/* {this.state.Question.response.free != undefined? */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            // paddingLeft: 10,
                            marginLeft: 15,
                            marginRight: 15,
                            backgroundColor: '#f1f2f7',
                            paddingTop: 10,
                            paddingBottom: 50,
                            // width: wp('100%')
                        }}
                    >
                        <TextInput style={[styles.input, styles.customStyle, this.state.ErrorWarning > 0 ? styles.Validateerror : null]}
                            underlineColorAndroid="transparent"
                            placeholder=""
                            placeholderTextColor="#757575"
                            autoCapitalize="none"
                            value={UserSurveyResponseP[this.state.IntTextName]}
                            onChangeText={(e) => this.HandleTextChange(e)} />
                        <TouchableOpacity
                            style={{
                                // borderWidth: 1,
                                // borderColor: 'rgba(0,0,0,0.2)',
                                alignItems: 'center',
                                justifyContent: 'center',
                                top: -20,
                                left: -15,
                                backgroundColor: '#DDD',
                                borderRadius: 50,
                            }}
                            onPress={() => this.RemoveDataFromTheTextBox(this.state.IntTextName)}
                        >
                            <Feather name="minus" style={{padding: 5, margin:0}} size={18} color="#F00" />
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
        )
    }
}
// export default withNavigation(IntegerTextInputCard);
const mapStateToProps = (state) => {
    return {
        SurveyRedux: state.SurveyRedux,
    };
};
const mapDispatchToProps = dispatch => (
    bindActionCreators({
        SurveyResponse
    }, dispatch)
);
export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(IntegerTextInputCard))

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f1f2f7',
        flex: 1
    },
    input: {
        // margin: 15,
        marginLeft:15,
        marginTop:15,
        marginBottom:15,
        height: 45,
        // fontSize: 16,
        paddingLeft: 10,
        borderColor: '#9e9e9e',
        borderWidth: 2,
        borderRadius: 5,
        width: wp('50%')
    },
    checkBoxQ: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        width: wp('100%')
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
    Validateerror: {
        borderColor: 'red',
        borderWidth: 2
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
    customBoldStyle: {
        // fontFamily: Fonts.NotoSansBold,
        fontSize: 14
    }
});