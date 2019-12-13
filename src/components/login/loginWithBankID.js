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
  Platform,
  Linking,
  StatusBar,
  Dimensions,
  Switch
} from 'react-native';
import {
  withNavigation
} from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clientID } from '../../redux/surveyAction'
import { TextInput } from 'react-native-paper';
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from 'axios'
import { NetworkInfo } from "react-native-network-info";
import publicIP from 'react-native-public-ip';
import { Post } from '../../auth/index'
import ErrorAlert from '../alertMessage/errorAlert'
import BackgroundTimer from "react-native-background-timer";
const windowWidth = Dimensions.get('window').width;
var BankIDLoginTimer = ''
import {getUniqueId} from 'react-native-device-info';
import firebase from 'react-native-firebase';

var APIURL = 'http://96.126.111.250:3091/'
class LoginWithBankID extends Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings(
      ['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
      ]);
    this.state = {
      UserData: "",
      loader: false,
      personnummerError: "",
      ErrorStatus: false,
      MyIPAddress: '',
      RedirectURL: '',
      ErrorAlertMSG: '',
      ErrorAlertMSGStatus: false,
      switchValue: false,
      worddiagnostics_fcm_token:''
    };
    this._interval = ''
    this.personnummer = ""
  }
  storeToken(token) {
    AsyncStorage.setItem(
      'SurveyAuthToken',
      token
    );
  }
  toggleSwitch = (value) => {
    this.setState({ switchValue: value })
  }
  async getFCMToken() {
    let fcmToken = await AsyncStorage.getItem('worddiagnostics_fcm_token');
    console.log("before fcmToken: ", fcmToken);
    if(fcmToken){
      this.setState({worddiagnostics_fcm_token: fcmToken})
    }
    if (!fcmToken) {
        fcmToken = await firebase.messaging().getToken();
        console.log("----fcmToken: ", fcmToken);
        if (fcmToken) {
          this.setState({worddiagnostics_fcm_token: fcmToken})
          AsyncStorage.setItem('worddiagnostics_fcm_token', fcmToken);
            console.log("after fcmToken: ", fcmToken);
        }
    }
}
async checkPermission() {
    firebase.messaging().hasPermission()
        .then(enabled => {
            if (enabled) {
                console.log("Permission granted", enabled);
                 this.getFCMToken();
            } else {
                console.log("Request Permission");
                this.requestPermission();
            }
        });
}

//2
async requestPermission(auth_token) {
    firebase.messaging().requestPermission()
        .then(() => {
            this.getFCMToken();
        })
        .catch(error => {
            console.log('permission rejected');
        });
}
  componentDidMount() {
    let app = this
    app.checkPermission()
    // Get IPv4 IP (priority: WiFi first, cellular second)
    NetworkInfo.getIPV4Address().then(ipv4Address => {
      console.log('getIPV4Address', ipv4Address);
      app.setState({ MyIPAddress: ipv4Address })
    });
  }
  OnChangeHandleNumber(e) {
    this.personnummer = e
    this.setState({ personnummerError: false, ErrorStatus: false })
  }
  CancelBankIDOrder(id) {
    let app = this
    AsyncStorage.getItem('orderRef').then((value) => {
      if (value) {
        var url5 = APIURL + 'cancel/' + JSON.parse(value)
        axios({
          method: 'GET',
          url: url5
        }).then(function (response) {
          // clearInterval(this._interval);
          BackgroundTimer.clearInterval(this._interval);
          // app.LoginAPI()

          if (id == 1) {
            app.setState({ ErrorAlertMSGStatus: false, ErrorAlertMSG: '', loader: false })
            app.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'BankID server request timeout, Please try again' })
          }
          if (id == 2) {
            app.setState({ ErrorAlertMSGStatus: false, ErrorAlertMSG: '', loader: false })
            app.LoginAPI()
          }
        })
      }
    })
  }
  CollectUserData(respond) {
    fetch('http://96.126.111.250:3097/data', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(respond)
    }).then((response) => response.json())
      .then((responseData1) => {
        console.log('responseData1', responseData1)
      })
  }
  LoginAction(personnummer, signature) {
    const details = {
      'ssn_number': personnummer,
      'device_token': this.state.worddiagnostics_fcm_token
    };

    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    // clearInterval(this._interval);
    BackgroundTimer.clearInterval(this._interval);
    formBody = formBody.join("&");
    let respond = { response: JSON.stringify(formBody) }
    this.CollectUserData(respond)
    console.log(formBody, '33==>>')
    Post('login', formBody).then(responseData => {
      console.log(responseData, '44==>>')
      let respond = { response: JSON.stringify(responseData) }
      this.CollectUserData(respond)
      // if (responseData.result != null && responseData.result != undefined) {
      if (responseData.status == 'ok') {
        this.props.clientID(responseData.result.patientInfo.id)
        this.storeToken(responseData.result.token)
        AsyncStorage.setItem(
          'SurveyPatientInfo',
          JSON.stringify(responseData.result.patientInfo)
        );
        this.setState({ loader: false })
        AsyncStorage.removeItem('orderRef')
        this.props.navigation.navigate('TakeSurvey');
        // } else {
        //   this.setState({ loader: false })
        //   this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: "This personnummer doesn't exist!" })
        // }
      } else {
        this.setState({ loader: false })
        this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: responseData.message })
      }
    })
  }
  async getLoggedUserData(orderRef) {
    let app = this
    var url5 = APIURL + 'collect/' + orderRef
    axios({
      method: 'GET',
      url: url5
    }).then(function (response) {
      console.log('colect-res-r', response)
      if (response.data) {
        if (response.data.status) {
          if (response.data.status == "complete") {
            // clearInterval(this._interval);
            BackgroundTimer.clearInterval(this._interval);
            let respond = { response: JSON.stringify(response.data) }
            app.CollectUserData(respond)
            app.LoginAction(response.data.completionData.user.personalNumber, response.data.completionData.signature)
          }
        }
      } else {
        this.setState({ loader: false })
      }
    })
      .catch((error) => {
        console.log(error);
        this.setState({ loader: false })
        this.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'Oops, Internal server error, Try again later' })
        let respond = { response: JSON.stringify(error) }
        this.CollectUserData(respond)
      });
  }
  LoginAPI() {
    let app = this
    // app.LoginAction('')
    // return 0;
    app.setState({ ErrorAlertMSGStatus: false, ErrorAlertMSG: '' })
    if (!app.personnummer) {
      app.setState({ personnummerError: true })
      return 0;
    }
    app.setState({ loader: true })
    var url5 = APIURL + 'auth/' + app.personnummer + '/' + app.state.MyIPAddress
    console.log(url5, 'url5')
    axios({
      method: 'GET',
      url: url5
    }).then(function (response) {
      console.log('ffwefw-r', response)
      if (response.data) {
        if (response.data.errorCode == 'alreadyInProgress') {
          app.CancelBankIDOrder(2)
        }
      }
      if (response.data) {
        if (response.data.orderRef) {
          AsyncStorage.setItem(
            'orderRef',
            JSON.stringify(response.data.orderRef)
          );
          // timer.setInterval(this, 'TrackTimer', app.getLoggedUserData(response.data.orderRef), 1000);
          // this._interval = setInterval(function () {
          //   app.getLoggedUserData(response.data.orderRef)
          // }, 1000)
          if (Platform.OS == "ios") {
            BackgroundTimer.start();
          }
          this._interval = BackgroundTimer.setInterval(() => {
            app.getLoggedUserData(response.data.orderRef)
          }, 1000);
          setTimeout(function () { app.CancelBankIDOrder(1) }, 120000)

          var url55 = ''
          if (Platform.OS == 'android') {
            url55 = 'bankid:///?autostarttoken=' + response.data.autoStartToken + '&redirect=null';
          } else {
            url55 = 'https://app.bankid.com/?autostarttoken=' + response.data.autoStartToken + '&redirect=org.app.wdproject://';
          }
          console.log('url55-r', url55)
          Linking.canOpenURL(url55)
            .then((supported) => {
              if (!supported) {
                app.setState({ loader: false })
                app.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'Please make sure that you have already installed bankId app in your device' })
                console.log("Can't handle url: " + url55);
                app.CancelBankIDOrder(0)
              } else {
                return Linking.openURL(url55);
              }
            })
            .catch((err) => console.log('An error occurred', err));
        }
        if (response.data.errorCode) {
          app.setState({ loader: false })
          if (response.data.errorCode == "invalidParameters") {
            app.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'Please enter valid personnummer' })
          }
        }
      }
    }).catch(err => {
      app.setState({ loader: false })
      app.setState({ ErrorAlertMSGStatus: true, ErrorAlertMSG: 'Oops, Internal server error, Try again later' })
      console.log('fgefefe-eerrrrr', err)
      let respond = { response: JSON.stringify(err) }
      app.CollectUserData(respond)
    })
  }

  GoBackToHome() {
    this.props.navigation.navigate('Login')
  }
  componentWillUnmount() {
    // clearInterval(this._interval);
    BackgroundTimer.clearInterval(this._interval);
  }
  render() {
    let app = this;
    return (
      <View style={styles.container} >
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
            <Text>{this.state.UserData}</Text>
            {this.state.ErrorStatus ? <View style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 5 }}>
              <Text style={styles.ErrorText}>This personnummer doesn't exist!</Text>
            </View> : null}

            <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25+30, marginRight: 25+30, marginBottom: 15, height: 50 }}>
              <View style={{ flex: 1 }}>
                <TextInput
                  error={this.state.personnummerError}
                  mode={'outlined'}
                  style={{ width: undefined, paddingRight: 20 }}
                  label='YYYYMMDDXXXX'
                  value={this.personnummer}
                  onChangeText={(e) => this.OnChangeHandleNumber(e)}
                  theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent' } }}
                />
              </View>
            </View>
            <View style={{ width: windowWidth }}>
              <View style={{ flexDirection: 'row', marginTop: 25, marginLeft: 25, marginRight: 25, marginBottom: 15, justifyContent:'center', alignItems:'center' }}>
                <View style={{ position: 'absolute', left: 35 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#AAA' }}>Remember me</Text>
                </View>
                <View style={{ position: 'absolute', right: 30 }}>
                  <Switch
                    style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
                    onValueChange={this.toggleSwitch}
                    value={this.state.switchValue} />
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={() => this.LoginAPI()} disabled={this.state.loader} style={{ flexDirection: 'row', marginLeft: 25+30, marginRight: 25+30, marginTop: 15, marginBottom: 15, height: 50, backgroundColor: '#469CBE', borderColor: '#469CBE', borderWidth: 1, borderRadius: 5 }}>
              <TouchableOpacity onPress={() => this.LoginAPI()} disabled={this.state.loader} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {!this.state.loader ? <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFF' }}>Login with BankID app</Text> : <ActivityIndicator size="small" color="#FFF" />}
              </TouchableOpacity>
            </TouchableOpacity>
            <TouchableOpacity style={{marginTop: 10}} onPress={() => this.GoBackToHome()}>
              <Text style={{ fontSize: 18, fontWeight: '500', color: '#AAA' }}>Change login method</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )

  }
}
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
export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(LoginWithBankID))

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f2f7',
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center'
  },
  TextStyle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#43CC53',
    textDecorationLine: 'underline',
    //line-through is the trick
  },
  ErrorText: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
    flex: 1,
    color: '#f00',
  },
});
