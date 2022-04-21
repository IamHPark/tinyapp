const express = require('express');
const app = express();
const PORT = 8080;

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({entended: true}));
const { render } = require('express/lib/response');

const bcrypt = require('bcryptjs');

const urlDatabase = {};
let randomID = () => Math.random().toString(36).substring(2,8);  //Mentor Help!!!!!!
const users = {};

// reate a function named urlsForUser(id) which returns the URLs
// where the userID is equal to the id of the currently logged-in user.
const urlsForUser = function(id) {
  let dataForUser = {}
  for ( const url in urlDatabase) {
    let shortURL = url;
    let longURL = urlDatabase[url].longURL
    if (urlDatabase[url].userID === id) {
      dataForUser[shortURL] = longURL
    }
  }
  return dataForUser;
};

const isRegistered = (email) => {
  let foundUser = null;
  for (const userID in users) {
    const user = users[userID];
    if (email === user.email) {
      foundUser = user;
    }
  }
  // console.log('foundUser', foundUser);
  return foundUser;
}


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
  const password = bcrypt.hashSync(req.body.password, 10);
  if (!email || !password) {
    return res.status(400).send('<h1>invalid email or password</h1>')
  }
  // if email already exist
  const foundUser = isRegistered(email);

  if ( foundUser && email === foundUser.email) {
    return res.status(400).send('<h1>email is already exsit. please try another email</h1>');
  }

  const id = randomID();
  users[id] = {
    id: id,
    email: email,
    password: password
  }
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
  const password = req.body.password;

  // email or password empty : 400
  if (!email || !password) {
    return res.status(400).send("<h1>invalid email or password</h1>")
  }

  // console.log(isRegistered(email));
  const foundUser = isRegistered(email);
  // email is not registered
  if (!foundUser) {
    return res.status(403).send("<h1>Your email is not registered. Please register first.</h1>")
  }
  // password is not correct
  console.log(bcrypt.compareSync(password, foundUser.password));
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("<h1>Wrong password</h1>")
  }

  // if login success, redirect to /urls
  res.cookie("user_id", foundUser.id).redirect("/urls");
})

// client comes in /urls, show the list of urls(urls_index)
app.get('/urls', (req, res) => {
  const userID = req.cookies["user_id"];
  //if not logined, redirect to /urls
  if (userID === undefined) {
    return res.send("<h1>You should login first!</h1>");
  };
  const dataForUser = urlsForUser(userID);
  // console.log(dataForUser)
  const templateVars = { urls: dataForUser, userID: users[userID] };
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
  const userID = req.cookies["user_id"];
  let shortURL = randomID()
  //body have a longURL key which is name value in form, update urlDatabase with new URL pair
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID
  }
  // console.log(urlDatabase);
  //if not logged in, send message
  if (userID === undefined) {
    return res.send("<h1>You should login first!</h1>");
  };
  res.redirect(`/urls/${shortURL}`);
});

// redirected from post above, show ulrs_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies["user_id"];
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, userID: users[userID] };
  res.render("urls_show", templateVars);
});

// User press submit then it links to /u/:shortURL, then redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  // console.log('short', shortURL);
  const longURL = urlDatabase[shortURL].longURL;
  // console.log("long", longURL);
  // console.log(urlDatabase)
  res.redirect(longURL);
});

// edit in /urls submit, redirect to urls_show
app.post("/edit/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
})

// press Delete submit, action to below path, then delete data pair and redirect to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL

    // if current userID doens't have the shortURL, return message can't delete
    const userID = req.cookies['user_id'];
    const urlsForUserData = urlsForUser(userID);
    const shortUrlKeys = Object.keys(urlsForUserData);
    if (!shortUrlKeys.includes(shortURL)) {
      return res.send("<h1>This is not your URL, You can't edit this!</h1>")
    }

  delete(urlDatabase[shortURL])
  res.redirect("/urls")
});


// press Edit submit, action to below path, then change longURL in a data pair, redirect to /urls
app.post("/urls/:id", (req, res) => {
  // console.log('urls/id', req.params);
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;

  // if current userID doens't have the shortURL, return a message
  const userID = req.cookies['user_id'];
  const urlsForUserData = urlsForUser(userID);
  const shortUrlKeys = Object.keys(urlsForUserData);
  console.log(shortUrlKeys);
  // many urls ?

    if (!shortUrlKeys.includes(shortURL)) {
      return res.send("<h1>This is not your URL, You can't edit this!</h1>")
    }

  res.redirect("/urls");
});

// add endpoint for POST to /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id").redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
