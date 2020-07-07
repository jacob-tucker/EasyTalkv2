import React, {useState, useEffect} from 'react';
import Speech from 'react-speech'
import './ChatRoom.css';
import io from 'socket.io-client'
import Messages from '../Messages/Messages'
import axios from 'axios'
import {appHistory} from '../../App.js'

let socket

const ChatRoom = ({location}) => {
  const username = location.state.username
  const [room, setRoom] = useState('All Chat')
  const [rooms, setRooms] = useState([])
  const [displayRooms, setDisplayRooms] = useState([])
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)
  const [show1, setShow1] = useState(false)
  const [newRoom, setNewRoom] = useState('')
  const [displayRoom, setDisplayRoom] = useState('All Chat')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [color, setColor] = useState('grey')

  const updateSearch = (e) => {
    e.preventDefault()
    setSearch(e.target.value)
  }


  const logout = (e) => {
    e.preventDefault()
    axios.get('https://easytalkchatappv2.herokuapp.com/logout', {
      username
    }).then(res => {
      console.log(res.data)
      socket.emit('disconnect')
      appHistory.push({
        pathname: '/'
      })
    })
  }

  //We know that componentWillUnmount executes when component is removed from actual DOM.
  //Similarly if we use useEffect with an empty second argument and adding a return function call it
  //will work as componentWillUnmount

  useEffect(() => {
    axios.post('https://easytalkchatappv2.herokuapp.com/getRooms', {
      username
    }).then(res => {
      console.log(res.data)
      setRooms(res.data.chats)
      setDisplayRooms(res.data.displayChats)

    })

    socket = io.connect('https://easytalkchatappv2.herokuapp.com/')
    socket.emit('join', {name: username, room: room}, () => {
    })

    return(() => {

    })
  }, [])

  //IF YOU WANT TO USE STATE IN useFFECT, YOU MUST INCLUDE IT INSIDE THE SECOND ARGUMENT! LESSON LEARNED
  useEffect(() => {
    socket.on('updateYourRooms', ({person, sender, roomAdd, displayroomAdd, displayroomAddSender}) => {
      if(person === username){
        setRooms([...rooms, roomAdd])
        setDisplayRooms([...displayRooms, displayroomAddSender])
      }else if (sender === username){
        setRooms([...rooms, roomAdd])
        setDisplayRooms([...displayRooms, displayroomAdd])
      }
    })
  }, [rooms, displayRooms])


  const updateMessage = (event) => {
    setMessage(event.target.value)
  }

  useEffect(() => {
    socket.on('message', (message) => {
      console.log('IT IS HERE!! IM SO HAPPY')
      setMessages([...messages, {message: message.message, sender: message.sender}])
    })
  }, [messages])

  //This effect goes through everytime the room changes, which happens when a user clicks on a different one of their chats
  //Important to remember this only happens when the room changes, still need socket.io to update on current room, which is why
  //we still emit messages back :)
  useEffect(() => {
    axios.post('https://easytalkchatappv2.herokuapp.com/getMessages', {
      room: room,
      username: username
    }).then(res => {
      console.log(res.data)
      setMessages(res.data)
    })
  }, [room])

  const sendMessage = (event) => {
    event.preventDefault();
    socket.emit('sendMessage', {room: room, message: message, sender: username}, () => {
      setMessage('')
    });
  }

  const addRoom = (event) => {
    event.preventDefault()
    setShow(!show)
  }

  const addNewRoom = (event) => {
    event.preventDefault()
    setNewRoom(event.target.value)
  }

  const submitRoom = (event) => {
    event.preventDefault()
    axios.post('https://easytalkchatappv2.herokuapp.com/addRoom', {
      newRoom: newRoom,
      username: username
    }).then(res => {
      console.log(res.data)
      if(res.data === 'Created! Woop woop!'){
        console.log("YA YA YA YA YA")

        socket.emit('newChat', {updatePerson: newRoom, sender: username}, () => {

        })
        setShow(false)
        setNewRoom('')
      }else {
        setError(res.data)
      }
    })
  }


  const readMessage = (event) => {
    event.preventDefault()
    return (
      <Speech text={message} />
    )
  }

  return (
    <div>
      <div id="header" style={{background: 'dark' + color}}><h1 id="theRoom">{displayRoom}</h1></div>
      <div className="colorsB"><button onClick={() => setShow1(!show1)}>Colors</button></div>
      {show1 ? <div className="addStuff1"><h1>Set a New Color</h1><button id="exit1" onClick={() => setShow1(!show1)}>x</button>
    <button style={{background: 'cyan'}} onClick={() => setColor('cyan')}>Cyan</button>
    <button style={{background: 'seagreen'}} onClick={() => setColor('seagreen')}>Sea Green</button>
    <button style={{background: 'grey'}} onClick={() => setColor('grey')}>Grey</button>
    <button style={{background: 'green'}} onClick={() => setColor('green')}>Green</button>
    <button style={{background: 'salmon'}} onClick={() => setColor('salmon')}>Salmon</button>
    <button style={{background: 'blue'}} onClick={() => setColor('blue')}>Blue</button></div> : null}
      <div className="add" style={{background: 'light' + color}}><button onClick={addRoom}><img src="https://raw.githubusercontent.com/twitter/twemoji/gh-pages/svg/2795.svg" height="10" /></button><input type="text" onChange={updateSearch} placeholder="Search" /></div>
      {show ? <div className="addStuff"><h1>Create a New Chat</h1><button id="exit" onClick={addRoom}>x</button><input onChange={addNewRoom} placeholder="Recipient's username..." /><button onClick={submitRoom}>Add<span></span><span></span><span></span><span></span></button><h2>{error}</h2></div> : null}
      <div className="rooms">
        {rooms.map((thing, i) => {
          return (
            <div key={i}>{displayRooms[i] ? displayRooms[i].chat.toUpperCase().includes(search.toUpperCase()) ? <div><button style={{background: 'light' + color}} key={i} onClick={() => {
                setRoom(thing);
                setDisplayRoom(displayRooms[i].chat)
                socket.emit('rejoin', {name: username, room: thing}, () => {
                })
              }}><p id="initials">{displayRooms[i].initials}</p><p id="chatName">{displayRooms[i].chat}</p></button></div> : null : <p>rooms[i]</p>}</div>
          )
        })}
      </div>
      <div className="centered" style={{background: 'dark' + color}}>
        <div className="messages">
          <Messages messages={messages} username={username}/>
        </div>
      </div>
      <div id="theSender" style={{background: 'dark' + color}}>
        <form onSubmit={sendMessage}>
          <input id="inputing" placeholder='Send message...' type="text" value={message} onChange={updateMessage} />
          <button id="submiter" type="submit">Send Message</button>
          <span className="audio"><img height="40" src="https://img.icons8.com/cotton/64/000000/microphone.png"/></span>
          <span className="audio2"><Speech textAsButton={true} displayText="Play" text={message} /></span>
        </form>
      </div>
      <div className="logout"><button onClick={logout}>Logout</button></div>
      <h1 id="logo">EasyTalk - Made by: Jacob Tucker</h1>
    </div>
  )
}
//<img height="55" src="https://img.icons8.com/cotton/64/000000/microphone.png"/
export default ChatRoom;
