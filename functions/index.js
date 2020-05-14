const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

admin.initializeApp();

app.get('/', (req, res) => {
  let users = []
  const query = admin.database().ref("users").orderByKey();
  query.once("value").then(snapshot => {
    snapshot.forEach(childSnapshot => {
      let user = childSnapshot.val();
      user.key = childSnapshot.key;
      users.push(user);
    });
    return res.send(users);
  })
    .catch(error => {
      res.status(404).send('No data available.');
    });
});

exports.users = functions.https.onRequest(app);


// 1件だけ取得
app.get('/:user_id', (req, res) => {
    const ref = admin.database().ref('users');
    ref.orderByChild('user_id').equalTo(req.params.user_id)
      .once('value').then(data => {
        return res.send(data);
      })
      .catch(error => {
        res.status(404).send('No data available.');
      });
  });

// 作成
app.post('/create', (req, res) => {
    const ref = admin.database().ref('users');
    ref.push({                                  // ユニークキーも自動生成する
      user_id: req.body.user_id,
      user_name: req.body.user_name,
      age: Number(req.body.age)                 // NaNは考慮しないことにする
    }).then(data => {
      return res.status(201).send(data);
    })
    .catch(error => {
      res.status(400).send(error);      
    });
  });  

