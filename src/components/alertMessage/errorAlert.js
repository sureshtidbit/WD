import React, { Component } from "react";
import {
    Text,
    StyleSheet,
    Platform,
    Animated,
    TouchableOpacity
} from "react-native";
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ActionUpdate } from '../../redux/surveyAction'

/*
This component is used for the display any types of errors
* Methods: {functions} callToast, closeToastMethod, closeToast are responsible for animations
*/
class ErrorAlert extends Component {
    constructor() {
        super();
        this.animatedValue = new Animated.Value(70)
        this.state = {
            text: '',
        }
    }

    componentDidMount() {
        this.callToast()
    }

    callToast() {
        Animated.timing(
            this.animatedValue,
            {
                toValue: 0,
                duration: 200
            }).start(this.closeToast())
    }

    closeToastMethod() {
        this.props.ActionUpdate('')
        Animated.timing(
            this.animatedValue,
            {
                toValue: 70,
                duration: 200
            }).start()
    }

    closeToast() {
        setTimeout(() => {
            this.props.ActionUpdate('')
            Animated.timing(
                this.animatedValue,
                {
                    toValue: 70,
                    duration: 350
                }).start()
        }, 50000)
    }

    render() {
        return (
            <Animated.View
                style={{
                    transform: [{ translateY: this.animatedValue }],
                    height: 70,
                    backgroundColor: '#ff5733',
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    right: 0,
                    zIndex: 1000,
                    justifyContent: 'center'
                }}>
                <Text
                    style={{
                        marginLeft: 20,
                        marginRight: 30,
                        color: '#FFF',
                        fontSize: 14,
                        fontWeight: '500'
                    }}>
                    {this.props.message}
                </Text>
                <TouchableOpacity onPress={() => this.closeToastMethod()} style={{ position: 'absolute', right: 10, padding: 5 }}>
                    <Ionicons name={Platform == 'android' ? 'md-close' : 'ios-close'} style={{ fontWeight: '700' }} size={36} color="#FFF"></Ionicons>
                </TouchableOpacity>
            </Animated.View>
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
        ActionUpdate
    }, dispatch)
);
export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(ErrorAlert))