import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    Platform,
    Image,
    Dimensions,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    FlatList,
    StatusBar,
    Linking
} from "react-native";

import { withNavigation } from 'react-navigation'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Container, Thumbnail, Header, Picker, Left, Body, Right, Button, Icon } from 'native-base';
import { Avatar } from 'react-native-paper';
import { connect } from 'react-redux';

const SWidth = Dimensions.get('window').width
class SurveysNotification extends Component {
    constructor() {
        super();
        this.state = {
            refreshing: false,
            Loading: false,
            Notifications: [{ id: '1' }, { id: '2' }],
            PageNo: 1,
            per_page: 10,
            LoadingTrack: false,
        }
    }
    GoBack() {
        this.props.navigation.navigate('Home');
    }
    RenderIcon(item) {
        return <Avatar.Icon size={48} color="#fff" icon="person-add" style={{ backgroundColor: '#ff5733' }} />
    }
    FlatListItemSeparator = () => {
        if (this.state.Notifications.length > 0) {
            return <View style={styles.line} />
        } else {
            return <View></View>
        }

    }
    renderItem = data => {
        console.log(data)
        return <TouchableOpacity style={{ flexDirection: 'row', paddingLeft: 10, marginTop: 10, marginBottom: 10, paddingRight: 10, alignItems: 'center' }}>
            {this.RenderIcon(data.item)}
            <View style={{ paddingLeft: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#AAA', marginRight: 80 }}>
                    {'first pending survey'}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#CCC', marginRight: 80 }}>
                    {'20-20-2910'}
                </Text>
            </View>
            <View
                style={{
                    position: 'absolute', right: 0, margin: 10, paddingLeft: 10, paddingRight: 10
                }}>
                <Ionicons size={24} color="#AAA" name={Platform.OS == 'android' ? "md-arrow-forward" : "ios-arrow-forward"} />
            </View>
        </TouchableOpacity>
    }
    OpenDrawer() {
        this.props.navigation.openDrawer();
    }
    render() {
        let Loading = this.state.Loading
        console.log(this.props.navigation, 'navigation')
        return (
            <Container style={styles.container}>
                <Header style={{ backgroundColor: '#43CC53' }}>
                    <Left style={{ flex: 0.3 }}>
                        <Button onPress={() => this.GoBack()} transparent>
                            <Icon size={32} style={{ color: '#fff' }} name='arrow-back' />
                        </Button>
                    </Left>
                    <Body style={{ alignItems: 'center', justifyContent: 'center', flex: 2 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: "#FFF" }}>Notification</Text>
                    </Body>
                    <Right style={{ alignItems: 'center', flex: 0.3, marginTop: 5, marginBottom: 5 }}>
                    </Right>
                </Header>
                {Loading ?
                    <View style={{ marginTop: 100, position:'absolute', width:'100%', justifyContent:'center', alignItems:'center' }}>
                        <ActivityIndicator size={32} color="#43CC53" />
                    </View> : null}
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    horizontal={false}
                >
                    <View style={styles.container}>
                        <FlatList
                            data={this.state.Notifications}
                            ItemSeparatorComponent={this.FlatListItemSeparator}
                            renderItem={item => this.renderItem(item)}
                            keyExtractor={item => item.id}
                            extraData={this.state}
                            ListFooterComponent={this.FlatListItemSeparator}
                        />
                    </View>
                </ScrollView>
                <StatusBar backgroundColor={'#43CC53'} barStyle="light-content" />
            </Container>
        );
    }
}

export default withNavigation(SurveysNotification);

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    searchSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 50
    },
    searchIcon: {
        paddingLeft: 10,
    },
    input: {
        flex: 1,
        paddingTop: 10,
        paddingRight: 10,
        paddingBottom: 10,
        paddingLeft: 5,
        backgroundColor: '#fff',
        color: '#424242',
        borderRadius: 50
    },
    line: {
        height: 0.5,
        width: SWidth,
        backgroundColor: "#BBB"
    },
});
