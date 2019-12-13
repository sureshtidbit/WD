
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  StatusBar 
} from 'react-native';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Reducer from './src/redux/index';
const store = createStore(Reducer);
import Routes from './src/Routes';
export default class App extends Component {
  render() {
    return (
      <Provider store={ store }>
      <View style={styles.container}>
        <StatusBar
           backgroundColor="#1c313a"
           barStyle="light-content"
         />
        <Routes navigation={this.props.navigation}/>
      </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container : {
    flex: 1,
  }
});
