import * as functions from 'firebase-functions'
//import * as admin from 'firebase-admin'
//admin.initializeApp();

/*
const pushMessageChat = (fcmToken :any, nickname :any, badge :any) => ({
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
export const newMessage = functions.firestore.document('/chat_room/{chatRoomKey}/messages/{messageId}').onCreate(async (snap, context) => {
			console.log('new Message ----');

			/*
			const newValue = snap.data();

			// access a particular field as you would any JS property
			if ( newValue === undefined ) return
			const sender = newValue.sender
			const chatRoomKey = context.params.chatRoomKey
			const chatRoom = admin.firestore().collection('/chat_room').doc(chatRoomKey)
			const chatRoomRef = await chatRoom.get()
			const chatRoomData = chatRoomRef.data()

			if ( chatRoomData === undefined) return

			const members 				= chatRoomData.members				// 参加者 uid: Boolean
			delete members[sender]	// 送信者を削除しておく

			const senderdoc = await admin.firestore().collection('login_user').doc(sender).get();
			const senderUser = senderdoc.data();

			if(senderUser === undefined) return

			const senderNickName = senderUser.nickname

			Object.keys(members).forEach( async (key) => {  // chatRoom参加者
				if( members[key] === false ) return	// Chat参加者のみに送信
				try {
					// 未読数を取得
					const { size: unreadCount } = await  admin.firestore().collection('/chat_room/'+chatRoomKey+'/messages/').where('unreads.' + key, "==", true).get()
					//const updateKey = 'unreadCounts.' + key
					const data: any = {}
					data['unreadCounts.' + key] = unreadCount
					//console.log(data)
					await chatRoom.update(data)

					// Push通知送信
					const user = await admin.firestore().collection('login_user').doc(key).get()
					const login_user = user.data();
					if(login_user === undefined) return

					//console.log('GCLOUD_PROJECT');
					//console.log(process.env.GCLOUD_PROJECT);

					if (login_user.fcmToken && login_user.notification_message === true && key !== sender){
						const response = await admin.messaging().send(pushMessageChat(login_user.fcmToken, senderNickName, unreadCount))
						console.log('Successfully sent message:', response)
					}
				}catch (err) {
					console.error('Error getting documents or sending message', err);
				}
			})
			*/
})
