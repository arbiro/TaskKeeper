import React, { Component } from 'react';

import { AppRegistry, Text, TextInput, Button , View, Picker, FlatList, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})


export default class DetailsScreen extends React.Component {
  constructor(props)
  {
    super(props)
    this.taskStore = this.props.screenProps.taskStore;
    //this.state = {time: "", runningState: false, selectedService: "", selectedServicePos: 0};
    //this.taskStore.addListener(this.forceUpdate.bind(this))
  }

  render() {
    let tasks = this.taskStore.tasks

    let serviceItems = tasks ? tasks.map( (obj, index) => {
            return {key: obj.name}
        }) : {};
    return (
     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <FlatList
       data={serviceItems}
        renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}/>


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
