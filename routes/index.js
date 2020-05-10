var express = require('express');
var router = express.Router();
var database = require('./database');
var formidable = require('formidable');

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

/* GET home page. */
router.get('/', async function (req, res, next) {
  text = 'SELECT id, name, description, likes FROM wallpapers';
  var rows = [];
  try {
    var {rows} = await database.query(text);
  }
  catch (error) {
    console.log(error);
  }

  for (let i = 0; i < rows.length; i++) {
    rows[i].thumbnailUrl = '/wallpapers/'+ rows[i].id +'/thumbnail';
  }

  res.render('index', { menuId: 'home', images: rows, pageName: 'home' });
});

router.get('/wallpapers/:id', async function (req, res, next) {
  id = req.params.id;
  query = "SELECT id, likes, description FROM wallpapers WHERE id = " + id;
  var rows =[];
  try{
    var {rows} = await database.query(query);
    console.log(rows);
    var image = rows;
  }catch(error) {
    console.log(error);
    res.send(404);
    return;
  }
  console.log(id);
  image.imageUrl = '/wallpapers/' + id + '/image';
  
  // catName = req.query.cat;
  res.render('wallpaper', { image: image, pageName: 'wallpaper' });
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

router.get("/logout",function(req,res,next){
  req.session.destroy(function(){
    console.log("user logged out.")
 });
  res.redirect('/login')
});

router.get('/wallpapers/:id/like', async function (req, res, next) {
  id = req.params.id;

  text = 'SELECT id, name, description, likes FROM wallpapers WHERE id = ' + id;

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

  const query = `UPDATE wallpapers SET likes = ${likes} WHERE id = ${id}`;
  try{
    await database.query(query);
  }catch (error) {
    console.log(error);
  }

  res.send("" + likes);

  const add = `INSERT into likes (user_id, wallpaper_id)
    VALUES (${req.session.user.id}, ${id})`;

  try {
    await database.query(add);
  } catch(error) {
    console.log(error);
  }
});

router.get('/discover', async function (req, res, next) {

  text = 'SELECT * FROM wallpapers';
  var rows = [];
  try {
    var {rows} = await database.query(text);
  }
  catch (error) {
    console.log(error);
  }
  res.render('discover', { pageName: 'discover' ,images:rows})
});

router.get('/profile', async function (req, res, next) {
  text = 'SELECT id, name, description, likes FROM wallpapers WHERE user_id = ' + req.session.user.id;
  var rows = [];
  try {
    var {rows} = await database.query(text);
  }
  catch (error) {
    console.log(error);
  }

  for (let i = 0; i < rows.length; i++) {
  rows[i].thumbnailUrl = '/wallpapers/' + rows[i].id +'/thumbnail';
  }

  // TODO get the logged in user
  const user = {
    profilePicture: "",
  };

  // set a default profile picture if the user doesn't have one
  if (!user.profilePicture) {
    user.profilePicture = "images/profilePicture.jpg"
  }

  const qqq = `SELECT DISTINCT likes.wallpaper_id, wallpapers.likes
    FROM likes JOIN wallpapers
    ON wallpapers.id = likes.wallpaper_id
    WHERE likes.user_id = ${req.session.user.id}`;

  var favorite = [];
  try {
    const {rows} = await database.query(qqq);
    favorite = rows
  } catch (error) {
    console.log(error);
  }

  for (let i = 0; i < favorite.length; i++) {
    favorite[i].thumbnailUrl = '/wallpapers/' + favorite[i].wallpaper_id +'/thumbnail';
    console.log( favorite[i].thumbnailUrl);
  }

  res.render('profile', { pageName: 'profile', user, images: rows, favorite: favorite})
});

router.post('/wallpapers', function (req, res, next) {

  var form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {

    const name = files.img.name;
    var oldpath = files.img.path;

    const file = fs.readFileSync(oldpath);

    const sharp = require('sharp');
    const thumbnail = await sharp(oldpath).resize(300).toBuffer();

    const query = `insert into wallpapers(name, img, thumbnail, description, likes, user_id, created_at)
      VALUES ($1, $2, $3, $4, 0, $5, current_timestamp)`;

    try {
      await database.query(query, [
        name,
        file,
        thumbnail,
        fields.description,
        req.session.user.id,
      ]);
    } catch(error) {
      console.log(error);
    }

    res.redirect('/')
  });
});

router.get('/wallpapers/:id/:type', async function (req, res, next) {
  const type = req.params.type;
  if (type == 'thumbnail') {
    var column_name = 'thumbnail';
  }
  else if (type == 'image') {
    var column_name = 'img';
  } else {
    return res.send(404);
  }

  const text = "SELECT "+column_name+" FROM wallpapers WHERE id = "+ req.params.id;

  try {
    var {rows} = await database.query(text);
    var image = rows[0][column_name];
  } catch (error) {
    return res.send(status);
  }

  res.contentType('image/jpeg');
  res.send(image);

 });
module.exports = router;
