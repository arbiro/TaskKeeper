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
 listeners = []

  constructor(realmTasks)
  {
      this.realmTasks = realmTasks;
      //this.fetchTasks();
      this.realmTasks.linkToRealmNotify(this.notify.bind(this));
      this.fetchTasks();
  }

  addListener(listener)
  {
    return this.listeners.push(listener)-1;
  }

  removeListener(id)
  {
    if (id > -1) {
      this.listeners.splice(id, 1);
    }
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

  deleteTask(task)
  {
    this.realmTasks.deleteTask(task);
  }
  doUpdate(func)
  {
    this.realmTasks.doUpdate(func);
  }

  addEventToTask(task, rate)
  {
    let state = startEventType;
    if (task)
    {
      if (task.events.length > 0 )
      {
        if (task.events.slice(-1)[0].type == startEventType)
          state = stopEventType;
      }
      event = {type: state, time: Date.now(), rating: rate}

      this.realmTasks.addEventToTask(task, event)
    }
  }


  isTaskRunning(task)
  {
    if (task && task.events.length>0)
    {
      let lastEvent = task.events.slice(-1)[0];
      let retValue = lastEvent.type == startEventType;
      return retValue;
    }
    else
      return false
  }

  getRunningTaskIndex()
  {
    for(let i=0;i<this.tasks.length;i++)
    {
      if (this.isTaskRunning(this.tasks[i]))
      {
        return i;
      }
    }
    return -1;
  }

  getTaskLastRunningTime(task)
  {
    if (task && task.events.length>1)
    {
      let lastEvents = task.events.slice(-2);
      if (lastEvents[1].type == startEventType)
      {
        return moment.duration(moment().diff(moment(lastEvents[1].time))).asSeconds();
      }
      return moment.duration(moment(lastEvents[1].time).diff(moment(lastEvents[0].time))).asSeconds();
    }
    else if(task && task.events.length>0)
    {
      let lastEvent = task.events.slice(-1);
      return moment.duration(moment().diff(moment(lastEvent[0].time))).asSeconds();
    }

    return 0;
  }

  getTaskLastRunningTimeAsString(task)
  {
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

  getTask(taskKey)
  {
    return this.tasks[taskKey];
  }

  getTaskIndex(task)
  {
    return this.tasks.indexOf(task);
  }

  getTaskRunningTimeInBetween(task, fromMoment = moment().startOf('day'), toMoment = moment())
  {
    var totalDuration = moment.duration(0);
    if (task)
    {
      let eventsFiltered = task.events.filter((event) =>
      {  return moment(event.time).isSameOrAfter(fromMoment, "second") && moment(event.time).isSameOrBefore(toMoment, "second"); })
      if (eventsFiltered.length > 0)
      {
        var event;
        var first = true;
        var prevMoment = fromMoment;
        var lastEventType = startEventType;
        for (event of eventsFiltered)
        {
          currentMoment = moment(event.time);
          lastEventType = event.type;
          if (event.type == stopEventType)
          {
              totalDuration = totalDuration.add(moment.duration(currentMoment.diff(prevMoment)));
          }
          if (event.type == startEventType)
          {
              prevMoment = moment(event.time);
          }
        }

        if (lastEventType == startEventType)
        {
          totalDuration = totalDuration.add(moment.duration(toMoment.diff(prevMoment)));
        }
      }
    }
    return totalDuration.asSeconds();
  }

  getDayliesCompletion(fromMoment = moment().startOf('day'), toMoment = moment())
  {
    sum = 0;
    count = 0;
    let dailyItems = this.tasks ? this.tasks.filter( (obj) => {
            return obj.daily;
        }) : {};
    for (task of dailyItems)
    {
      sum = sum + Math.min(Math.floor(((this.getTaskRunningTimeInBetween(task, fromMoment, toMoment)/60)/task.minDailyTime )*100),100);
      count++;
    }

    return sum/count;
  }


}
