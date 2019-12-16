import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  YellowBox,
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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ActionUpdate } from '../../redux/surveyAction'
import { TextInput } from 'react-native-paper';
import Ionicons from "react-native-vector-icons/Ionicons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ErrorAlert from '../alertMessage/errorAlert'
import RNFetchBlob from 'react-native-fetch-blob'
import { API } from '../../auth/index'

/*
Sign up component for the new patient to register in the WD.
*/
class Signup extends Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings(
      ['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
      ]);
    this.state = {
      loader: false,
      connection_Status: null,
      ErrorText: null,
      first_name_error: false,
      last_name_error: false,
      email_error: false,
      password_error: false,
      confirm_password_error: false,
      ssn_number_error: false,
      ValidEmail: "",
      ValidSSN: "",
      ErrorAlertMSG: '',
      ErrorAlertMSGStatus: false
    };
    this.first_name = null
    this.last_name = null
    this.email = null
    this.password = null
    this.confirm_password = null
    this.ssn_number = null
    this.registeration_from_mobile = 1
  }

  /*
  Fields Text change handler
  */
  OnChangeHandle(e, type) {
    this.setState({ ValidEmail: "", ValidSSN: "", ErrorText: '' })
    switch (type) {
      case 1:
        this.first_name = e
        this.setState({ first_name_error: false })
        break;
      case 2:
        this.last_name = e
        this.setState({ last_name_error: false })
        break;
      case 3:
        this.email = e
        this.setState({ email_error: false })
        break;
      case 4:
        this.ssn_number = e
        this.setState({ ssn_number_error: false })
        break;
      case 5:
        this.password = e
        this.setState({ password_error: false })
        break;
      case 6:
        this.confirm_password = e
        this.setState({ confirm_password_error: false })
        break;
    }
  }

  /*
  Sign up method to register a new patient
  */
  SignupNew() {
    var state = 0
    this.setState({ ValidEmail: "", ValidSSN: "", ErrorText: "" })
    if (!this.first_name) {
      state = 1
      this.setState({ first_name_error: true })
    }
    if (!this.last_name) {
      state = 1
      this.setState({ last_name_error: true })
    }
    if (!this.email) {
      state = 1
      this.setState({ email_error: true })
    }
    if (!this.ssn_number) {
      state = 1
      this.setState({ ssn_number_error: true })
    }
    if (!this.password) {
      state = 1
      this.setState({ password_error: true })
    }
    if (!this.confirm_password) {
      state = 1
      this.setState({ confirm_password_error: true })
    }
    if (state == 1) {
      return 0;
    }

    if (this.first_name && this.last_name && this.email && this.password && this.confirm_password && this.ssn_number) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(this.email)) {
        this.setState({ ValidEmail: "" })
      } else {
        this.setState({ ValidEmail: 'This email is not valid' })
        return 0;
      }
      if (this.password !== this.confirm_password) {
        this.setState({ ErrorText: "The password and confirm password doesn't match" })
        return 0;
      }
      var url = API + 'register'
      const details = {
        'first_name': this.first_name,
        'last_name': this.last_name,
        'email': this.email,
        'password': this.password,
        'confirm_password': this.confirm_password,
        'ssn_number': this.ssn_number,
        'registeration_from_mobile': this.registeration_from_mobile
      };
      this.setState({ loader: true })
      let formBody = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");
      RNFetchBlob.config({
        trusty: true
      }).fetch('POST', url, {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }, formBody)
        .then((response) => response.json())
        .then((responseData) => {
          console.log('responseData', responseData)
          this.setState({ loader: false })
          if (responseData.status === "ok") {
            this.props.ActionUpdate('This user has been registered successfully!')
            this.props.navigation.navigate('Login')
          } else {
            this.setState({ loader: false })
            if (responseData.email) {
              this.setState({ ValidEmail: "This email is already exist!" })
            }
            if (responseData.ssn_number) {
              this.setState({ ValidSSN: "This personnummer is not valid!" })
            }
            if (responseData.password) {
              this.setState({ ErrorText: "The password must have at least 6 characters!" })
            }
          }
        }).catch(err => {
          this.setState({ loader: false })
          this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'Oops, Internal server error, Try again later' })
        })
    }
  }

  GoBackToHome() {
    this.props.navigation.navigate('Login')
  }

  render() {
    let app = this;
    return (
      <View style={styles.container}>
        {this.state.ErrorAlertMSGStatus ? <ErrorAlert message={this.state.ErrorAlertMSG}></ErrorAlert> : null}
        <KeyboardAwareScrollView
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps='handled'
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
            <View style={{ alignItems: 'center', paddingTop: 20, marginTop: 10 }}>
              <Image resizeMode="stretch" style={{ width: 150, height: 80 }}
                source={require('../../images/logo1.png')} />
              <Image style={{ width: 150, height: 30 }}
                source={require('../../images/logo2.png')} />
            </View>

            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 10, height: 50 }}>
              <View style={{ flex: 0.5, marginRight: 7, }}>
                <TextInput
                  error={this.state.first_name_error}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='First Name'
                  value={this.first_name}
                  onChangeText={first_name => this.OnChangeHandle(first_name, 1)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent' } }}
                />
              </View>
              <View style={{ flex: 0.5, marginLeft: 8, }}>
                <TextInput
                  error={this.state.last_name_error}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='Last Name'
                  value={this.last_name}
                  onChangeText={last_name => this.OnChangeHandle(last_name, 2)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent' } }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50, position: 'relative' }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.email_error}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='Email'
                  value={this.email}
                  onChangeText={email => this.OnChangeHandle(email, 3)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent', } }}
                />
                {this.state.ValidEmail ? <Text style={{ color: '#f00', fontSize: 12 }}>{this.state.ValidEmail}</Text> : null}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50, position: 'relative' }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.ssn_number_error}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='YYYYMMDDXXXX'
                  value={this.ssn_number}
                  onChangeText={ssn_number => this.OnChangeHandle(ssn_number, 4)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent', } }}
                />
                {this.state.ValidSSN ? <Text style={{ color: '#f00', fontSize: 12 }}>{this.state.ValidSSN}</Text> : null}
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50, position: 'relative' }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.password_error}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='Password'
                  secureTextEntry={true}
                  value={this.password}
                  onChangeText={password => this.OnChangeHandle(password, 5)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent', } }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50, position: 'relative' }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.confirm_password_error}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='Confirm Password'
                  secureTextEntry={true}
                  value={this.confirm_password}
                  onChangeText={confirm_password => this.OnChangeHandle(confirm_password, 6)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent', } }}
                />
                {this.state.ErrorText ? <Text style={{ color: '#f00', fontSize: 12 }}>{this.state.ErrorText}</Text> : null}
              </View>
            </View>
            <TouchableOpacity onPress={() => this.SignupNew()} style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 20, marginBottom: 30, height: 50, backgroundColor: 'rgba(67,204,83,1)', borderColor: '#43CC53', borderWidth: 1, borderRadius: 5 }}>
              <TouchableOpacity onPress={() => this.SignupNew()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {!this.state.loader ? <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFF' }}>Create an Account</Text> : <ActivityIndicator size="small" color="#FFF" />}
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
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

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(Signup))

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f2f7',
    flex: 1,
  },
  inputBox: {
    width: 300,
    backgroundColor: '#bdbdbd',
    borderRadius: 25,
    paddingHorizontal: 18,
    height: hp('8%'),
    fontSize: 16,
    color: '#004d40',
    marginVertical: 10,
    height: hp('8%'),
    borderWidth: 2,
    borderColor: '#9e9e9e',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center'
  },
  button: {
    width: 300,
    backgroundColor: '#1c313a',
    borderRadius: 25,
    marginVertical: 10,
    height: hp('8%'),
    justifyContent: 'center',
  },
  ErrorText: {
    alignItems: 'center',
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 16,
    color: '#f00',
    marginVertical: 5
  },
});
