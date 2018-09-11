import {PushNotificationIOS} from 'react-native';


import NotificationsIOS, { NotificationAction, NotificationCategory } from 'react-native-notifications';



// Create an "upvote" action that will display a button when a notification is swiped
getNotificationContinueButton = function(callback){
return new NotificationAction({
  activationMode: 'background',
  title: 'Continue',
  identifier: 'CONTINUE_ACTION'
}, (res, done) => {
  callback();
  console.info('button pressed with result: ', res);
  done(); //important!
});
}

getNotificationPauseButton = function(callback)
{
  return new NotificationAction({
    activationMode: 'background',
    title: 'Pause',
    identifier: 'PAUSE_ACTION'
  }, (res, done) => {
    callback();
    console.info('button pressed with result: ', res);
    done(); //important!
  });
}


// Create a "comment" button that will display a text input when the button is pressed
/*et commentTextButton = new NotificationActions.Action({
  activationMode: 'background',
  title: 'Reply',
  behavior: 'textInput',
  identifier: 'REPLY_ACTION'
}, (res, done) => {
  console.info('reply typed via notification from source: ', res.source, ' with text: ', res.text);
  done(); //important!
});
}*/

setNotificationCategoryForContinuePause = function(callback1, callback2){
let category = new NotificationCategory({
  identifier: 'POMODORO',
  actions: [getNotificationContinueButton(callback1), getNotificationPauseButton(callback2)],
  context: 'default'
});
NotificationsIOS.requestPermissions([category]);
}


module.exports = {
  Notifications: NotificationsIOS,
  getNotificationPauseButton: getNotificationPauseButton,
  getNotificationContinueButton: getNotificationContinueButton,
  setNotificationCategoryForContinuePause: setNotificationCategoryForContinuePause
}
