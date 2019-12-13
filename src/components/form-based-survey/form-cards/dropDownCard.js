import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dropdown } from 'react-native-material-dropdown';
var DropdownValue = "Choose Option"
var UserSurveyResponseP={}
export default class DropDownCard extends Component {
    constructor(props) {
        super(props);
        // this.inputRefs = {
        //     DropdownValue: null,
        // };
        this.state = {
            Array: [],
            ChatArray: [],
            chat: "",
            text: "", value: "",
            checked: false,
            NextQ: 1,
            QuestionsSection: [],
            questionText: "",
            Question: null,
            email: "",
            NextRadioQ: -1,
            RadioText: "",
            QNumber: 0,
            secondLoop: 0,
            data: [],
            canada: "",
            language: 1,
            ErrorWarning: -1
            // DropdownValue: undefined
        }
    }
    GetUserResponseObject(varName){
        var isValid = 0
        console.log('attributes===',UserSurveyResponseP[varName.attributes.wd_qid])
        this.setState({RadioIndex: varName.attributes.wd_qid})
        if(UserSurveyResponseP[varName.attributes.wd_qid] !== undefined && UserSurveyResponseP[varName.attributes.wd_qid] !== null){
            isValid = 0
            this.props.PushTextDataToObject({ isValid,check: 0, UserSurveyResponseP })
        } else{
            UserSurveyResponseP[varName.attributes.wd_qid] = null;
            isValid = 1
            this.props.PushTextDataToObject({ isValid,check: 0,UserSurveyResponseP })
        }
       
    }
    componentDidMount() {
        DropdownValue = 'Choose Option'
        UserSurveyResponseP = this.props.UserSurveyResponse
            console.log('UserSurveyResponse==', UserSurveyResponseP)
        this.setState({ErrorWarning: this.props.ErrorWarning})
        this.setState({ NextRadioQ: this.props.NextRadioQ })
        this.setState({ Question: this.props.Question })
        this.setState({ questionText: this.props.Question.text })
        this.setState({ QNumber: this.props.NextQuestion })
        this.setState({ secondLoop: this.props.secondLoop })
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.Question !== nextProps.Question || this.props.secondLoop !== nextProps.secondLoop || this.props.NextRadioQ !== nextProps.NextRadioQ) {
            UserSurveyResponseP = nextProps.UserSurveyResponse
            console.log('UserSurveyResponse=next=', UserSurveyResponseP)
            this.setState({ Question: nextProps.Question })
            this.setState({ questionText: nextProps.Question.text })
            this.setState({ NextRadioQ: nextProps.NextRadioQ })
            this.setState({ QNumber: nextProps.NextQuestion })
            this.setState({ secondLoop: nextProps.secondLoop })
            DropdownValue = 'Choose Option'

            return true;
        }
        if(this.props.ErrorWarning !== nextProps.ErrorWarning){
            this.setState({ErrorWarning: nextProps.ErrorWarning})
            return true;
        }
        
        return true;
    }
    onChangeTextPress(Dropdown) {
        // console.log(value, 'val');
        var isValid = 0
        // var Dropdown = ""
        // Dropdown = value
        DropdownValue = Dropdown
        var VarName = this.state.Question.response  
        UserSurveyResponseP[VarName.attributes.wd_qid] = Dropdown;
        // this.props.emitter.emit('eventName');
        setTimeout(() => this.props.PushTextDataToObject({ isValid, Dropdown, UserSurveyResponseP }), 500)
        
    }
    render() {
       
        let data = []
        
        if (this.state.Question) {
            data = this.state.Question.response.fixed.category;
        }
        let { drop_value } = this.state
        var firstQ = (
            <View>
                <Text
                    style={{
                        fontSize: 20,
                        padding: 5,
                        color: '#000',
                        fontWeight: '600'
                    }}
                >{this.state.QNumber+1}<Text
                    style={{
                        fontSize: 20,
                        color: 'red',
                        fontWeight: '800'
                    }}
                >*</Text>{this.state.questionText}</Text>

            </View>
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
                    {this.state.ErrorWarning===1?
                    <View
                        style={styles.QuestionStyle1}
                    >
                        <Text style={styles.ErrorText}>This question is mandatory</Text>
                    </View>: null}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 15,
                            marginRight: 15,
                            backgroundColor: '#eeeeee',
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
                            // valueExtractor={({value})=> value}
                            value={DropdownValue}
                            // onChangeText={(value) => this.onChangeTextPress(value)}
                            onChangeText={(value)=>this.onChangeTextPress(value)}
                        />
                       
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',

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
    QuestionStyle: {
        flex: 1,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        // alignItems:'center',
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: '#eeeeee',
        borderRadius: 5,
        paddingVertical: 5,
        fontSize: 18
    },
    ErrorText: {
        paddingVertical: 10,
        paddingLeft: 10,
        paddingRight: 10,
        fontSize: 16,
        color: '#f00',
        // marginVertical: 15
    },
    QuestionStyle1: {
        flex: 1,
        marginLeft: 15,
        marginRight: 15,
        paddingRight: 10,
        paddingLeft: 10,
        backgroundColor: '#eeeeee',
        paddingVertical: 5,
        fontSize: 18
    },
    
});