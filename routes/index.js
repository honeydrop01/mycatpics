var express = require('express');
var router = express.Router();
var database = require('./database');

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

/* GET home page. */
router.get('/', async function (req, res, next) {

  text = 'SELECT * FROM images';
  var rows = [];
  try {
    var {rows} = await database.query(text);
  }
  catch (error) {
    console.log(error);
  }

  res.render('index', { menuId: 'home', images: rows, pageName: 'home' });
});

router.get('/wallpaper/:name', function (req, res, next) {
  file = req.params.name;
  catName = req.query.cat;
  res.render('wallpaper', { name: catName, file: file, pageName: 'wallpaper' });
});

router.get('/signup', function (req, res, next) {
  res.render('signup', { pageName: 'signup' });
});

router.post('/signup', async function(req, res, next) {

  query = `INSERT INTO users (name, email, password)
           VALUES ('${req.body.name}', '${req.body.email}', '${req.body.password}')`;

  try {
    await database.query(query);
  } catch(error) {
    console.log(error);
  }
    
  res.redirect('/login');
});

router.get('/login', function (req, res, next) {
  res.render('login', { pageName: 'login' });
});

router.post("/login",async function(req,res,next) {
  text= 'SELECT * FROM users';
  rows =[];
  try{
    var {rows} = await database.query(text);
  }catch(error) {
    console.log(error);
  }
  const email = req.body.email;
  const password = req.body.password;
  const check = req.body.check;

  // read our list of user from the file
  //var content = fs.readFileSync('users.json', 'utf8');
  // convert it into a javascript list
  list_of_users = rows;

  // compare the email and password of the authenticator with the users
  // 🤔 🤔🤔🤔🤔🤔🤔🤔🤔🤔🤔🤔🤔🤔
  console.log("info : ", email, password);
  let redirect = "/signup";
  for(i = 0 ;i < list_of_users.length; i++){
    console.log("comp : ", list_of_users[i].email, list_of_users[i].password);
    if(list_of_users[i].email==email){
      if(list_of_users[i].password==password){
        console.log('Information matches');
        req.session.user = list_of_users[i];
        redirect = "/";
        console.log('logged in ', req.session.user_id);
        break;
      }
    }
  }
  res.redirect(redirect);
});

// TODO create logout route
router.get("/logout",function(req,res,next){
  req.session.destroy(function(){
    console.log("user logged out.")
 });
  res.redirect('/login')
});

router.get('/wallpaper/:id/like', async function (req, res, next) {
  id = req.params.id;

  text = 'SELECT * FROM images WHERE id = ' + id;

  try{
    var {rows} = await database.query(text);
    var image = rows[0];
  }catch(error) {
    console.log(error);
    res.send(404);
    return;
  }

  let likes = "";
  likes = ++image.likes;

  const query = `UPDATE images SET likes = ${likes} WHERE id = ${id}`;
  try{
    await database.query(query);
  }catch (error) {
    console.log(error);
  }

  res.send("" + likes);
});

router.get('/discover', async function (req, res, next) {

  text = 'SELECT * FROM images';
  var rows = [];
  try {
    var {rows} = await database.query(text);
  }
  catch (error) {
    console.log(error);
  }
  res.render('discover', { pageName: 'discover' ,images:rows})
});

router.get('/discover', function (req, res, next) {
  res.render('discover', { pageName: 'discover' })
});
module.exports = router;
