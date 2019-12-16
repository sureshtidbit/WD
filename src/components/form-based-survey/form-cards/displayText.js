import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Fonts } from '../../../utils/fonts'

/*
Display only text of the survey question
*/
export default class IntegerTextInputCard extends Component {
    constructor() {
        super();
        this.state = {
            QNumber: 0,
            DisplayText: 0,
        }
    }

    /*
    Check whether survey needs to be fill or not
    */
    CheckCompletion(inCompleteRespose){
        if(inCompleteRespose == 1){
            this.props.PushTextDataToObject({isValid: 0, inCompleteRespose: 1});
        } else{
            this.props.PushTextDataToObject({isValid: 0, inCompleteRespose: 0});
        }
    }

    componentDidMount() {
        this.setState({ DisplayText: this.props.DisplayText })
        this.setState({ QNumber: this.props.NextQuestion })
        this.CheckCompletion(this.props.inCompleteRespose)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (
            this.props.DisplayText !== nextProps.DisplayText) {
            this.setState({ DisplayText: nextProps.DisplayText })
            this.setState({ QNumber: nextProps.NextQuestion })
            this.CheckCompletion(nextProps.inCompleteRespose)
            return true;
        }
        return true;
    }

    render() {
        var firstQ = (
            <Text
                style={[styles.customStyle,{
                    padding: 5,
                    color: '#000',
                    fontWeight: '600'
                }]}
            ><Text
                style={[styles.customStyle,{
                    color: 'red',
                    fontWeight: '600'
                }]}
            >*</Text>{this.state.DisplayText}</Text>
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
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f1f2f7',
        flex: 1
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
    customStyle: {
        fontFamily: Fonts.Roboto,
        fontSize: 16
    },
});