import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker} from 'react-native';
import Stars from 'react-native-stars-rating';



export class TaskTimer extends React.Component
{
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.taskStore;
    this.usedTask = this.props.task;
    this.state = {time: ""};
    this.interval = setInterval(() => this.setState({ time: this.taskStore.getRunningTime(this.usedTask), everRan: this.taskStore.getRunningTime(this.usedTask) !== "", running: this.taskStore.isTaskRunning(this.usedTask)}), 100);
  }

  componentDidUpdate(prevProps)
  {
    if (prevProps.task !== this.props.task)
    {
      this.usedTask = this.props.task;
      this.setState({ time: this.taskStore.getRunningTime(this.usedTask), everRan: this.taskStore.getRunningTime(this.usedTask) !== "", running: this.taskStore.isTaskRunning(this.usedTask)});
    }
  }

  componentWillUnmount() {
  clearInterval(this.interval);
}

  render()
  {
    return (<Text>{this.state.running ?
      "Task running " + this.state.time :(
      this.state.everRan ?
      "Task last ran " + this.state.time : "")}
      </Text>);
  }
}

export default class HomeScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    this.state = {time: "", runningState: false, selectedService: 0, currentRating: 3};
    this.listenerId = this.taskStore.addListener(this.forceUpdate.bind(this));
  }

  componentDidMount()
  {
    //this.interval = setInterval(() => this.setState({ time: this.taskStore.getRunningTime(this.state.selectedService) }), 5000);
    this.setState({selectedServicePos: this.taskStore.getRunningTaskIndex()})
  }

  componentWillMount()
  {

  }

  componentWillUnmount() {
  //clearInterval(this.interval);
  this.taskStore.removeListener(this.listenerId);

}

  changeRunningState()
  {
    let runningTask = this.taskStore.getRunningTaskIndex();
    if (runningTask != this.state.selectedService)
    {
      this.taskStore.addEventToTask(this.taskStore.getRunningTaskIndex(), 3);

    }
    this.taskStore.addEventToTask(this.state.selectedService, this.state.currentRating);
    this.setState({runningState: this.taskStore.isTaskRunning(this.state.selectedService)})

    //this.setState(previousState => {
///  return { runningState: !this.state.selectedService.state };
  //  });
  }

  onPickNewTask(service, pos)
  {
    //let runnningTaskPos = this.taskStore.getRunningTaskIndex();
    this.setState({selectedService: pos,runningState: this.taskStore.isTaskRunning(pos)})
    console.log("Running state "+ this.state.runningState);
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

  render() {
    //console.log("Running state "+ this.state.runningState);
    let tasks = this.taskStore.tasks

    let serviceItems = tasks ? tasks.map( (obj, index) => {
            return <Picker.Item key={index} value={index} label={obj.name} />
        }) : <Text>Loading...</Text>;

        let info = this.taskStore.tasks
      ? 'Number of tasks in this Realm: ' + this.taskStore.tasks.length
      : 'Loading...';

        return (
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-start' ,alignItems: 'center', paddingTop: 50}}>


                <Text style={{width: 300, backgroundColor: 'powderblue',  textAlign: 'center' }}>Pick a service</Text>
                <Picker style={{width: 300,  backgroundColor: 'powderblue'}}
                    selectedValue={this.state.selectedService}
                    onValueChange={this.onPickNewTask.bind(this)  }
                    >

                    {serviceItems}
                </Picker>
                <TaskTimer taskStore={this.taskStore} task ={this.state.selectedService}/>
                <Button
                  title= {this.state.runningState ? "Stop" : "Start"}
                  onPress= {this.changeRunningState.bind(this)}
                />
                  <Stars
                  isActive={true}
                  rateMax={5}
                  isHalfStarEnabled={false}
                  onStarPress={(rating) => this.setState({currentRating: rating})}
                  rate={3}
                  size={60}
                />
                <Button
                title="Give me something to do"
                onPress={this.giveRandomTask.bind(this)}
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
