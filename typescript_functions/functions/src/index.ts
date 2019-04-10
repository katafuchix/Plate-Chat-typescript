import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as stream from 'stream'

import { newMessage } from './handlers/messageNotification'
import { updateArticleReplyLog, createArticleReplyLog } from './handlers/replyNotification'
import { updateFootprint, createFootprint } from './handlers/footprintNotification'

admin.initializeApp()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export {
  newMessage
}
export {
  updateArticleReplyLog, createArticleReplyLog
}
export {
  updateFootprint, createFootprint
}

export const helloWorldts = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!\n\n")
});

export const hello = functions.https.onRequest((request, response) => {
  if (request.params[0] !== undefined) {
    const param = request.params[0].slice(1)
    response.status(200).send("Hello " + param)
  } else {
    response.status(200).send("Hello World")
  }
})


const getExpireDate = function() {
  const dd = new Date();
  const YYYY = dd.getFullYear() + 5;
  const MM = dd.getMonth()+1;
  const DD = dd.getDate();
  return MM + "-" + DD + "-" + YYYY;
}

export const addMessage = functions.https.onCall(async (data, context) => {
  const text = data.text;
  const companyKey = data.companyKey;
  const param = data.param;

  if( context === undefined ) return
  if( context.auth === undefined ) return

  const uid = context.auth.uid;
  console.log("addMessage");
  //console.log(text);
  console.log(uid);
  console.log(companyKey);
  console.log('param');
  console.log(param);

  const bufferStream = new stream.PassThrough();
  bufferStream.end(new Buffer(text, 'base64'));

  const imageBuffer = new Buffer(text, 'base64');

  const new_file   = admin.storage().bucket().file('imageName_file.jpg');
  await new_file.save(imageBuffer, {
        metadata: { contentType: 'image/jpeg' },
    });
    console.log('finish');

//  const downloadedURL = await admin.storage().bucket().file('imageName_file.jpg').getSignedUrl();
//  console.log(downloadedURL);


  const myFile = admin.storage().bucket().file('imageName_file.jpg');
/*
  const urls = await myFile.getSignedUrl({action: 'read', expires: '03-09-2491'});
  console.log(urls);
*/
  var signedUrl = ""
  const expires = getExpireDate();
  console.log(expires);
  await myFile.getSignedUrl({action: 'read', expires: expires}).then(urls => {
    signedUrl = urls[0]
  })

    return  {
        "downloadUrl" : signedUrl,
        "expires" : expires
    }
});



export const updateProfileImage = functions.https.onCall(async (data, context) => {
  const imageUrl = data.imageUrl;

  if(context === undefined) return
  if(context.auth === undefined) return

  const uid = context.auth.uid;
  console.log("update profile url");
  //console.log(text);
  console.log(uid);
  console.log(imageUrl);
  console.log(data);

  const my_userRef = await admin.firestore().collection('login_user').doc(uid);
  console.log(my_userRef.get());
  await my_userRef.set(data, { merge: true });

  console.log('image update finish');

});

export const articletest = functions.https.onRequest((request, response) => {
  const json2csv = require("json2csv").parse
  const db = admin.firestore()
  const ordersRef = db.collection('login_user')
  return ordersRef.get()
    .then((querySnapshot) => {
      const orders:any = []

      querySnapshot.forEach(doc => {
        const order = doc.data()
        orders.push(order)
      });
      const csv = json2csv(orders)
      response.setHeader(
        "Content-disposition",
        "attachment; filename=report.csv"
      )
      response.set("Content-Type", "text/csv")
      response.status(200).send(csv)
      return ""
    }).catch((err) => {
      response.status(200).send("エラー発生： " + err)
      return Promise.resolve()
    })
})


export const unreadtest = functions.https.onRequest((request, response) => {
  const json2csv = require("json2csv").parse
  const db = admin.firestore()
  const key = 'xth30Bc5rnVebqIVtbG3DPJjFGb2' //'unreadCounts["5rRUi1eM3MguEJ8nvlgLusVbr4r1"]'

  const ordersRef = db.collection('chat_room/y9GoHosRLRFLv638kUrr/messages')//.where('', "==", 1)
  .where('unreads.' + key, "==", true)
  return ordersRef.get()
    .then((querySnapshot) => {
      const orders:any = []
console.log("querySnapshot.count")
console.log(querySnapshot.size)
      querySnapshot.forEach(doc => {
        const order = doc.data()
        console.log(order.unreadCounts)
        console.log(order.messages)
        orders.push(order)
      });
      const csv = json2csv(orders)
      response.setHeader(
        "Content-disposition",
        "attachment; filename=report.csv"
      )
      response.set("Content-Type", "text/csv")
      response.status(200).send(csv)
      return ""
    }).catch((err) => {
      response.status(200).send("エラー発生： " + err)
      return Promise.resolve()
    })
})

/*
const pushMessage = (fcmToken :any, bookName :any) => ({
  notification: {
    title: '保存が完了しました',
    body: '保存が完了しました🙌',
  },
  apns:{
    payload: {
        aps: {
            sound: "default"
        }
    }
  },
  data: {
    hoge: 'fuga', // 任意のデータを送れる
  },
  token: fcmToken,
})
*/
/*
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e30; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
*/
/*
    const pushMessageChat = (fcmToken, nickname, badge) => ({
      notification: {
        title: '新しいメッセージがあります',
        body: nickname + 'さんから',
      },
      apns:{
        payload: {
            aps: {
                sound: "default",
                badge: badge
            }
        }
      },
      data: {
        push_link: 'p-chat://chatroomlist', // 任意のデータを送れる
      },
      token: fcmToken,
    })
*/
/*
    export const updateChatRoom = functions.firestore.document('/chat_room/{chatRoomKey}').onUpdate((change, context) => {
      const newValue = change.after.data();
      const chatRoomKey = context.params.chatRoomKey
      Object.keys(newValue.members).forEach( key => {
          const promiseCount = admin.firestore().collection('/chat_room/'+chatRoomKey+'/messages/').where('unreads.' + key, "==", true).get()
          promiseCount.then((querySnapshot) => {
            const unreadCount = querySnapshot.size

            var chatRoomRef = admin.firestore().collection('/chat_room').doc(chatRoomKey)
            const updateKey = 'unreadCounts.' + key
            return chatRoomRef.update({
                updateKey : unreadCount
            })
            .then(function() {
                console.log("Document successfully updated!");
            })
            .catch(function(error) {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });
          })
          .catch(error => {
            console.log(error)
            return
          })
      })
    })
*/
/*
    export const newMessage = functions.firestore.document('/chat_room/{chatRoomKey}/messages/{messageId}').onCreate((snap, context) => {
          const newValue = snap.data();

          // access a particular field as you would any JS property
          const sender = newValue.sender;
          //const text = newValue.text;

          // perform desired operations ...
          //console.log('sender', sender);
          //console.log('text', text);
          const chatRoomKey = context.params.chatRoomKey

          return admin.firestore().collection('/chat_room').doc(chatRoomKey).get().then(doc=> {
            if (doc) {
              const chat_room = doc.data()
        			const members 				= chat_room.members				// 参加者 uid: Boolean
        			//const unreadCounts 		= talk_room.unreadCounts	// 参加者あたりの未読数 uid: Int

              var promise0 = admin.firestore().collection('login_user').doc(sender).get();
              promise0.then(senderdoc=> {
               if(senderdoc){
                  const senderUser = senderdoc.data();
                  const senderNickName = senderUser.nickname

                  //Object.keys(chat_room.members).forEach(function (key) {  // トーク発言者以外にPush通知を送信  ChatRoomのunreadCounts更新まで時間がかかることもあるので集計して送信
                  Object.keys(chat_room.members).forEach( key => {
                    //if( key !== sender && members[key] === true ){
                    //if( key === sender ){ return }
            					const promiseCount = admin.firestore().collection('/chat_room/'+chatRoomKey+'/messages/').where('unreads.' + key, "==", true).get()
            					promiseCount.then((querySnapshot) => {
            						const unreadCount = querySnapshot.size
                        const chatRoomRef = admin.firestore().collection('/chat_room').doc(chatRoomKey)
                        const updateKey = 'unreadCounts.' + key
                        //const data = { updateKey : unreadCount }
                        var data = {}
                        data['unreadCounts.' + key] = unreadCount
                        console.log(data)
                        return chatRoomRef.update(data)
                        .then(function() {
                            //console.log("Document successfully updated!");
                            const promiseUser = admin.firestore().collection('login_user').doc(key).get();
                						promiseUser.then(udoc=> {
                              if(udoc){
                                console.log( udoc.data() );
                                const login_user = udoc.data();
                                if (login_user.fcmToken && login_user.notification_on === true && key !== sender){
                                  admin.messaging().send(pushMessageChat(login_user.fcmToken, senderNickName, unreadCount))
                                  .then((response) => {
                                    console.log('Successfully sent message:', response)
                                    return
                                  })
                                  .catch((e) => {
                                    console.log('Error sending message:', e)
                                    return
                                  })
                                }
                              }
                						})
                						.catch(error => {
                							// handle any errors here
                							console.log(error)
                							return
                						});

                        })
                        .catch(function(error) {
                            // The document probably doesn't exist.
                            console.error("Error updating document: ", error);
                        });
            					})
                      .catch(error => {
            						console.log(error)
                        return
                      })
                    //}
                  })
                }
              })
              .catch(error => {
                // handle any errors here
                console.log(error)
                return
              });
              return
            }else{
              return
            }
          })
      });
*/
