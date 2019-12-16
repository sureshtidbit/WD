import React from 'react';
import { StyleSheet, StatusBar, AsyncStorage, Platform, View, ScrollView, Modal, TouchableOpacity, YellowBox } from 'react-native';
import { Container, Header, Left, Right, Body, Badge, Title, Text, Icon, Button, Thumbnail } from 'native-base';
import {
  withNavigation
} from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { viewSurvey, surveyToken, clientID, ActionUpdate } from '../../../../redux/surveyAction'
import RNFetchBlob from 'react-native-fetch-blob'
import { API } from '../../../../auth/index'
import SuccessAlert from '../../../alertMessage/success'
import { Fonts } from '../../../../utils/fonts'
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

/*
Patient profile section
*/
class PatientProfile extends React.Component {
  constructor(props) {
    super(props);
    YellowBox.ignoreWarnings(
      ['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader'
      ]);
    this.state = {
      x: 0, y: 0, z: 0,
      token: "",
      PendingSurvey: [],
      patientInfo: {},
      CompletedSurveyLength: 0,
      PendingSurveyLength: 0,
      ModalVisibleStatus: false,
      registeration_from_mobile: false,
      SuccessAlertMSGStatus: false,
      SuccessAlertMSG: '',
      LanguageModal: false,
      SelectedLanguage: 0
    };
  }

  /*
  Patient logout method
  */
  Logout() {
    AsyncStorage.getItem('SurveyAuthToken').then((value) => {
      var token = 'Bearer ' + value
      let url = API + 'logout?clientId=' + this.props.SurveyRedux.client_id
      RNFetchBlob.config({
        trusty: true
      }).fetch('POST', url, {
        'Authorization': token,
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
        .then((response) => response.json())
        .then((responseData) => {
          AsyncStorage.removeItem('SurveyAuthToken');
          AsyncStorage.removeItem('SurveyPatientInfo');
          this.props.navigation.navigate('Login')
        })
    })
  }

  /*
  Get completed surveys by the patient
  */
  CompletedSurvey() {
    AsyncStorage.getItem('SurveyAuthToken').then((value) => {
      var token = 'Bearer ' + value
      let url = API + 'completed-surveys?clientId=' + this.props.SurveyRedux.client_id
      RNFetchBlob.config({
        trusty: true
      }).fetch('GET', url, {
        'Authorization': token,
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log(responseData, 'completed')
          if (responseData.status == 'ok') {
            if (responseData.result.surveys == undefined) {
              this.setState({ CompletedSurveyLength: responseData.result.length })
            } else {
              this.setState({ CompletedSurveyLength: responseData.result.surveys.length })
            }
          } else {
            if (responseData.status === 'failed') {
              this.Logout()
            }
          }
        })
    })
  }

  /*
  Get pending surveys of the patient
  */
  PendingSurvey() {
    AsyncStorage.getItem('SurveyAuthToken').then((value) => {
      var token5 = 'Bearer ' + value
      this.setState({ token: token5 })
      let url = API + 'surveys?clientId=' + this.props.SurveyRedux.client_id
      RNFetchBlob.config({
        trusty: true
      }).fetch('GET', url, {
        'Authorization': token5,
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log(responseData, 'data', token5)
          if (responseData.status == 'ok') {
            this.setState({ PendingSurveyLength: responseData.result.length })
            this.setState({ PendingSurvey: responseData.result })
          } else {
            if (responseData.status === 'failed') {
              this.Logout()
            }
          }
        })
    })
  }

  /*
  Get language code
  */
  CheckLanguageCode() {
    AsyncStorage.getItem('WDLanguageCode').then((value) => {
      if (value !== undefined && value !== null) {
        let code = 0
        if (value == 'en-US') {
          code = 1
        }
        if (value == 'sv-SE') {
          code = 2
        }
        this.setState({ SelectedLanguage: code })
      }
    })
  }

  componentDidMount() {
    this.CheckLanguageCode()
    if (this.props.SurveyRedux.ActionUpdate) {
      this.setState({ SuccessAlertMSGStatus: true, SuccessAlertMSG: this.props.SurveyRedux.ActionUpdate })
    }
    AsyncStorage.getItem('SurveyPatientInfo').then((value) => {
      var info = JSON.parse(value)
      if (info.registeration_from_mobile != undefined) {
        if (info.registeration_from_mobile == true) {
          this.setState({ registeration_from_mobile: true })
        } else {
          this.setState({ registeration_from_mobile: false })
        }
      } else {
        this.setState({ registeration_from_mobile: false })
      }
      this.setState({ patientInfo: info })
      this.props.clientID(info.id)
    })
    this.PendingSurvey();
    this.CompletedSurvey();
  }

  GoNextSurvey(id, survey_token) {
    this.props.viewSurvey(id)
    this.props.surveyToken(survey_token)
    this.props.navigation.navigate('FormSurvey', { firstParam: 1, secondParam: 2 });
  }

  DisplayPendingSurvey() {
    this.props.navigation.navigate('PendingSurveyList');
  }

  DisplayCompletedSurvey() {
    this.props.navigation.navigate('CompletedSurveyList');
  }

  ShowModalFunction(visible) {
    this.setState({ ModalVisibleStatus: visible });
  }

  ChangePassword() {
    this.props.ActionUpdate('')
    this.props.navigation.navigate('ChangePassword');
  }

  OpenLanguageModal() {
    this.setState({ LanguageModal: true })
  }

  ToggleLanguages(v) {
    this.setState({ SelectedLanguage: v })
  }

  SetLanguageCode() {
    let SelectedLanguage = this.state.SelectedLanguage
    let code = ''
    if (SelectedLanguage == 1) {
      code = 'en-US'
    } else {
      if (SelectedLanguage == 2) {
        code = 'sv-SE'
      }
    }
    AsyncStorage.setItem('WDLanguageCode', code)
    this.setState({ LanguageModal: false })
  }

  render() {
    let SelectedLanguage = this.state.SelectedLanguage
    const uri = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/768px-Circle-icons-profile.svg.png"
    return (
      <Container style={{ backgroundColor: "#f1f2f7" }}>
        <Header style={{ backgroundColor: "#43CC53" }}>
          <Left style={{ flex: 0.7 }}>
            <Button transparent onPress={() => this.props.navigation.navigate('Home')}>
              <Icon style={{ color: '#fff' }} name='arrow-back' />
            </Button>
          </Left>
          <Body style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Title style={{ color: '#fff', textAlign: 'center' }} >Profile</Title>
          </Body>
          <Right style={{ flex: 0.7 }}>
            <Button transparent onPress={() => this.Logout()}>
              <Icon style={{ color: '#fff' }} name='md-log-out' />
            </Button>
          </Right>
        </Header>
        <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
        {this.state.SuccessAlertMSGStatus ? <SuccessAlert message={this.state.SuccessAlertMSG}></SuccessAlert> : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 10, }}>
            <View style={{}}>
              <Thumbnail large source={{ uri: uri }} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, alignItems: 'center', justifyContent: 'center', marginTop: 1, marginBottom: 5, }}>
            <Text style={{ textAlign: 'center' }}>{this.state.patientInfo.first_name} {this.state.patientInfo.last_name}</Text>
          </View>
          <View style={{
            flexDirection: 'row', marginTop: 30, marginBottom: 15, borderBottomWidth: 1,
            borderBottomColor: '#aaa', paddingBottom: 20, marginLeft: 25, marginRight: 25, textAlign: 'left'
          }}>
            <Text style={{ textAlign: 'left', color: '#aaa' }}>
              <Text style={{ color: '#000' }}>Email:</Text> {this.state.patientInfo.email}
            </Text>
          </View>
          <View style={{
            flexDirection: 'row', marginTop: 0, marginBottom: 15, borderBottomWidth: 1,
            borderBottomColor: '#aaa', paddingBottom: 20, marginLeft: 25, marginRight: 25, textAlign: 'left'
          }}>
            <Text style={{ textAlign: 'left', color: '#aaa' }}>
              <Text style={{ color: '#000' }}>Mobile Number:</Text> {this.state.patientInfo.phone}
            </Text>
          </View>
          <TouchableOpacity onPress={() => this.DisplayPendingSurvey()} style={{
            flexDirection: 'row', flex: 1, marginTop: 0, marginBottom: 15, borderBottomWidth: 1,
            borderBottomColor: '#aaa', paddingBottom: 20, marginLeft: 25, marginRight: 25,
          }}>
            <TouchableOpacity onPress={() => this.DisplayPendingSurvey()} style={{ flex: 1, }}>
              <Text style={{ color: '#000' }}>Pending Survey(s):</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, right: 5, position: 'absolute' }}>
              <Badge style={{ backgroundColor: '#4388CC', borderRadius: 3, }} primary><Text>{this.state.PendingSurveyLength}</Text></Badge>
            </View>

          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.DisplayCompletedSurvey()} style={{
            flexDirection: 'row', flex: 1, marginTop: 0, marginBottom: 15, borderBottomWidth: 1,
            borderBottomColor: '#aaa', paddingBottom: 20, marginLeft: 25, marginRight: 25,
          }}>
            <TouchableOpacity onPress={() => this.DisplayCompletedSurvey()} style={{ flex: 1, }}>
              <Text style={{ color: '#000' }}>Completed Survey(s):</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, right: 5, position: 'absolute' }}>
              <Badge style={{ borderRadius: 3, }} success><Text>{this.state.CompletedSurveyLength}</Text></Badge>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{
            flexDirection: 'row', flex: 1, marginTop: 0, marginBottom: 15, borderBottomWidth: 1,
            borderBottomColor: '#aaa', paddingBottom: 20, marginLeft: 25, marginRight: 25,
          }}>
            <TouchableOpacity onPress={() => this.OpenLanguageModal()} style={{ flex: 1, }}>
              <Text style={{ color: '#000' }}>Language:</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.OpenLanguageModal()} style={{ flex: 1, right: 5, position: 'absolute', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <Text>{SelectedLanguage == 1 ? 'English' : (SelectedLanguage == 2 ? 'Swedish' : 'N/A')}</Text>
              <MaterialIcons name={'arrow-drop-down'} color={'#AAA'} size={28} />
            </TouchableOpacity>
          </TouchableOpacity>
          {this.state.registeration_from_mobile == true ? <TouchableOpacity style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 0, marginBottom: 15, height: 50, backgroundColor: 'rgba(67,204,83,1)', borderColor: '#43CC53', borderWidth: 1, borderRadius: 5 }}>
            <TouchableOpacity onPress={() => this.ChangePassword()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFF' }}>Change Password</Text>
            </TouchableOpacity>
          </TouchableOpacity> : null}
        </ScrollView>
        <View>
          <Modal
            transparent={true}
            animationType={"slide"}
            visible={this.state.LanguageModal}
            onRequestClose={() => this.setState({ LanguageModal: false })} >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={styles.ModalInsideView}>
                <View style={{ flex: 1, borderBottomColor: '#EEE', borderBottomWidth: 1, justifyContent: 'center' }}>
                  <Text style={styles.TextStyle}>{'Select Language'}</Text>
                </View>
                <View style={{ flex: 2, justifyContent: 'center' }}>
                  <TouchableOpacity onPress={() => this.ToggleLanguages(1)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginTop: 10, marginRight: 10 }}>
                    <Text style={styles.LanguageStyle}>English</Text>
                    <Ionicons name={Platform == 'android' ? 'md-checkmark-circle' : 'ios-checkmark-circle'} color={SelectedLanguage == 1 ? '#43CC53' : '#DDD'} size={28} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.ToggleLanguages(2)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, marginLeft: 10, marginTop: 10, marginRight: 10 }}>
                    <Text style={styles.LanguageStyle}>Swedish</Text>
                    <Ionicons name={Platform == 'android' ? 'md-checkmark-circle' : 'ios-checkmark-circle'} color={SelectedLanguage == 2 ? '#43CC53' : '#DDD'} size={28} />
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity style={styles.SaveLanguageStyle} onPress={() => this.SetLanguageCode()}>
                    <Text style={styles.loginText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </Container>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    SurveyRedux: state.SurveyRedux,
  };
};
const mapDispatchToProps = dispatch => (
  bindActionCreators({
    viewSurvey,
    clientID,
    surveyToken,
    ActionUpdate
  }, dispatch)
);

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(PatientProfile))

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 300,
    marginTop: 16,
  },
  SaveLanguageStyle: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#43CC53',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: (Platform.OS == 'ios') ? 20 : 0

  },
  loginText: {
    position: 'absolute',
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ModalInsideView: {
    flexDirection: 'column',
    backgroundColor: "#FFF",
    height: 250,
    width: '90%',
    borderRadius: 5,
  },
  LanguageStyle: {
    fontSize: 14,
    color: "#000",
    fontFamily: Fonts.Roboto
  },
  TextStyle: {
    fontSize: 18,
    color: "#000",
    textAlign: 'center',
    fontFamily: Fonts.Roboto
  }
});