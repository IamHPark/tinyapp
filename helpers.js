// get user info with login from the database
const getUserByEmail = function(email, database) {
  let foundUser = null;
  for (const id in database) {
    const user = database[id];
    if (email === user.email) {
      return user;
    }
  }
};

// generate random id
const randomID = () => Math.random().toString(36).substring(2,8);


// where the userID is equal to the id of the currently logged-in user
// return urls data belong to that user
const urlsForUser = function(id, data) {
  let dataForUser = {};
  for (const url in data) {
    let shortURL = url;
    let longURL = data[url].longURL;
    if (data[url].userID === id) {
      dataForUser[shortURL] = longURL;
    }
  }
  return dataForUser;
};
// check if shortURL is included in urlsForUser
const isInUserData = (userID, shortURL, data) =>{
  const urlsForUserData = urlsForUser(userID, data);
  const shortUrlKeys = Object.keys(urlsForUserData);
  return shortUrlKeys.includes(shortURL) ? true : false;
};

module.exports = { getUserByEmail, randomID, isInUserData, urlsForUser };

