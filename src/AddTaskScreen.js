import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker} from 'react-native';


export default class AddTaskScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    this.state = { text: 'Task'};
  }

  onPressAddTask()
  {
    t = this.state.text;
    this.taskStore.addTask({name: t})
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Add task screen</Text>
        <TextInput
       style={{height: 100, width: 150, borderColor: 'gray', borderWidth: 1}}
       onChangeText={(text) => this.setState({text})}
       value={this.state.text}/>
       <Button
         title="Add task"
         onPress={this.onPressAddTask.bind(this)}
       />
        <Button
          title="Go to Home"
          onPress={() => this.props.navigation.navigate('Home')}
        />

        <Button
          title="Go to details"
          onPress={() => this.props.navigation.navigate('Details')}
        />
      </View>
    );
  }
}
