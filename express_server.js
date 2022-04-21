const express = require('express');
const app = express();
const PORT = 8080;

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey']
}));

app.set("view engine", "ejs");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({entended: true}));

const bcrypt = require('bcryptjs');
const { getUserByEmail, randomID, isInUserData } = require('./helpers');

const urlDatabase = {};  // key: shortURL, value: longURL
const users = {};  // stored data according to user id key

// where the userID is equal to the id of the currently logged-in user
// return urls data belong to that user
const urlsForUser = function(id) {
  let dataForUser = {};
  for (const url in urlDatabase) {
    let shortURL = url;
    let longURL = urlDatabase[url].longURL;
    if (urlDatabase[url].userID === id) {
      dataForUser[shortURL] = longURL;
    }
  }
  return dataForUser;
};

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (userID === undefined) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { userID: users[userID] };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (!email || !password) {
    return res.status(400).send('<h1>invalid email or password</h1>');
  }

  const foundUser = getUserByEmail(email, users);
  if (foundUser && email === foundUser.email) {
    return res.status(400).send('<h1>email is already exsit. please try another email</h1>');
  }

  const id = randomID();
  users[id] = {
    id: id,
    email: email,
    password: password
  };
  res.redirect('/login');
});

app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect('/urls');
  }
  const templateVars = { userID: users[userID]};
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("<h1>invalid email or password</h1>");
  }

  const foundUser = getUserByEmail(email, users);
  if (!foundUser) {
    return res.status(403).send("<h1>Your email is not registered. Please register first.</h1>");
  }

  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("<h1>Wrong password</h1>");
  }

  req.session.user_id = foundUser.id;
  res.redirect("/urls");
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (userID === undefined) {
    return res.send("<h1>You should login first!</h1>");
  }
  const dataForUser = urlsForUser(userID);
  const templateVars = { urls: dataForUser, userID: users[userID] };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { userID: users[userID] };
  if (userID === undefined) {
    return res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  let shortURL = randomID();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID
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
  const templateVars = { shortURL, longURL, userID: users[userID] };
    if(!isInUserData(userID, shortURL)) {
    return res.send("<h1>This is not your URL, You can't edit this!</h1>");
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    return res.send("<h1>This is not a valid Short URL</h1>");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/edit/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete(urlDatabase[shortURL]);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  const userID = req.session.user_id;
  if(!isInUserData(userID, shortURL)) {
    return res.send("<h1>This is not your URL, You can't edit this!</h1>");
  }
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.all('*', (req, res) => {
  res.status(404).send('You are on the wrong page');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
