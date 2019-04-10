import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

const pushMessageReply = (fcmToken :any, nickname :any) => ({
	notification: {
		title: 'あなたの投稿に返信がありました',
		body: nickname + 'さんから',
	},
	apns:{
		payload: {
				aps: {
						sound: "default"
				}
		}
	},
	data: {
		push_link: 'p-chat://noticelist', // 任意のデータを送れる
	},
	token: fcmToken,
})

export const createArticleReplyLog = functions.firestore.document('/article_reply_log/{uid}').onCreate(async (snap, context) => {
	const newValue = snap.data();
	if(newValue === undefined) return
	//console.log(newValue)
	//console.log(newValue.history)
	//console.log("------ sort start")
	const hash = objectSort(newValue.history)
	//console.log(hash)
	//console.log(hash[Object.keys(hash)[Object.keys(hash).length - 1]])
	//console.log("------ sort end ")

	const uid = context.params.uid
	const my_userRef = await admin.firestore().collection('login_user').doc(uid).get()
	const my_user = my_userRef.data()
	if(my_user === undefined) return

	try {
		// Push通知送信
		if (my_user.fcmToken && my_user.notification_reply === true){
			const ids = hash[Object.keys(hash)[Object.keys(hash).length - 1]].split(',')
			const reply_user_uid = ids[0]
			const user = await admin.firestore().collection('login_user').doc(reply_user_uid).get()
			const login_user = user.data();
			if(login_user === undefined) return
			const response = await admin.messaging().send(pushMessageReply(my_user.fcmToken, login_user.nickname))
			console.log('Successfully sent message:', response)
		}
	}catch (err) {
		console.error('Error getting documents or sending message', err);
	}
})

export const updateArticleReplyLog = functions.firestore.document('/article_reply_log/{uid}').onUpdate(async (change, context) => {
			const newValue = change.after.data();
			//console.log(newValue)
			//console.log(newValue.history)
			//console.log("------ sort start")
			if(newValue === undefined) return
			const hash = objectSort(newValue.history)
			//console.log(hash)
			//console.log(hash[Object.keys(hash)[Object.keys(hash).length - 1]])
			//console.log("------ sort end ")

			const uid = context.params.uid
			const my_userRef = await admin.firestore().collection('login_user').doc(uid).get()
			const my_user = my_userRef.data()
			if (my_user === undefined ) return

			try {
				// Push通知送信
				if (my_user.fcmToken && my_user.notification_reply === true){
					const ids = hash[Object.keys(hash)[Object.keys(hash).length - 1]].split(',')
					const reply_user_uid = ids[0]
					const user = await admin.firestore().collection('login_user').doc(reply_user_uid).get()
					const login_user = user.data();
					if( login_user === undefined) return
					const response = await admin.messaging().send(pushMessageReply(my_user.fcmToken, login_user.nickname))
					console.log('Successfully sent message:', response)
				}
			}catch (err) {
				console.error('Error getting documents or sending message', err);
			}
})

function objectSort(object: any) {
    //戻り値用新オブジェクト生成
    var sorted:any = {};
    //キーだけ格納し，ソートするための配列生成
    var array:any = [];
    //for in文を使用してオブジェクトのキーだけ配列に格納
    //for (key in object) {
		Object.keys(object).forEach(  (key) => {
        //指定された名前のプロパティがオブジェクトにあるかどうかチェック
        if (object.hasOwnProperty(key)) {
            //if条件がtrueならば，配列の最後にキーを追加する
            array.push(parseInt(key));
        }
    })
    //配列のソート
    //array.sort();
    //配列の逆ソート
    array.reverse();
		//console.log(array)
    //キーが入った配列の長さ分だけfor文を実行
    for (var i = 0; i < array.length; i++) {
        /*戻り値用のオブジェクトに
        新オブジェクト[配列内のキー] ＝ 引数のオブジェクト[配列内のキー]を入れる．
        配列はソート済みなので，ソートされたオブジェクトが出来上がる*/
        sorted[array[i]] = object[String(array[i])];
    }
    //戻り値にソート済みのオブジェクトを指定
    return sorted;
}
