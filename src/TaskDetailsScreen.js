import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker} from 'react-native';


export default class TaskDetailsScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    this.state = { text: 'Task'};
    const { navigation } = this.props;
    const addTask = navigation.getParam('addTask', false);
    const taskKey = navigation.getParam('taskKey', null);
    if (taskKey)
    {
      this.state = { text: this.taskStore.tasks[taskKey].name}
    }
  }

  onPressSaveAddTask()
  {
    t = this.state.text;
    const { navigation } = this.props;
    const addTask = navigation.getParam('addTask', false);
    const taskKey = navigation.getParam('taskKey', -1);
    if (addTask)
    {
      this.taskStore.addTask({name: t});
    }
    else if (taskKey != -1){
      this.taskStore.doUpdate( () => this.taskStore.tasks[taskKey].name = t );
    }
    this.props.navigation.navigate('Details')
  }

  render() {
    const { navigation } = this.props;
    const taskKey = navigation.getParam('taskKey', -1);
    const addTask = navigation.getParam('addTask', false);
    //const otherParam = navigation.getParam('otherParam', 'some default value');
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{addTask ? "Add task screen" : this.taskStore.tasks[taskKey].name}</Text>
        <TextInput
       style={{height: 100, width: 150, borderColor: 'gray', borderWidth: 1}}
       onChangeText={(text) => this.setState({text})}
       value={this.state.text}/>
       <Button
         title={addTask ? "Add task" : "Save Task"}
         onPress={this.onPressSaveAddTask.bind(this)}
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
