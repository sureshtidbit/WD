import React from 'react';
import { View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Badge } from 'react-native-elements'

/*
Add custom Icon Badges here
*/
export default class IconWithBadge extends React.Component {
  render() {
    const { name, badgeCount, color, size } = this.props;
    return (
      <View style={{ width: 24, height: 24, margin: 5 }}>
        <Ionicons name={name} size={size} color={color} />
        {badgeCount > 0 && (
          <View style={{
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
            <Badge badgeStyle={{ backgroundColor: '#ef5350' }} value={badgeCount} />
          </View>
        )}
      </View>
    );
  }
}