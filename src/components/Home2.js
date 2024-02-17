import React from 'react'
import { Link } from 'react-router-dom';
import Login from './Login';


const Home2 = () => {
    return (
        <div className='main'>
            <div className="content">
                <div className="content2">
                    <div className='content3'>
                        <div className="content4">
                            <Login/>
                            <div className="some"></div>
                            <Link className="btn btn-success" to="/signup" role="button">Create new account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home2
