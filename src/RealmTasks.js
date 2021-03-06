import Realm from 'realm'



const EventSchema =
{
  name: 'Event',
  properties: { type: 'string', time: 'int' , rating: 'int'}
}

const TaskSchema = {
  name: 'Task',
  properties: {
    name:  'string',
    events: 'Event[]',
    parentTask: 'Task?',
    daily: 'bool',
    minDailyTime: 'int'
  }
}

const ListSchema = {
  name: 'List',
  properties: {
    name: 'string',
    tasks: 'Task[]'
  }
}





export default class RealmTasks
{
  constructor()
  {
    this.realm = new Realm({schema: [EventSchema, TaskSchema], schemaVersion: 3});
    this.realm.write(() => {});
  }

  linkToRealmNotify(notifyCallBack)
  {
    this.realm.addListener('change', notifyCallBack);
  }

  doUpdate(func)
  {
    this.realm.write( () => { func()})
  }

  fetchTasks()
  {
    return this.realm.objects('Task');
  }

  addTask(task)
  {
    this.realm.write(() => {this.realm.create('Task', task)});
  }

  deleteTask(task)
  {
    this.realm.write(() => {this.realm.delete(task)});
  }

  addEventToTask(task, event)
  {
    this.realm.write(() => {
           task.events.push(event)
         });
  }

}
