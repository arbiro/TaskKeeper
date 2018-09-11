import React, { Component } from 'react';

import { AppRegistry, Text, TextInput, Button , View, Picker, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  runningItem: {
    padding: 10,
    fontSize: 18,
    height: 44,
    color: 'green'
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})

DailyProgress = []

export class DailyTask extends React.Component
{
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.taskStore;
    this.style = this.props.style;
    this.task = this.props.task;

    this.timeLastRan = this.taskStore.getTaskLastRunningTime(this.task);
    this.running = this.props.running;
    this.timeRanToday = this.taskStore.getTaskRunningTimeInBetween(this.task);
    this.state = {running: false, everRan: false, timeLastRan: this.timeLastRan, timeRanToday: this.timeRanToday, dailyProgress: 0, name: this.task.name};
  }

  updateState()
  {
    this.name = this.task.name;
    this.timeLastRan = this.taskStore.getTaskLastRunningTime(this.task);
    this.timeRanToday = this.taskStore.getTaskRunningTimeInBetween(this.task);
    this.minDailyTime = this.task.minDailyTime;
    let dailyProgress = Math.min(Math.floor(((this.timeRanToday/60)/this.minDailyTime )*100),100);
    this.setState(
      { name: this.task.name,
        timeLastRan: this.timeLastRan,
        everRan: this.timeLastRan !== 0,
        running: this.running,
        timeRanToday: this.timeRanToday,
        dailyProgress: dailyProgress})
  }

  componentDidMount()
  {
    this.updateState();
    this.interval = setInterval(() => this.updateState(), 5000);
  }


  componentDidUpdate(prevProps)
  {
    if (prevProps.task !== this.props.task)
    {
      this.task = this.props.task;
      this.style = this.props.style;
      this.updateState();
      //console.log(" Time ran today: "+ this.durationToString(this.timeRanToday));
    }
  }

  componentWillUnmount() {
  clearInterval(this.interval);
}

  durationToString(duration)
  {
    return String(Math.floor(duration/60)) + ":" + Math.floor(duration%60);
  }

  render()
  {
    return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start' ,alignItems: 'center', paddingTop: 80}}>
      <TouchableOpacity onPress={this.props.onPress}>
      <ProgressBarAnimated
      width={300}
      maxValue={100}
      value={this.state.dailyProgress}/>
      <Text
      style={this.style}> {this.state.name} </Text>
      </TouchableOpacity>
    </View>
        );
  }
}


export default class DailyScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    this.state = {dailyCompletition: this.taskStore.getDayliesCompletion()};

    //this.listenerId = this.taskStore.addListener(this.forceUpdate.bind(this));
  }

  forceUpdate()
  {
    this.setState({});
  }
  componentWillFocus()
  {

  }

  updateState()
  {
    this.setState({dailyCompletition: this.taskStore.getDayliesCompletion()})
  }

  componentDidMount()
  {
    this.listenerId = this.taskStore.addListener(this.forceUpdate.bind(this));
    this.interval = setInterval(() => this.updateState(), 5000);
  }

  componentWillUnmount()
  {
      this.taskStore.removeListener(this.listenerId);
      clearInterval(this.interval);
  }

  progressCallBack()
  {

  }

  render() {
    let tasks = this.taskStore.tasks
    let x = this.state;
    //TO DO - DON"T USE INDEX MAYBE
    let dailyItems = tasks ? tasks.filter( (obj) => {
            return obj.daily;
        }) : {};

    this.numberOfItems;
    let serviceItems = dailyItems.map( (obj, index) => {
            return {key: obj.name, obj: obj, index: index ,running:this.taskStore.isTaskRunning(obj)}
        });
    return (
     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
       <View style={{ marginTop: 2, padding: 30, flex: 1, alignItems: 'center',}}>
         <View style={{zIndex: 0}}>
       <ProgressBarAnimated
       width={300}
       height={100}
       maxValue={100}
       value={this.state.dailyCompletition}/>
     </View>
       <View style={{zIndex: 1, alignItems: 'center'}}>
       <Text>Daily Progress</Text>
      </View>
     </View>
      <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
      <FlatList
       data={serviceItems}
        renderItem={({item}) => ( <DailyTask onPress={() => this.props.navigation.navigate('Home', {task:item.obj})}
          style={item.running ? styles.runningItem : styles.item } taskStore={this.taskStore} task={item.obj}/>)}/>
      </View>
      </View>
    );
  }
}
