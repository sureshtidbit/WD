import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  AsyncStorage,
  ActivityIndicator,
  YellowBox,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
  Keyboard,
  StatusBar
} from 'react-native';
import {
  withNavigation
} from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clientID } from '../../redux/surveyAction'
import { TextInput } from 'react-native-paper';
import RNFetchBlob from 'react-native-fetch-blob'
import { API } from '../../auth/index'
import ErrorAlert from '../alertMessage/errorAlert'
import SuccessAlert from '../alertMessage/success'
import { getUniqueId } from 'react-native-device-info';
import firebase from 'react-native-firebase';

/*
This component is responsible for the patient login functionality.
*/
class Login extends Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings(
      ['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
      ]);
    this.state = {
      progress: true,
      connection_Status: null,
      usernameError: false,
      passwordError: false,
      loader: false,
      ErrorStatus: false,
      ErrorAlertMSG: '',
      ErrorAlertMSGStatus: false,
      SuccessAlertMSGStatus: false,
      SuccessAlertMSG: '',
      worddiagnostics_fcm_token: ''
    };
    this.username = null
    this.password = null
  }

  /*
  Get FCM token for the notifications
  */
  async getFCMToken() {
    let fcmToken = await AsyncStorage.getItem('worddiagnostics_fcm_token');
    if (fcmToken) {
      this.setState({ worddiagnostics_fcm_token: fcmToken })
    }
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      console.log("----fcmToken: ", fcmToken);
      if (fcmToken) {
        this.setState({ worddiagnostics_fcm_token: fcmToken })
        AsyncStorage.setItem('worddiagnostics_fcm_token', fcmToken);
      }
    }
  }

  /*
  Check permissions to handle notifications
  */
  async checkPermission() {
    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          this.getFCMToken();
        } else {
          this.requestPermission();
        }
      });
  }

  /*
  Check permissions to handle notifications
  */
  async requestPermission(auth_token) {
    firebase.messaging().requestPermission()
      .then(() => {
        this.getFCMToken();
      })
      .catch(error => {
      });
  }

  /*
  Get Auth token
  */
  getToken() {
    var auth = null;
    auth = AsyncStorage.getItem('SurveyAuthToken')
    if (auth != undefined || auth != null) {
      const authToken = JSON.parse(auth);
      const token = authToken ? authToken.token : null;
      return token;
    } else {
      return auth;
    }
  }

  /*
  Handle push notifications activities here
  */
  async createNotificationListeners() {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      console.log('onNotification000:', notification);
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
      this.setState({ progress: true })
      const { title, body } = notificationOpen.notification;
      console.log(notificationOpen.notification, 'notificationOpen.notification;====')
      console.log('onNotificationOpened: opened-->>');
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      console.log('getInitialNotification:======1', notificationOpen);
    }
  }

  /*
  Check whether user is authenticated or not
  */
  IsAuthenticatedUser() {
    this.setState({ progress: true })
    AsyncStorage.getItem('SurveyAuthToken').then((value) => {
      if (value != undefined || value != null) {
        AsyncStorage.getItem('SurveyPatientInfo').then((info) => {
          if (info != undefined || info != null) {
            var Info = JSON.parse(info)
            this.props.clientID(Info.id)
            this.props.navigation.navigate('TakeSurvey');
          }
          this.setState({ progress: false })
        })
      } else {
        this.setState({ progress: false })
      }
    })
  }

  componentWillMount() {
    this.IsAuthenticatedUser()
  }

  /*
  Patient login method
  */
  LoginWithUser() {
    const details = {
      'username': this.username,
      'password': this.password,
      'device_token': this.state.worddiagnostics_fcm_token
    };
    this.setState({ ErrorAlertMSGStatus: false, ErrorAlertMSG: '', SuccessAlertMSGStatus: false, SuccessAlertMSG: '' })
    this.setState({ loader: true })
    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    let url = API + 'wd-login'
    RNFetchBlob.config({
      trusty: true
    }).fetch('POST', url, {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }, formBody)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData, 'response')
        if (responseData.status === 'ok') {
          this.props.clientID(responseData.result.patientInfo.id)
          this.storeToken(responseData.result.token)
          AsyncStorage.setItem(
            'SurveyPatientInfo',
            JSON.stringify(responseData.result.patientInfo)
          );
          this.setState({ loader: false })
          this.props.navigation.navigate('TakeSurvey');
        } else {
          this.setState({ loader: false })
          this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: responseData.message })
        }
      }).catch(err => {
        this.setState({ loader: false })
        this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'Oops, Internal server error, Try again later' })
      })
  }

  /*
  Store Auth token
  */
  storeToken(token) {
    AsyncStorage.setItem(
      'SurveyAuthToken',
      token
    );
  }

  LoginWithUserName() {
    var state = 0
    this.setState({ ErrorStatus: false })
    Keyboard.dismiss();
    if (!this.username) {
      state = 1
      this.setState({ usernameError: true })
    }
    if (!this.password) {
      state = 1
      this.setState({ passwordError: true })
    }
    if (state == 0) {
      this.LoginWithUser()
    }
  }

  OnChangeText(text, id) {
    if (id == 1) {
      this.username = text
      this.setState({ usernameError: false })
    } else {
      this.password = text
      this.setState({ passwordError: false })
    }
    this.setState({ ErrorStatus: false })
  }

  GoTOSignUp() {
    this.props.navigation.navigate('Signup');
  }

  LoginwithBnakID() {
    this.props.navigation.navigate('LoginWithBankID');
  }

  ForgotPassword() {
    this.props.navigation.navigate('ForgotPassword');
  }

  componentDidMount() {
    this.checkPermission()
    if (this.props.SurveyRedux.ActionUpdate) {
      this.setState({ SuccessAlertMSGStatus: true, SuccessAlertMSG: this.props.SurveyRedux.ActionUpdate })
    }
    this.createNotificationListeners(); //add this line
  }

  componentWillUnmount() {
    this.notificationListener;
    this.notificationOpenedListener;
  }

  render() {
    let app = this;
    if (app.state.progress) {
      return (
        <View style={styles.container1}>
          <ActivityIndicator size='large' color="#00ff00" />
        </View>
      )
    }
    return (
      <View style={styles.container}>
        {this.state.ErrorAlertMSGStatus ? <ErrorAlert message={this.state.ErrorAlertMSG}></ErrorAlert> : null}
        {this.state.SuccessAlertMSGStatus ? <SuccessAlert message={this.state.SuccessAlertMSG}></SuccessAlert> : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
          <View style={{ alignItems: 'center' }}>
            <View style={{ alignItems: 'center', paddingTop: 20, marginTop: 10 }}>
              <Image resizeMode="stretch" style={{ width: 150, height: 80 }}
                source={require('../../images/logo1.png')} />
              <Image style={{ width: 150, height: 30 }}
                source={require('../../images/logo2.png')} />
            </View>
            {this.state.ErrorStatus ? <View style={{ flex: 1, marginLeft: 25, marginRight: 25, marginTop: 5 }}>
              <Text style={styles.ErrorText}>This user does not exist in our records</Text>
            </View> : null}
            <TouchableOpacity style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 20, height: 50, backgroundColor: '#469CBE', borderColor: '#469CBE', borderWidth: 1, borderRadius: 5 }}>
              <TouchableOpacity onPress={() => this.LoginwithBnakID()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>Login with BankID app</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50, position: 'relative' }}>

              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.usernameError}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='Username/Email'
                  value={this.username}
                  onChangeText={username => this.OnChangeText(username, 1)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent', } }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50, position: 'relative' }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.passwordError}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='Password'
                  secureTextEntry={true}
                  value={this.password}
                  onChangeText={password => this.OnChangeText(password, 2)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent', } }}
                />
              </View>
            </View>
            <TouchableOpacity onPress={() => this.LoginWithUserName()} style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 15, marginBottom: 5, height: 50, backgroundColor: 'rgba(67,204,83,0.17)', borderColor: '#43CC53', borderWidth: 1, borderRadius: 5 }}>
              <TouchableOpacity onPress={() => this.LoginWithUserName()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {!this.state.loader ? <Text style={{ fontSize: 16, fontWeight: '500', color: '#43CC53' }}>Login</Text> : <ActivityIndicator size='small' color="#00ff00" />}
              </TouchableOpacity>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, color: '#aaa' }}>OR</Text>
            <TouchableOpacity style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 5, marginBottom: 15, height: 50, backgroundColor: 'rgba(67,204,83,1)', borderColor: '#43CC53', borderWidth: 1, borderRadius: 5 }}>
              <TouchableOpacity onPress={() => this.GoTOSignUp()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFF' }}>Create an Account</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.ForgotPassword()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 25, }}>
              <Text style={styles.TextStyle}>Forgot Password</Text>
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
    clientID
  }, dispatch)
);
export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(Login))

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f2f7',
    flex: 1,
  },
  container1: {
    backgroundColor: '#f1f2f7',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  TextStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#43CC53',
    textDecorationLine: 'underline',
  },
  ErrorText: {
    alignItems: 'center',
    backgroundColor: '#f1f2f7',
    borderRadius: 5,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
    color: '#f00',
  },
});
