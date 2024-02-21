import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {

    const [data, setData] = useState({email:"", password:""});
    let navigate = useNavigate();

    useEffect(() => {
        if(localStorage.getItem("token")){
            navigate('/home');
        }
    }, [navigate])
    
    const onchange = (e)=>{
        setData({...data, [e.target.name]:e.target.value})
    }

    const api = axios.create({
        baseURL: process.env.REACT_APP_API_URL,
        headers:{
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })

    const authLogin = (data) => api.post("/api/auth/login", data);

    const handleSubmit = async (e)=>{
        e.preventDefault();

        const response = await fetch("localhost:8000/api/auth/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email:data.email, password:data.password})
        })

        // const response = await authLogin({email:data.email, password:data.password});

        const json = await response.json();

        // console.log(json);
        
        if(json.success){
            localStorage.setItem('token', json.authToken);
            navigate('/home');
        }
        else{
            alert("invalid criteria");
        }
    }

  return (
            <form onSubmit={(e) => handleSubmit(e)}>
                <div className="mb-4">
                    <input type="email" value={data.email} placeholder='Email address' onChange={onchange} className="form-control" id="email" name='email' aria-describedby="emailHelp"/>
                </div>
                <div className="mb-4">
                    <input type="password" value={data.password} placeholder='Password' onChange={onchange} className="form-control" id="password" name='password'/>
                </div>
                <button type="submit" className="form-control btn btn-primary" onClick={(e) => handleSubmit(e)}>Log in</button>
            </form>
       
  )
}

export default Login
