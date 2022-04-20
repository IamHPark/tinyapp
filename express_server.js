const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs");
const bodyParser = require('body-parser');
const { render } = require('express/lib/response');
app.use(bodyParser.urlencoded({entended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// let randomID = Math.random().toString(36).substring(2,8);  //Mentor Help!!!!!!
const users = {};
// Tiny app register page
app.get('/register', (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { userID: users[userID] };
  res.render('urls_register', templateVars);
})

// when user submit login button
app.post('/register', (req, res) => {
  //throw 400 error if email or psw is empty
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('<h1>invalid email or password</h1>')
  }
  // if email already exist
  let foundUser = null;
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      foundUser = user;
    }
  }

  if ( foundUser && email === foundUser.email) {
    return res.status(400).send('<h1>email is already exsit. please try another email</h1>');
  }

  const id = Math.random().toString(36).substring(2,8);
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  console.log(users);
  res.redirect('/login');
});


// add endpoint for login
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];
  const templateVars = { userID: users[userID]};
  res.render('urls_login', templateVars);
})

// when user login submit
app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password

  // email or password empty : 400
  if (!email || !password) {
    return res.status(400).send("<h1>invalid email or password</h1>")
  }

  let foundUser = null;
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      foundUser = user;
    }
  }

  // email is not registered
  if (!foundUser) {
    return res.status(403).send("<h1>Your email is not registered. Please register first.</h1>")
  }
  // password is not correct
  if (password !== foundUser.password) {
    return res.status(403).send("<h1>Wrong password</h1>")
  }

  res.cookie("user_id", foundUser.id).redirect("/urls");
})

// throw 400 error if email is already exist
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
  let shortURL = Math.random().toString(36).substring(2,8);
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
