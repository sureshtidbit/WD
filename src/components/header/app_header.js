import React, { Component } from 'react';
import {
    StyleSheet
} from 'react-native';
import { Header, Left, Right, Body, Title, Text, Icon, Button } from 'native-base';
import {
    withNavigation
} from 'react-navigation';
import { Fonts } from '../../utils/fonts'

/*
App header
*/
class AppHeader extends Component {
    GoBack() {
        this.props.HeaderGoBack();
    }
    render() {
        return (
            <Header style={{ backgroundColor: "#43CC53" }}>
                <Left style={{ flex: 0.6 }}>
                    <Button transparent onPress={() => this.GoBack()}>
                        <Icon style={{ color: '#fff' }} name='arrow-back' />
                    </Button>
                </Left>
                <Body style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Title style={[styles.customBoldStyle, { color: '#fff' }]}>{this.props.title}</Title>
                </Body>
                <Right style={{ flex: 0.6 }}>
                </Right>
            </Header>
        )
    }
}
export default withNavigation(AppHeader)
const styles = StyleSheet.create({
    customBoldStyle: {
        fontFamily: Fonts.NotoSansBold,
        fontSize: 16
    }
});