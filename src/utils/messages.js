const generateMessage= (username,text)=>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocation= (username,url)=>{
    return {
        username,
        text:url,
        createdAt: new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocation
}