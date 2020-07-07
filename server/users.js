let users = []

const AddUser = (name, room, id) => {
  users.push({name: name, room: room, id: id})
  console.log(users)
}

//Because curly braces are used to denote the function’s body, an arrow function that wants to
//return an object literal outside of a function body must wrap the literal in parentheses (thus why the
//users.find does not have {} after the fat arrow function
const FindUser = (id) => {
  console.log(id)
  const foundUser = users.find(thing => thing.id == id)
  console.log(foundUser)
  return foundUser
}

const RemoveUser = (id) => {
  users.splice(users.indexOf(FindUser(id)) , 1)
  console.log(users)
}

const FindId = (updatePerson) => {
  console.log(":/")
  users.map(element => {
    console.log(element)
    if(element.name == updatePerson){
      console.log("Yeah it matched")
      return element.id
    }
  })
  return null;
}


module.exports= {AddUser, FindUser, RemoveUser, FindId}
