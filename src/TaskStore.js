import RealmTasks from './RealmTasks'
const moment = require('moment')

const startEventType = 'START';
const stopEventType = 'STOP';


getTimeDiffAsString = function(start, end)
{
  const startDate = moment(start);
  const timeEnd = moment(end);
  const diff = timeEnd.diff(startDate);
  const diffDuration = moment.duration(diff);
  return diffDuration.hours() + ":" + diffDuration.minutes() + ":" + diffDuration.seconds();
}

export default class TaskStore
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
      this.tasks = this.realmTasks.fetchTasks()
  }

  addTask(task)
  {
    this.realmTasks.addTask(task)
  }

  addEventToTask(taskKey)
  {
    let task = this.tasks[taskKey]
    let state = startEventType;
    if (task)
    {
      if (task.events.length > 0 )
      {
        if (task.events.slice(-1)[0].type == startEventType)
          state = stopEventType;
      }
      event = {type: state, time: Date.now()}

      this.realmTasks.addEventToTask(task, event)
    }
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
