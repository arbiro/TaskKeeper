import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import RealmTasks from './RealmTasks'
import TaskStore from './TaskStore'
import DetailsScreen from './DetailsScreen'
import AddTaskScreen from './AddTaskScreen'
import HomeScreen from './HomeScreen'


let realmTasks = new RealmTasks();


const taskStore = new TaskStore(realmTasks);


export default class TaskKeeper extends React.Component {
  render() {
    //console.log('this.props in MyApp', this.props); // This will list the initialProps.

    // StackNavigator **only** accepts a screenProps prop so we're passing
    // initialProps through that.
    let properties = {taskStore: taskStore };
    return <Navigator screenProps={properties}/>;
  }
}


const Navigator = StackNavigator(
  {
   Home: HomeScreen,
   Details: DetailsScreen,
   AddTask: AddTaskScreen
 },
 {
   initialRouteName: 'Home',
 }
);


// skip this line if using Create React Native App
AppRegistry.registerComponent('AwesomeProject', () => TaskKeeper);
