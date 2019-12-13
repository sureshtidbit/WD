import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image, Dimensions
} from "react-native";

class QuestionImage extends Component {

    render() {
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
        return (
            <View style={{flex: 1,
                height: windowHeight * 0.15, width: windowWidth -40, marginLeft: 20,
                marginRight: 0, borderWidth: 0.5, borderColor: '#dddddd'
            }}>
                <View style={{ flex: 1 }}>
                    <Image source={{ uri: this.props.imageUri }}
                        style={{ flex: 1, width: undefined, height: undefined, resizeMode: 'stretch' }}
                    />
                </View>
            </View>
        );
    }
}
export default QuestionImage;