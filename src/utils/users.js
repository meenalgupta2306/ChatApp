const users=[]

// addUser
const addUser=({id, username, room})=>{
    //clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate
    if(!username || !room){
        return {
            error: "Username and room are required"
        }
    }

    //check for existing user
    const  existing= users.find((user)=> {
        return user.room === room && user.username === username 
    })

    //validate username
    if(existing){
        return{
            error: "Username is in use"
        }
    }

    //store user
    const user= {id, username, room}
    users.push(user)
    return {user}

}

const removeUser=(id)=>{
    const index= users.findIndex((user)=>{
        return user.id === id
    })

    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

const getUser =(id)=>{
    return users.find((user)=> user.id===id)

}

const getUserInRoom=(room)=>{
    room= room.trim().toLowerCase()
    return users.filter((user)=> user.room === room)
}

// console.log(addUser({id:22, username:'Meenal', room:'clg'}))
// console.log(addUser({id:22, username:'Meenal', room:'clg'}))

module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}