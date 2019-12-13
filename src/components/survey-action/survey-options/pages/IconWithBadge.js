import React from 'react';
//import react in our code.
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar, Badge, Icon, withBadge } from 'react-native-elements'


export default class IconWithBadge extends React.Component {
    render() {
      const { name, badgeCount, color, size } = this.props;
      return (
        <View style={{ width: 24, height: 24, margin: 5 }}>
          <Ionicons name={name} size={size} color={color} />
          { badgeCount > 0 && (
            <View style={{
              // If you're using react-native < 0.57 overflow outside of the parent
              // will not work on Android, see https://git.io/fhLJ8
              position: 'absolute',
              right: -2,
              top: -2,
              backgroundColor: 'red',
              borderRadius: 6,
              width: 15,
              height: 15,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {/* <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{badgeCount}</Text> */}
              <Badge badgeStyle={{backgroundColor:'#ef5350'}} value={badgeCount}/>
            </View>
          )}
        </View>
      );
    }
  }