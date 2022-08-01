const socket=io()

//Elements
const $messageForm= document.querySelector('#message-form')
const $messageFormInput= document.querySelector('textarea')
const $messageFormButton= document.querySelector('button')
const $Location= document.querySelector('#send-location')
const $messages= document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room}=Qs.parse(location.search, {ignoreQueryPrefix: true})

// Dealing with Textarea Height
function calcHeight(value) {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    // min-height + lines x line-height + padding + border
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
    return newHeight;
  }
  
  let textarea = document.querySelector(".resize-ta");
  textarea.addEventListener("keyup", () => {
    textarea.style.height = calcHeight(textarea.value) + "px";
  });

const autoscroll=()=>{
    const element=$messages.lastElementChild
    // element.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})

    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = ($messages.scrollTop + visibleHeight)*2

    if (containerHeight - newMessageHeight < scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html= Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    console.log(url)
    const html= Mustache.render(locationTemplate,{
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    const msg= $messageFormInput.value
    socket.emit('sendMessage',msg, (message, error)=>{
        $messageFormButton.removeAttribute('disabled','disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log(message)
    })
})

$Location.addEventListener('click',()=>{
    if (! navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    $Location.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },
        (shared)=>{
            $Location.removeAttribute('disabled','disabled')
            console.log(shared)
        })
    })
})

socket.on('roomData',({room,users})=>{
    const html= Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})