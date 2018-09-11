import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker, AppState, TouchableOpacity, Image, PushNotificationIOS} from 'react-native';
import Stars from 'react-native-stars-rating';
import ProgressBarAnimated from 'react-native-progress-bar-animated';

//TODO refactor app. move stuff in good places, this homescreen is already huge

import {Notifications, setNotificationCategoryForContinuePause} from './Notifications'
//var {PushNotification, setNotificationCategoryForContinuePause} = require('./Notifications');

export class TaskTimer extends React.Component
{
  constructor(props)
  {
    super(props)
    //setNotificationCategoryForContinuePause();
    this.taskStore = this.props.taskStore;
    this.usedTask = this.props.task;
    this.timeLastRan = this.taskStore.getTaskLastRunningTime(this.usedTask);
    this.running = this.props.running;
    this.timeRanToday = this.taskStore.getTaskRunningTimeInBetween(this.usedTask);
    this.state = {running: false, everRan: false, timeLastRan: this.timeLastRan, timeRanToday: this.timeRanToday, dailyProgress: 0};
  }

  updateState()
  {
    if (this.usedTask)
    {
    this.timeLastRan = this.taskStore.getTaskLastRunningTime(this.usedTask);
    this.timeRanToday = this.taskStore.getTaskRunningTimeInBetween(this.usedTask);
    this.minDailyTime = this.usedTask.minDailyTime;
    this.setState(
      { timeLastRan: this.timeLastRan,
        everRan: this.timeLastRan !== 0,
        running: this.running,
        timeRanToday: this.timeRanToday,
        dailyProgress: Math.min(Math.floor(((this.timeRanToday/60)/this.minDailyTime )*100),100)})
    }
  }

  componentDidMount()
  {
    this.updateState();
    this.interval = setInterval(() => this.updateState(), 300);
  }


  componentDidUpdate(prevProps)
  {
    if (prevProps.task !== this.props.task || prevProps.running !== this.props.running)
    {
      this.usedTask = this.props.task;
      this.updateState();
      console.log(" Time ran today: "+ this.durationToString(this.timeRanToday));
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
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start' ,alignItems: 'center', paddingTop: 0}}>
      <ProgressBarAnimated
      width={300}
      maxValue={100}
      value={this.state.dailyProgress}/>
      <Text>{this.state.running ?
      "Task running "  +this.durationToString(this.state.timeLastRan):
      this.state.everRan ?
      "Task last ran " + this.durationToString(this.state.timeLastRan) : ""}
      </Text>
      <Text> {this.state.everRan? "Total time today:" + this.durationToString(this.state.timeRanToday) : ""}</Text>
    </View>
        );
  }
}

export default class HomeScreen extends React.Component {
  constructor(props)
  {
    super(props)

    this.taskStore = this.props.screenProps.taskStore;
    this.state = {time: "", running: this.taskStore.isTaskRunning(this.taskStore.tasks[0]), selectedService: 0, currentRating: 3, appState: "", pomodoroTime: 10};
    //this.listenerId = this.taskStore.addListener(this.forceUpdate.bind(this));
    setNotificationCategoryForContinuePause(this.pomodoroContinue.bind(this), this.pomodoroPause.bind(this));
    Notifications.consumeBackgroundQueue();
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.setState({appState: nextAppState});
  }

  componentDidMount()
  {
    this.listenerId = this.taskStore.addListener(this.forceUpdate.bind(this));
    //this.interval = setInterval(() => this.setState({ time: this.taskStore.getRunningTime(this.state.selectedService) }), 5000);
    this.setState({selectedServicePos: this.taskStore.getRunningTaskIndex(), running: this.taskStore.isTaskRunning(this.taskStore.tasks[this.state.selectedService])})
    AppState.addEventListener('change', this._handleAppStateChange);
    this.willFocusNavSub = this.props.navigation.addListener(
'willFocus',
payload => {
  this.selectNavigationGivenTask();
}
);
  }

  componentWillMount()
  {

  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  //clearInterval(this.interval);
  this.taskStore.removeListener(this.listenerId);
  this.willFocusNavSub.remove();


}

  changerunning()
  {
    Notifications.cancelAllLocalNotifications();
    let runningTask = this.taskStore.getRunningTaskIndex();
    if (runningTask != this.state.selectedService)
    {
      this.taskStore.addEventToTask(this.taskStore.tasks[this.taskStore.getRunningTaskIndex()], 3);

    }
    let selectedTask = this.taskStore.tasks[this.state.selectedService];
    this.taskStore.addEventToTask(selectedTask, this.state.currentRating);
    this.setState({running: this.taskStore.isTaskRunning(selectedTask)});

    //this.setState(previousState => {
///  return { running: !this.state.selectedService.state };
  //  });
  }

  pomodoroRunTask()
  {
    this.changerunning();
    Notifications.localNotification({
	alertBody: "Wow, worked for " + String(this.state.pomodoroTime) + " minutes!",
	alertTitle: "POMODORO",
	soundName: "chime.aiff",
	category: "POMODORO",
	userInfo: { },
  fireDate: new Date(Date.now() + (1000 * this.state.pomodoroTime* 60))
});
    /*PushNotification.localNotificationSchedule({
  //... You can use all the options from localNotifications
  message: "Wow, worked for " + String(this.state.pomodoroTime) + " minutes!", // (required)
  date: new Date(Date.now() + (1000 * this.state.pomodoroTime)),
  category: "PomodoroBreakTime",
actions: '["Yes", "No"]' // in 60 secs * 60
});*/

  }

  pomodoroContinue()
  {

  }

  pomodoroPause()
  {
    this.changerunning();
  }

  pomodoroContinueWithSnooze()
  {
    Notifications.localNotification({
	alertBody: "Wow, worked for " + String(this.state.pomodoroTime) + " minutes!",
	alertTitle: "POMODORO",
	soundName: "chime.aiff",
	category: "POMODORO",
	userInfo: { },
  fireDate: new Date(Date.now() + (1000 * 5))
});
  }

  pomodoroPauseWithSnooze()
  {
    this.changerunning();
    Notifications.localNotification({
	alertBody: "Wow, took a break for " + String(this.state.pomodoroTime) + " minutes!",
	alertTitle: "POMODORO",
	soundName: "chime.aiff",
	category: "POMODORO",
	userInfo: { },
  fireDate: new Date(Date.now() + (1000 * 5))
});
  }

  onPickNewTask(service, pos)
  {
    //let runnningTaskPos = this.taskStore.getRunningTaskIndex();
    this.setState({selectedService: pos,running: this.taskStore.isTaskRunning(this.taskStore.tasks[pos])})
    console.log("Running state "+ this.state.running);
  }

  giveRandomTask()
  {
    let newSelected = Math.floor(Math.random() * this.taskStore.tasks.length);
    console.log("New selected "  + newSelected)
    this.setState({selectedService: newSelected});
  }

  getPicker()
  {

  }

  componentWillFocus()
  {
  }

  componentWillReceiveProps()
  {
  }

  selectNavigationGivenTask()
  {
    let goToTask = this.props.navigation.getParam('task', null);
    if (goToTask!=null)
    {
      taskIndex = this.taskStore.getTaskIndex(goToTask);
      this.setState({selectedService: taskIndex});
    }
  }

  render() {
    //console.log("Running state "+ this.state.running);
    let tasks = this.taskStore.tasks
    let serviceItems = tasks ? tasks.map( (obj, index) => {
            return <Picker.Item key={index} value={index} label={obj.name} />
        }) : <Text>Loading...</Text>;

        let info = this.taskStore.tasks
      ? 'Number of tasks in this Realm: ' + this.taskStore.tasks.length
      : 'Loading...';
        let pomodoroView = ( <View opacity={this.state.running ? 0.2 : 1} style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start' ,alignItems: 'center'}}>
          <Picker disabled={this.state.running} style={{width: 100}} itemStyle={{height: 70}}
              selectedValue={this.state.pomodoroTime}
              onValueChange={(itemValue, itemIndex) => this.setState({pomodoroTime: itemValue})}
              >
            <Picker.Item label="5m" value={5} />
            <Picker.Item label="10m" value={10} />
            <Picker.Item label="15m" value={15} />
            <Picker.Item label="20m" value={20} />
            <Picker.Item label="25m" value={25} />
          </Picker>
          <TouchableOpacity disabled={this.state.running}   onPress={()=>{this.pomodoroRunTask()}}>
            <Image style={{width: 50, height: 50}} source={require("../assets/tomato.png")}/>
        </TouchableOpacity>
      </View>);
        return (
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start' ,alignItems: 'center', paddingTop: 50}}>


                <Text style={{width: 300,  textAlign: 'center' }}>Pick a service</Text>
                <Picker itemStyle={{height: 300}} style={{width: 300}} 
                    selectedValue={this.state.selectedService}
                    onValueChange={this.onPickNewTask.bind(this)  }
                    >

                    {serviceItems}
                </Picker>
                <TaskTimer taskStore={this.taskStore} task ={this.taskStore.tasks[this.state.selectedService]} running = {this.state.running}/>

                <Button
                  title= {this.state.running ? "Stop" : "Start"}
                  onPress= {this.changerunning.bind(this)}
                />
                <Stars
                isActive={true}
                rateMax={5}
                isHalfStarEnabled={false}
                onStarPress={(rating) => this.setState({currentRating: rating})}
                rate={3}
                size={60}
              />
                  {pomodoroView}

                <Button
                title="Give me something to do"
                onPress={this.giveRandomTask.bind(this)}
                />

                <Text>
                  {info}
                </Text>
            </View>
    );
  }
}
