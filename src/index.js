const express=require('express')
const Filter=require('bad-words')
const path=require('path')
const http= require('http')
const socketio= require('socket.io')
const {addUser, removeUser,getUser,getUserInRoom}= require('./utils/users')
const {generateMessage, generateLocation}= require('./utils/messages')

const app=express()
const server= http.createServer(app)
const io= socketio(server)

const port = process.env.PORT || 3000
const publicPath= path.join(__dirname,'../public')

app.use(express.static(publicPath))

let count=0

// server (emit) -> client (receive) - countUpdated
// client (emit) -> server (receive) - increment

io.on('connection',(socket)=>{
    console.log('new web socket connection')

    socket.on('join', ({username, room}, callback)=>{
        const {error, user}=addUser({id: socket.id, username, room})
        if(error){
           return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })



    socket.on('sendMessage',(message, callback)=>{
        const user= getUser(socket.id)

        const filter= new Filter()

        if(filter.isProfane(message)){
            return callback(undefined,'Profanity is not allowed')
        }

    
        io.to(user.room).emit('message',generateMessage(user.username,message))
        
        callback('Delivered',undefined)
    })
  

    socket.on('sendLocation',(location, callback)=>{
        const user= getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        
        callback('Location shared')
    })  

    

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            })
        
        }
    
    })
})


server.listen(port,()=>{
    console.log('app listening on port',port)
})