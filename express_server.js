const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = function() {
  let randomString = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({entended: true}));

const users = {};
// Tiny app register page
app.get('/register', (req, res) => {
  const templateVars = { 'username': req.cookies["username"]}
  res.render('urls_register');
})

// when user submit login button
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  res
    .cookie('user_id', userID)
    .redirect('/urls');
});

// client comes in /urls, show the list of urls(urls_index)
app.get('/urls', (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, userID: users[userID] };
  res.render('urls_index', templateVars);
});

// broswer request "Create New URL" , show create form (urls_new)
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { userID: users[userID] };
  res.render("urls_new", templateVars);
});

// User fills form and press submit
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  //body have a longURL key which is name value in form, update urlDatabase with new URL pair
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// redirected from post above, show ulrs_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], userID: users[userID] };
  res.render("urls_show", templateVars);
});

// User press submit then it links to /u/:shortURL, then redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

// press Edit submit, redirect to urls_show
app.post("/urls/edit/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  res.redirect(`/urls/${shortURL}`);
})

// press Delete submit, action to below path, then delete data pair and redirect to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete(urlDatabase[req.params.shortURL])
  res.redirect("/urls")
});

/*
// add endpoint for POST to /login
app.post("/login", (req, res) => {
  const username = req.body.username;
  res
    .cookie('username',req.body.username)
    .redirect("/urls");
    // .render("_header" ,username);
});
*/

// add endpoint for POST to /logout
app.post("/logout", (req, res) => {
  res
    .clearCookie("user_id")
    .redirect("/urls");
});

// press Edit submit, action to below path, then change longURL in a data pair, redirect to /urls
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
