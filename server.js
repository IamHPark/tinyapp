const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { getUserByEmail, randomID, isInUserData, urlsForUser } = require('./helpers');
const app = express();
const PORT = 8080;

app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey']
}));
app.use(bodyParser.urlencoded({entended: true}));
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'))

const urlDatabase = {};  // key: shortURL, value: longURL
const users = {};  // stored data according to user id key & id, email, pw value

app.get("/", (req, res) => {
  const userID = req.session.user_id;

  // if (userID === undefined) {
  //   return res.redirect('/login');
  // }

  const templateVars = { user: users[userID]}
  res.render('main', templateVars);
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[userID], success: true };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (!email || !req.body.password) {
    return res.render('register', { user: null, success: false, isExist : false })
  }

  const foundUser = getUserByEmail(email, users);
  if (foundUser && email === foundUser.email) {
    return res.render('register', { user: null, success: false, isExist : true })
  }

  const id = randomID();
  users[id] = {
    id: id,
    email: email,
    password: password
  };
  req.session.user_id = users[id].id;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[userID], isFilled: true, isRegistered: true, isCorrect: true};
  res.render('login', templateVars);
});

app.post("/login", (req, res) => {
  const userID = req.session.user_id;
  let templateVars = { user: users[userID], isFilled: true, isRegistered: true, isCorrect: true}
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    templateVars = {...templateVars, isFilled: false}
    return res.render('login', templateVars);
  }

  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    templateVars = {...templateVars, isRegistered: false}
    return res.render('login', templateVars );
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    templateVars = {...templateVars, isCorrect: false}

    return res.render('login', templateVars );
  }

  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (userID === undefined) {
    return res.send("<h1>You should login first!</h1>");
  }
  const dataForUser = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: dataForUser, user: users[userID], dataAll: urlDatabase };
  res.render('index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { user: users[userID] };
  if (userID === undefined) {
    return res.redirect('/login');
  }

  res.render("new", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  let shortURL = randomID();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID,
    totalVisit: 0
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    return res.send("<h1>This is not a valid Short URL</h1>");
  }

  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[userID] };
    if(!isInUserData(userID, shortURL, urlDatabase)) {
    return res.send("<h1>This is not your URL, You can't edit this!</h1>");
  }
  res.render("show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].totalVisit += 1;

  if (urlDatabase[shortURL] === undefined) {
    return res.send("<h1>This is not a valid Short URL</h1>");
  }
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  delete(urlDatabase[shortURL]);
  res.redirect("/urls");
});

app.put("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  const userID = req.session.user_id;
  if(!isInUserData(userID, shortURL, urlDatabase)) {
    return res.send("<h1>This is not your URL, You can't edit this!</h1>");
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.all('*', (req, res) => {
  res.status(404).send('You are on the wrong page');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
