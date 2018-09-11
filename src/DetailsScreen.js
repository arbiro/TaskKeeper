import React, { Component } from 'react';
import { createStackNavigator} from 'react-navigation';
import { AppRegistry, Text, TextInput, Button , View, Picker, FlatList, StyleSheet} from 'react-native';

import TaskDetailsScreen from './TaskDetailsScreen'


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




class DetailsScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    //this.state = {time: "", running: false, selectedService: "", selectedServicePos: 0};

    //this.listenerId = this.taskStore.addListener(this.forceUpdate.bind(this));
  }

  forceUpdate()
  {
    this.setState({});
  }
  componentWillFocus()
  {

  }

  componentDidMount()
  {
    this.listenerId = this.taskStore.addListener(this.forceUpdate.bind(this));
  }

  componentWillUnmount()
  {
      this.taskStore.removeListener(this.listenerId);
  }

  render() {
    let tasks = this.taskStore.tasks
    let x = this.state;
    //TO DO - DON"T USE INDEX MAYBE
    let serviceItems = tasks ? tasks.map( (obj, index) => {
            return {key: obj.name, index: index, obj: obj, running:this.taskStore.isTaskRunning(obj)}
        }) : {};
    return (
     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <FlatList
       data={serviceItems}
        renderItem={({item}) => ( <Text
        style={item.running ? styles.runningItem : styles.item }
        onPress={() => this.props.navigation.navigate('TaskDetailsScreen', {addTask: false, task:item.obj})}>
        {item.key}
        </Text>)}/>

        <Button
          title="Add task"
          onPress={() => this.props.navigation.navigate('TaskDetailsScreen', {addTask: true})}
        />
      </View>
    );
  }
}

export default DetailsNavigator = createStackNavigator(
  {
   Details: DetailsScreen,
   TaskDetailsScreen: TaskDetailsScreen
 },
 {
   initialRouteName: 'Details',
 }
);
