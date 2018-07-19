import React, { Component } from 'react';
import { AppRegistry, Text, TextInput, Button , View, Picker} from 'react-native';


export default class HomeScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    this.state = {time: "", runningState: false, selectedService: 0};
    this.taskStore.addListener(this.forceUpdate.bind(this))
  }

  componentDidMount()
  {
    this.interval = setInterval(() => this.setState({ time: this.taskStore.getRunningTime(this.state.selectedService) }), 300);
    this.setState({selectedServicePos: this.taskStore.getRunningTaskIndex()})
  }

  componentWillMount()
  {

  }

  componentWillUnmount() {
  clearInterval(this.interval);
}

  changeRunningState()
  {
    this.taskStore.addEventToTask(this.state.selectedService);
    this.setState({runningState: this.taskStore.isTaskRunning(this.state.selectedService)})

    //this.setState(previousState => {
///  return { runningState: !this.state.selectedService.state };
  //  });
  }

  onPickNewTask(service, pos)
  {
    //let runnningTaskPos = this.taskStore.getRunningTaskIndex();
    this.setState({selectedService: pos,runningState: this.taskStore.isTaskRunning(pos), time: this.taskStore.getRunningTime(this.state.selectedService) })
    console.log("Running state "+ this.state.runningState);
  }

  giveRandomTask()
  {
    let newSelected = Math.floor(Math.random() * this.taskStore.tasks.length);
    console.log("New selected "  + newSelected)
    this.setState({selectedService: newSelected});
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
                <Text style={{width: 200, backgroundColor: 'powderblue',  textAlign: 'center' }}>Pick a service</Text>
                <Picker style={{width: 200,  backgroundColor: 'powderblue'}}
                    selectedValue={this.state.selectedService}
                    onValueChange={this.onPickNewTask.bind(this)  }
                    >

                    {serviceItems}
                </Picker>
                <Text>{this.state.time}</Text>
                <Button
                  title= {this.state.runningState ? "Stop" : "Start"}
                  onPress= {this.changeRunningState.bind(this)}
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
