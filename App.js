import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import { observable } from 'mobx';
import { observer } from 'mobx-react';

//import Amplify from 'aws-amplify';
//import aws_exports from './aws-exports';
import Realm from 'realm';
const moment = require('moment')
//import Realm from 'realm'

/*let repository = new Realm({
    schema: [{
	name: 'Item',
	primaryKey: 'id',
	properties: {
	    id: {type: 'string', indexed: true},
	    title: 'string',
	    completed: 'bool',
	    createdAt: 'date',
	    updatedAt: 'date'
	}
    }]
});*/


//Amplify.configure(aws_exports);
// In App.js in a new project

const startEventType = 'START';
const stopEventType = 'STOP';

const EventSchema =
{
  name: 'Event',
  properties: { type: 'string', time: 'int' }
}

const TaskSchema = {
  name: 'Task',
  properties: {
    name:  'string',
    events: 'Event[]',
    parentTask: 'Task?'
  }
}


const ADD_TODO = 'ADD_TODO'





class RealmTasks
{
  constructor()
  {
    this.realm = new Realm({schema: [EventSchema, TaskSchema]});
    this.realm.write(() => {});
  }

  linkToRealmNotify(notifyCallBack)
  {
    this.realm.addListener('change', notifyCallBack);
  }

  fetchTasks()
  {
    return this.realm.objects('Task');
  }

  addTask(task)
  {
    this.realm.write(() => {this.realm.create('Task', task)});
  }

  addEventToTask(task, event)
  {
    this.realm.write(() => {
           task.events.push(event)
         });
  }

}

let realmTasks = new RealmTasks();


getTimeDiffAsString = function(start, end)
{
  const startDate = moment(start);
  const timeEnd = moment(end);
  const diff = timeEnd.diff(startDate);
  const diffDuration = moment.duration(diff);
  return diffDuration.hours() + ":" + diffDuration.minutes() + ":" + diffDuration.seconds();
}

class TaskStore
{
 tasks = [];
 test = "sdasa";
 listeners = [];

  constructor(realmTasks)
  {
      this.realmTasks = realmTasks;
      //this.fetchTasks();
      this.realmTasks.linkToRealmNotify(this.notify.bind(this));
      this.fetchTasks();
  }

  addListener(listener)
  {
    this.listeners.push(listener)
  }

  notify()
  {
    this.fetchTasks();
    this.listeners.map( function(f) {f()}) // call listeners
  }

  fetchTasks()
  {
      this.tasks = realmTasks.fetchTasks()
  }

  addTask(task)
  {
    realmTasks.addTask(task)
  }

  addEventToTask(taskKey)
  {
    let task = this.tasks[taskKey]
    let state = startEventType;
    if (task.events.length > 0 )
    {
      if (task.events.slice(-1)[0].type == startEventType)
        state = stopEventType;
    }
    event = {type: state, time: Date.now()}

    realmTasks.addEventToTask(task, event)
  }

  isTaskRunning(taskKey)
  {
    let task = this.tasks[taskKey];
    if (task && task.events.length>0)
    {
      return task.events.slice(-1)[0].type == startEventType;
    }
    return false
  }

  getRunningTime(taskKey)
  {
    let task = this.tasks[taskKey];
    if (task && task.events.length>1)
    {
      let lastEvents = task.events.slice(-2);
      if (lastEvents[1].type == startEventType)
      {
        return getTimeDiffAsString(lastEvents[1].time, Date.now());
      }
      return getTimeDiffAsString(lastEvents[0].time,lastEvents[1].time);
    }
    else if(task && task.events.length>0)
    {
      let lastEvent = task.events.slice(-1);
      return getTimeDiffAsString(lastEvent[0].time, Date.now());
    }

    return ""
  }
}

const taskStore = new TaskStore(realmTasks);

class DetailsScreen extends React.Component {
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

class AddTaskScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.state = { text: 'Task'};
  }

  onPressAddTask()
  {
    t = this.state.text;
    taskStore.addTask({name: t})
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





class HomeScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.state = {time: "", runningState: false, selectedService: "", selectedServicePos: -1};
    taskStore.addListener(this.forceUpdate.bind(this))
  }

  componentDidMount()
  {
    this.interval = setInterval(() => this.setState({ time: taskStore.getRunningTime(this.state.selectedServicePos) }), 1000);
  }

  componentWillMount()
  {

  }

  componentWillUnmount() {
  clearInterval(this.interval);
}

  changeRunningState()
  {
    taskStore.addEventToTask(this.state.selectedServicePos);
    this.setState({runningState: taskStore.isTaskRunning(this.state.selectedServicePos)})

    //this.setState(previousState => {
///  return { runningState: !this.state.selectedService.state };
  //  });
  }

  onPickNewTask(service, pos)
  {
    this.setState({selectedService: service,selectedServicePos: pos ,runningState: taskStore.isTaskRunning(pos), time: taskStore.getRunningTime(this.state.selectedServicePos) })
  }

  render() {
    let tasks = taskStore.tasks

    let serviceItems = tasks ? tasks.map( (obj, index) => {
            return <Picker.Item key={index} value={index} label={obj.name} />
        }) : <Text>Loading...</Text>;

        let info = taskStore.tasks
      ? 'Number of tasks in this Realm: ' + taskStore.tasks.length
      : 'Loading...';

        return (
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start' ,alignItems: 'center', paddingTop: 50}}>
                <Text style={{width: 200, backgroundColor: 'powderblue',  textAlign: 'center' }}>Pick a service</Text>
                <Picker style={{width: 200,  backgroundColor: 'powderblue'}}
                    selectedValue={this.state.selectedService}
                    onValueChange={this.onPickNewTask.bind(this)  } >

                    {serviceItems}
                </Picker>
                <Text>{this.state.time}</Text>
                <Button
                  title= {this.state.runningState ? "Stop" : "Start"}
                  onPress= {this.changeRunningState.bind(this)}
                />

                <Button
                  title="Go to Details"
                  onPress={() => this.props.navigation.navigate('Details')}
                />

                <Text>
                  {info}
                </Text>
            </View>
    );
  }
}


export default createStackNavigator(
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
AppRegistry.registerComponent('AwesomeProject', () => createStackNavigator);
