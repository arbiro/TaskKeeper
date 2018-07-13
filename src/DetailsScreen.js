import React, { Component } from 'react';

import { AppRegistry, Text, TextInput, Button , View, Picker} from 'react-native';

export default class DetailsScreen extends React.Component {
  render() {
    return (
     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Details Screen</Text>
        <Button
          title="Go to Home"
          onPress={() => this.props.navigation.navigate('Home')}
        />

        <Button
          title="Add task"
          onPress={() => this.props.navigation.navigate('AddTask')}
        />
      </View>
    );
  }
}
