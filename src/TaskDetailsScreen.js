import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker, FlatList} from 'react-native';
import { CheckBox } from 'react-native-elements'
import DatePicker from 'react-native-datepicker'
import ProgressBarAnimated from 'react-native-progress-bar-animated';
//import ReactDOM from 'react-dom';
const moment = require('moment')

export default class TaskDetailsScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    this.state = { text: 'Task', daily: false, minDailyTime: 15};
    const { navigation } = this.props;
    this.addTask = navigation.getParam('addTask', true);
    this.task = navigation.getParam('task', null);
    if (!this.addTask)
    {
      this.state = { text: this.task.name, daily: this.task.daily, minDailyTime: this.task.minDailyTime, events: this.task.events}
    }
  }

  componentDidMount(){}

  onPressSaveAddTask()
  {
    let text = this.state.text;
    let daily = this.state.daily;
    const { navigation } = this.props;
    if (this.addTask)
    {
      this.taskStore.addTask({name: text, daily: daily, minDailyTime: this.state.minDailyTime});
    }
    else if (this.task != null){
      this.taskStore.doUpdate( () => {this.task.name = text; this.task.daily = daily; this.task.minDailyTime = this.state.minDailyTime; });
    }
    this.props.navigation.navigate('Details')
  }
  onPressDeleteTask()
  {
    let text = this.state.text;
    let daily = this.state.daily;
    const { navigation } = this.props;
    if (this.task != null){
      this.taskStore.deleteTask(this.task);
    }
    this.props.navigation.navigate('Details')

  }



  render() {
    const { navigation } = this.props;
    deleteButton =  <Button
       title={this.addTask ? "" : "Delete Task"}
       onPress={this.onPressDeleteTask.bind(this)}
     />;
    let events = this.addTask ? null : this.state.events;
    let serviceItems = events ? events.map( (obj, index) => {
            return {key: String(index) , name: obj.type, index: index, time: moment(obj.time).format('DD/MM/YYYY HH:mm:ss')}
        }) : null;
    //const otherParam = navigation.getParam('otherParam', 'some default value');
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{this.addTask ? "Add task screen" : this.task.name}</Text>
        <TextInput
       style={{height: 100, width: 150, borderColor: 'gray', borderWidth: 1}}
       onChangeText={(text) => this.setState({text})}
       value={this.state.text}/>

       <CheckBox center title='Daily' checked={this.state.daily}
         onPress={() => this.setState({daily: !this.state.daily})}
          />
          <Picker style={{width: 300}}
              selectedValue={this.state.minDailyTime}
              onValueChange={(itemValue, itemIndex) => this.setState({minDailyTime: itemValue})}
              >
            <Picker.Item label="15m" value={15} />
            <Picker.Item label="30m" value={30} />
            <Picker.Item label="45m" value={45} />
            <Picker.Item label="1h" value={60} />
          </Picker>
       <FlatList
        data={serviceItems}
         renderItem={({item}) => ( <Text>
         {item.name + " " +  item.time}
         </Text>)}/>

       <Button
         title={this.addTask ? "Add task" : "Save Task"}
         onPress={this.onPressSaveAddTask.bind(this)}
       />
       {deleteButton}
      </View>
    );
  }
}
