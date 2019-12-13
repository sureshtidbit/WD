//This is an example code for Bottom Navigation//
import React, { Component } from 'react';
//import react in our code.
import { View,StatusBar, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Container, Content, Header, Left, Right, Body, Badge, Title, List, ListItem, Text, Icon, Button, Card, CardItem, Thumbnail } from 'native-base';
import {
  withNavigation
} from 'react-navigation';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextInput } from 'react-native-paper';
import { ActionUpdate } from '../../../../redux/surveyAction'
import Toast from 'react-native-simple-toast';
import { API } from '../../../../auth/index'
import RNFetchBlob from 'react-native-fetch-blob'

class ChangePassword extends React.Component {
  //Detail Screen to show from any Open detail button
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      confirm_passwordError: false,
      old_passwordError: false,
      new_passwordError: false,
      ErrorStatus: false,
      OldErrorText: '',
      PassErrorText: '',
      ConErrorText: ''
    };
    this.old_password = ""
    this.new_password = ""
    this.confirm_password = ""
  }
  OnChangeHandle(e, type) {
    console.log(e, type)
    this.setState({ ConErrorText: "", OldErrorText: '', PassErrorText: '' })
    switch (type) {
      case 1:
        this.old_password = e
        this.setState({ old_passwordError: false })
        break;
      case 2:
        this.new_password = e
        this.setState({ new_passwordError: false })
        break;
      case 3:
        this.confirm_password = e
        this.setState({ confirm_passwordError: false })
        break;

    }
  }
  ChangePasswordMethod() {
    var state = 0
    this.setState({ ConErrorText: "", OldErrorText: '', PassErrorText: '' })
    if (!this.old_password) {
      state = 1
      this.setState({ old_passwordError: true })
    }
    if (!this.new_password) {
      state = 1
      this.setState({ new_passwordError: true })
    }
    if (!this.confirm_password) {
      state = 1
      this.setState({ confirm_passwordError: true })
    }
    if (this.new_password != this.confirm_password) {
      state = 1
      this.setState({ ConErrorText: "The password and confirm password doesn't match" })
    }
    if (state == 1) {
      return 0;
    }

    var url = API + 'change-password?clientId=' + this.props.SurveyRedux.client_id
    const details = {
      'old_password': this.old_password,
      'new_passwod': this.new_password,
      'confirm_passwod': this.confirm_password
    };
    this.setState({ loader: true })
    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    console.log('form-body', formBody)
    // fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Cache-Control': 'no-cache',
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: formBody
    // }).then((response) => response.json())
    //   .then((responseData) => {
    RNFetchBlob.config({
      trusty: true
    }).fetch('POST', url, {
      'Cache-Control': 'no-cache',
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }, formBody)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({ loader: false })
        console.log(responseData, url, 'responseData')
        if (responseData.status === "ok") {
          // Toast.show('Password changed successfully!', Toast.SHORT);
          this.props.ActionUpdate('Password changed successfully!')
          console.log('1')
          this.props.navigation.replace('User')
          console.log('2')
        } else {
          if (responseData.status === "failed") {
            if (responseData.old_password) {
              this.setState({ OldErrorText: "The old password doesn't match the current password" })
            }
            if (responseData.password1) {
              this.setState({ PassErrorText: 'The password have to at least 6 characters' })
            }
            if (responseData.password2) {
              this.setState({ ConErrorText: 'The confirm password have to at least 6 characters' })
            }
          }
          this.setState({ loader: false })
        }

      }).catch(err => {
        console.log('3', err)
        this.setState({ loader: false })
      })
  }
  render() {
    return (
      <Container style={{ backgroundColor: "#f1f2f7" }}>
        <Header style={{ backgroundColor: "#43CC53" }}>
          <Left style={{ flex: 0.7 }}>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon style={{ color: '#fff' }} name='arrow-back' />
            </Button>
          </Left>
          <Body style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Title style={{ color: '#fff' }} >Change Password</Title>
          </Body>
          <Right style={{ flex: 0.7 }}>
          </Right>
        </Header>
        <StatusBar backgroundColor='#43CC53' barStyle="light-content" />
        <View style={styles.container}>
          <ScrollView
          keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >

            <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>

              {this.state.ErrorStatus ? <View style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 5 }}>
                <Text style={styles.ErrorText}>This personnummer doesn't exist!</Text>
              </View> : null}

              <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    error={this.state.old_passwordError}
                    mode={'outlined'}
                    secureTextEntry={true}
                    style={{ width: undefined, paddingRight: 20 }}
                    label='Old Password'
                    value={this.old_password}
                    onChangeText={(old_password) => this.OnChangeHandle(old_password, 1)}
                    theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent' } }}
                  />
                  {this.state.OldErrorText ? <Text style={{ color: '#f00', fontSize: 12 }}>{this.state.OldErrorText}</Text> : null}
                </View>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    error={this.state.new_passwordError}
                    mode={'outlined'}
                    secureTextEntry={true}
                    style={{ width: undefined, paddingRight: 20 }}
                    label='New Password'
                    value={this.new_password}
                    onChangeText={(new_password) => this.OnChangeHandle(new_password, 2)}
                    theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent' } }}
                  />
                  {this.state.PassErrorText ? <Text style={{ color: '#f00', fontSize: 12 }}>{this.state.PassErrorText}</Text> : null}
                </View>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 15, marginLeft: 25, marginRight: 25, marginBottom: 15, height: 50 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    error={this.state.confirm_passwordError}
                    mode={'outlined'}
                    secureTextEntry={true}
                    style={{ width: undefined, paddingRight: 20 }}
                    label='Confirm Password'
                    value={this.confirm_password}
                    onChangeText={(confirm_password) => this.OnChangeHandle(confirm_password, 3)}
                    theme={{ colors: { background: '#f1f2f7', placeholder: '#aaa', text: '#000', primary: '#43CC53', underlineColor: 'transparent' } }}
                  />
                  {this.state.ConErrorText ? <Text style={{ color: '#f00', fontSize: 12 }}>{this.state.ConErrorText}</Text> : null}
                </View>
              </View>
              <TouchableOpacity onPress={() => this.ChangePasswordMethod()} style={{ flexDirection: 'row', marginLeft: 25, marginRight: 25, marginTop: 35, marginBottom: 15, height: 50, backgroundColor: 'rgba(67,204,83,1)', borderColor: '#43CC53', borderWidth: 1, borderRadius: 5 }}>
                <TouchableOpacity onPress={() => this.ChangePasswordMethod()} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  {!this.state.loader ? <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFF' }}>Change Password</Text> : <ActivityIndicator size="small" color="#FFF" />}
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    ActionUpdate
  }, dispatch)
);
export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(ChangePassword))
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
