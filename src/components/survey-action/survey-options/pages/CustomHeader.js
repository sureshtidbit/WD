//This is an example code for Bottom Navigation//
import React, {Component} from 'react';
//import react in our code.
import { Text, View, TouchableOpacity, StyleSheet,AsyncStorage } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Actions } from 'react-native-router-flux';
//import all the basic component we have used

export default class CustomHeader extends React.Component {
  //Detail Screen to show from any Open detail button
  Logout(){
    AsyncStorage.removeItem('jwt_token')
    Actions.Login();
  }
  render() {
    return (
      <View style={{ backgroundColor: "#ccc", height: 60, alignContent: 'flex-end' }}>
      <TouchableOpacity onPress={this.Logout}>
        <MaterialIcon name="logout" size={30} color="#900" />
        </TouchableOpacity>
      </View>
    );
  }
}