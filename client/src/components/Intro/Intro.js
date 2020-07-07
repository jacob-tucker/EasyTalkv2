import React, {useState} from 'react'
import {appHistory} from '../../App.js'
import './Intro.css';

import axios from 'axios'
axios.defaults.withCredentials = true

//Destination URL: www.yoursite.com?myparam1={id1}&myparam2={id2} <-- for linking with paramaters
const Intro = () => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [response, setResponse] = useState('')
  const [response1, setResponse1] = useState('')

  const updateUsername = (event) => {
    setUsername(event.target.value)
    setResponse('')
    setResponse1('')
  }

  const updateName = (event) => {
    setName(event.target.value)
    setResponse('')
    setResponse1('')
  }

  const updatePassword = (event) => {
    setPassword(event.target.value)
    setResponse('')
    setResponse1('')
  }

  const signUp = (e) => {
    e.preventDefault()
    if(name === '' || username === '' || password === ''){
      setResponse("Please fill out every field.")
    }else{
      axios.post('https://easytalkchatappv2.herokuapp.com/signup', {
        name: name,
        username: username,
        password: password
      }).then(res => {
        console.log(res.data)

        if(res.data === "Signup!"){
          appHistory.push({
            pathname: '/ChatRoom',
            search: `?user=${username}`,
            state: {username}
          })
        }else{
          setResponse(res.data)
        }
      })
    }
  }

  const signIn = (e) => {
    e.preventDefault();
    axios.post('https://easytalkchatappv2.herokuapp.com/signin', {
      username: username,
      password: password
    }).then(res => {
      console.log(res.data)

      if(res.data !== "Please review."){
        appHistory.push({
          pathname: '/ChatRoom',
          search: `?user=${username}`,
          state: {username}
        })
      }else{
        setResponse1(res.data)
      }
    })
  }


  return(
  <div>
    <h1 id="title">EasyTalk</h1>
    <div className="login-box">
      <h2>Log In</h2>
      <form>
        <div className="user-box">
          <input type="text" required onChange={updateUsername} />
          <label>Username</label>
        </div>
        <div className="user-box">
          <input type="text" required onChange={updatePassword} />
          <label>Password</label>
        </div>
        <button onClick={signIn}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Submit
        </button>
        <br />
        <br />
        <h2>{response1}</h2>
      </form>
    </div>
    <div className="signup-box">
      <h2>Sign Up</h2>
      <form>
        <div className="user-box">
          <input type="text" required onChange={updateName} />
          <label>Full Name</label>
        </div>
        <div className="user-box">
          <input type="text" required onChange={updateUsername} />
          <label>Username</label>
        </div>
        <div className="user-box">
          <input type="text" required onChange={updatePassword} />
          <label>Password</label>
        </div>
        <button onClick={signUp}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          Submit
        </button>
        <h2>{response}</h2>
      </form>
    </div>
  </div>
  )
}

export default Intro
