var express = require('express');
var router = express.Router();

//requiring path and fs modules
const path = require('path');
const fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {

  // const directoryPath = path.join(__dirname, '../public/images/cats/thumbnails');
  // images = fs.readdirSync(directoryPath);
  var content = fs.readFileSync('info.json', 'utf8');
  images = JSON.parse(content);
  // for (i = 0; i < content.length; i++) {
  //   const line = content[i].split(';');
  //   image = {
  //     id: line[0],
  //     path: line[1],
  //     description: line[2],
  //     likes: line[3],
  //   };
   // images.push(image);
  //}

  res.render('index', { menuId: 'home', images: images, pageName: 'home' });
});

router.get('/wallpaper/:name', function (req, res, next) {
  file = req.params.name;
  catName = req.query.cat;
  res.render('wallpaper', { name: catName, file: file, pageName: 'wallpaper' });
});

router.get('/signup', function (req, res, next) {
  res.render('signup', { pageName: 'signup' });
});

router.post('/signup', function(req, res, next) {
  // read our list of user from the file
  var content = fs.readFileSync('users.json', 'utf8');
  // convert it into a javascript list
  list_of_users = JSON.parse(content);
  // add the new user to it
  list_of_users.push({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
  // convert it again to a string
  content = JSON.stringify(list_of_users);

  // save it back
  fs.writeFile("users.json", content, function(err){
    if (err) {
      return console.error(err);
    }
  })
    
  res.redirect('/login');
});

router.get('/login', function (req, res, next) {
  res.render('login', { pageName: 'login' });
});

router.post("/login",function(req,res,next) {
  const email = req.body.email;
  const password = req.body.password;
  const check = req.body.check;

  // read our list of user from the file
  var content = fs.readFileSync('users.json', 'utf8');
  // convert it into a javascript list
  list_of_users = JSON.parse(content);

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

"localhost:3000/wallpaper/90000/like"
router.get('/wallpaper/:id/like', function (req, res, next) {
  var content = fs.readFileSync('info', 'utf8').split('\n');
  let images = [];
  for (i = 0; i < content.length; i++) {
    const line = content[i].split(';');
    const image = {
      id: line[0],
      path: line[1],
      description: line[2],
      likes: line[3],
    };
    images.push(image);
  }

  id = req.params.id;

  // images is a list of image
  let img = null;
  for (i = 0; i < images.length; i++) {
    console.log("comparing : ", id);
    let image = images[i];
    if (image.id == id) {
      img = ++image.likes;
    }
  }

  // images
  let data = [];
  for (i = 0; i < images.length; i++) {
    const line = [
      images[i].id,
      images[i].path,
      images[i].description,
      images[i].likes,
    ].join(";");
    data.push(line);
  }

  data = data.join("\n");

  console.log('here');
  fs.writeFile('info', data, function (err) {
    if (err) {
      return console.error(err);
    }
  });
  console.log('here');

  res.send("" + img);
});

router.get('/discover', function (req, res, next) {
  res.render('discover', { pageName: 'discover' })
});
module.exports = router;
