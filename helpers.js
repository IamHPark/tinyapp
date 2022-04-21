const getUserByEmail = function(email, database) {
  let foundUser = null;
  for (const id in database) {
    const user = database[id];
    if (email === user.email) {
      return user;
    }
  }
};

module.exports = getUserByEmail;

