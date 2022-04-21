const getUserByEmail = function(email, database) {
  let foundUser = null;
  for (const id in database) {
    const user = database[id];
    if (email === user.email) {
      return user;
    }
  }
};

const randomID = () => Math.random().toString(36).substring(2,8);

// check if shortURL is included in urlsForUser
const isInUserData = (userID, shortURL) =>{
  const urlsForUserData = urlsForUser(userID);
  const shortUrlKeys = Object.keys(urlsForUserData);
  return shortUrlKeys.includes(shortURL) ? true : false;
};

module.exports = { getUserByEmail, randomID, isInUserData };

