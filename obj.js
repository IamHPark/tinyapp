// const urlDatabase = {
//   b6UTxQ: {
//         longURL: "https://www.tsn.ca",
//         userID: "aJ48lW"
//     },
//     i3BoGr: {
//         longURL: "https://www.google.ca",
//         userID: "aJ48lW"
//     }
// };

// const urlsForUser = function(id) {
//   let dataForUser = {}
//   for ( const url in urlDatabase) {
//     let shortURL = url;
//     let longURL = urlDatabase[url].longURL
//     if (urlDatabase[url].userID === id) {
//       dataForUser[shortURL] = longURL
//     }
//   }
//   return dataForUser;
// }

// console.log(urlsForUser("aJ48lW"))


// const isUserExist = (email) => {
//   let foundUser = null;
//   for (const userID in users) {
//     const user = users[userID];
//     if (email === user.email) {
//       foundUser = user;
//     }
//   }
//   return foundUser && email === foundUser.email ? true : false;
// };


const bcrypt = require('bcryptjs');
const password = "purple-monkey-dinosaur"
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword);

console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false
console.log(hashedPassword === bcrypt.hashSync("purple-monkey-dinosaur"))