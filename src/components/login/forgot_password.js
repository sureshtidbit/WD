import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  YellowBox,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar
} from 'react-native';
import {
  withNavigation
} from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionUpdate } from '../../redux/surveyAction'
import { TextInput } from 'react-native-paper';
import Ionicons from "react-native-vector-icons/Ionicons";
import { API } from '../../auth/index'
import RNFetchBlob from 'react-native-fetch-blob'
import ErrorAlert from '../alertMessage/errorAlert'

/*
This component is responsible for the forgot password functionality for the patients.
*/
class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings(
      ['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
      ]);
    this.state = {
      loader: false,
      connection_Status: null,
      emailError: false,
      EmailExist: '',
      ErrorStatus: false,
      ErrorAlertMSG: '',
      ErrorAlertMSGStatus: false
    };
    this.email = ""
  }

  GoBackToHome() {
    this.props.navigation.navigate('Login')
  }

  OnChangeHandleEmail(e) {
    this.email = e
    this.setState({ emailError: false, ErrorStatus: false, EmailExist: '' })
  }

  ForgotPassword() {
    var state = 0
    this.setState({ ErrorAlertMSGStatus: false, ErrorAlertMSG: '' })
    if (!this.email) {
      state = 1
      this.setState({ emailError: true })
    }
    if (state == 1) {
      return 0;
    }
    const details = {
      'email': this.email,
    };
    this.setState({ loader: true })
    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    let url = API + 'forget-password'
    RNFetchBlob.config({
      trusty: true
    }).fetch('POST', url, {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }, formBody)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState(({ loader: false }))
        if (responseData.status == 'ok') {
          this.props.ActionUpdate('Change password link has been sent to your registered email address!')
          this.props.navigation.navigate('Login')
        } else {
          this.setState({ loader: false })
          this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: responseData.message })
        }
      }).catch(err => {
        this.setState({ loader: false })
        this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'Oops, Internal server error, Try again later' })
      })
  }
  
  render() {
    return (
      <View style={styles.container}>
        {this.state.ErrorAlertMSGStatus ? <ErrorAlert message={this.state.ErrorAlertMSG}></ErrorAlert> : null}
        <ScrollView
        keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Ionicons
              onPress={() => this.GoBackToHome()}
              name={Platform.OS === 'android' ? "md-arrow-back" : "ios-arrow-round-back"}
              color='#43CC53'
              size={32}
              style={{ backgroundColor: 'transparent', position: 'absolute', padding: 10, left: 10, top: 10 }}
            />
            <View style={{ alignItems: 'center', paddingTop: 20 }}>
              <Image resizeMode="stretch" style={{ width: 150, height: 80 }}
                source={require('../../images/logo1.png')} />
              <Image style={{ width: 150, height: 30 }}
                source={require('../../images/logo2.png')} />
            </View>

            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.emailError}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='Email'
                  value={this.email}
                  onChangeText={text => this.OnChangeHandleEmail(text)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent' } }}
                />
                {this.state.EmailExist ? <Text style={{ color: '#f00', fontSize: 12 }}>{this.state.EmailExist}</Text> : null}
              </View>
            </View>
            <TouchableOpacity onPress={() => this.ForgotPassword()} style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 25, marginBottom: 15, height: 50, backgroundColor: 'rgba(67,204,83,1)', borderColor: '#43CC53', borderWidth: 1, borderRadius: 5 }}>
              <TouchableOpacity onPress={() => this.ForgotPassword()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {!this.state.loader ? <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFF' }}>Reset Password</Text> : <ActivityIndicator size="small" color="#FFF" />}
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
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

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(ForgotPassword))

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f2f7',
    flex: 1,
  },
  TextStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#43CC53',
    textDecorationLine: 'underline',
  },
});
