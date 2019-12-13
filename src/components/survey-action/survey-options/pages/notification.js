//This is an example code for Bottom Navigation//
import React from 'react';
//import react in our code.
import { StyleSheet } from 'react-native';
//import all the basic component we have used
import { Container, Content, Header, Left, Right, Body, Title, List, ListItem, Text,Icon, Button, Card, CardItem } from 'native-base';
import {
  withNavigation
} from 'react-navigation';
class NotificationScreen extends React.Component {
  //Detail Screen to show from any Open detail button
  render() {
    return (
      <Container>
      <Header>
        <Left>
        <Button transparent onPress= {()=>this.props.navigation.navigate('Home')}>
              <Icon name='arrow-back' />
            </Button>
        </Left>
        <Body>
          <Title>Notifications</Title>
        </Body>
        <Right />
      </Header>
      <Content>
          <List>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="md-notifications" />
              </Button>
            </Left>
            <Body>
              <Text>Notifications 1</Text>
            </Body>
            <Right>
              <Text>12:00 PM</Text>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="md-notifications" />
              </Button>
            </Left>
            <Body>
              <Text>Notifications 2</Text>
            </Body>
            <Right>
              <Text>4:00 AM</Text>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="md-notifications" />
              </Button>
            </Left>
            <Body>
              <Text>Notifications 3</Text>
            </Body>
            <Right>
              <Text>9:00 AM</Text>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
            <ListItem icon>
            <Left>
              <Button style={{ backgroundColor: "#007AFF" }}>
                <Icon active name="md-notifications" />
              </Button>
            </Left>
            <Body>
              <Text>Notifications 4</Text>
            </Body>
            <Right>
              <Text>11:00 PM</Text>
              <Icon active name="arrow-forward" />
            </Right>
          </ListItem>
          </List>
        </Content>
      </Container>
   
    );
  }
}
export default withNavigation(NotificationScreen)