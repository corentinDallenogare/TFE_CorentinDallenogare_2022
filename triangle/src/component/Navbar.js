import React, { useEffect} from 'react';
import {Link} from 'react-router-dom';
import "../css/navbar.css";
import axios from "axios";

const Navbar = (props) => {
  // This component is used to display the navbar
  // It is composed of 4 buttons :
  // - Home
  // - Settings
  // - Modes
  // - Power


  // Set the color of the active li navbar
  useEffect(() => {
    if(window.location.pathname ==="/") {
      document.getElementsByClassName("tourColor")[0].classList.add("active");
    }
    else if(window.location.pathname ==="/mode") {
      document.getElementsByClassName("toModePage")[0].classList.add("active");
    }
    else if(window.location.pathname ==="/settings") {
      document.getElementsByClassName("tourSettings")[0].classList.add("active");
    }

    
  }, []);

  // Shut down the leds
  const goOff = () =>{
    
    axios({
      method: "GET",
      url:"/api/Off",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        Authorization: 'Bearer ' + props.token
      }
    }).then((response) => {
      const res =response.data
      console.log(res)
    }).catch(error => console.log(error))

  } 
  // Set the color of the active li navbar
  const changeActiveNav = (element) =>{
    document.getElementsByClassName("active")[0].classList.remove("active");
    document.getElementsByClassName(element)[0].classList.add("active");
   
  }

  return (
    <>
      <div className='fixed-bottom navbarContent' >	
        <nav className="navbar navbar-expand navbar-light">        
          <div className="collapse navbar-collapse d-flex justify-content-center" id="navbarTogglerDemo03">
            <ul className="navbar-nav mr-auto  mt-0 row navCol" >
              <li className="nav-item col-3 tourColor" onClick={() =>changeActiveNav("tourColor")}>
                <Link className="nav-link" to="/"><i className="bi bi-house navItem logoBootstrap"></i></Link>
              </li>
              <li className="nav-item toModePage col-3" onClick={() =>changeActiveNav("toModePage")}>
                <Link className="nav-link" to="/mode"><i className="bi bi-lightbulb navItem logoBootstrap"></i></Link>
              </li>
              <li className="nav-item col-3 tourShutdown " onClick={() =>changeActiveNav("tourShutdown")}>
                <a className="nav-link" onClick={() => goOff()}><i className="bi bi-power navItem logoBootstrap"></i></a>
              </li>
              <li className="nav-item col-3 tourSettings" onClick={() =>changeActiveNav("tourSettings")}>
                <Link className="nav-link" to="/settings"><i className="bi bi-sliders navItem logoBootstrap"></i></Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );

};

export default Navbar


