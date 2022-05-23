import React, { useState,useEffect } from 'react';
import "./css/mode.css"
import { Form  } from 'react-bootstrap';
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useNavigate } from "react-router-dom";

function Mode ({auth,stepIndex,run, steps,setStepIndex,setRun}){
    const [speed, setSpeed] = useState(0.01);
    const [size, setSize] = useState(1);
    const [rainbow, setRainbow] = useState(false);
    const [period, setPeriod] = useState(1);
    const [spacing, setSpacing] = useState(1);
    const [newModeName, setNewModeName] = useState("");
    const [newMode , setNewMode] = useState("");
    const [modeList, setModeList] = useState([]);
    const [visibility, setVisibility] = useState(false);
    const [mode, setModes] = useState([
        {identifiant:'un', nom : 'Rainbow Wheel',  param:["speed"], logo : "bi-bullseye",mode:"rainbowWheel"},
        {identifiant:'deux', nom : 'Chase',  param:["speed","size","spacing","rainbow","period"], logo : "bi-shuffle",mode:"chase"},
        {identifiant:'trois', nom : 'Comet All SameTime',  param:["speed","size"], logo : "bi-star",mode:"cometAllSameTime"},
        {identifiant:'quatre', nom : 'Color Wipe One ByOne',  param:["speed","size","spacing","rainbow","period"], logo : "bi-qr-code-scan",mode:"colorWipeOneByOne"},
        {identifiant:'cinq', nom : 'Color Wipe 2',  param:["speed"], logo : "bi-upc-scan",mode:"colorWipe2"},
        {identifiant:'six', nom : 'Color Wipe',  param:["speed","spacing"], logo : "bi-rainbow",mode:"colorWipe"},
        {identifiant:'sept', nom : 'Comet',  param:["speed","size","rainbow"], logo : "bi-stars",mode:"comet"},
        {identifiant:'huit', nom : 'Rainbow',  param:["speed","period"], logo : "bi-rainbow",mode:"rainbow"},
        {identifiant:'dix', nom : 'Pulse',  param:["speed"], logo : "bi-heart-pulse",mode:"pulse"},
        {identifiant:'onze', nom : 'Color Cycle',  param:["speed"], logo : "bi-arrow-repeat",mode:"colorCycle"},
        {identifiant:'douze', nom : 'Solid',  param:[], logo : "bi-bricks",mode:"solid"},
        {identifiant:'treize', nom : 'Blink',  param:["speed"], logo : "bi-sun",mode:"blink"},


    ]);
    const history = useNavigate()
    const [counter, setCounter] = useState(0);
    
    // useEffect for setting the properties of the mode
    useEffect(() => {
        window.localStorage.setItem("speed", speed);
    }, [speed]);
    useEffect(() => {
        window.localStorage.setItem("size", size);
    }, [size]);
    useEffect(() => {
        window.localStorage.setItem("rainbow", rainbow);
    }, [rainbow]);
    useEffect(() => {
        window.localStorage.setItem("period", period);
    }, [period]);
    useEffect(() => {
        window.localStorage.setItem("spacing", spacing);
    }, [spacing]);

    useEffect(() => {
        let saveSpeed = JSON.parse(window.localStorage.getItem("speed"))
        let saveSize = JSON.parse(window.localStorage.getItem("size"))
        let saveRainbow = JSON.parse(window.localStorage.getItem("rainbow"))
        let savePeriod = JSON.parse(window.localStorage.getItem("period"))
        let saveSpacing = JSON.parse(window.localStorage.getItem("spacing"))

        if(saveSpeed !== null){
            setSpeed(saveSpeed);
        }
        if(saveSize !== null){
            setSize(saveSize);
        }
        if(saveRainbow !== null){
            setRainbow(saveRainbow);
        }
        if(savePeriod !== null){
                setPeriod(savePeriod);
        }
        if(saveSpacing !== null){
            setSpacing(saveSpacing);
        }
        if(localStorage.getItem("tutorial") !== true){
            // setNewModeName('Tutorial')
            // setNewMode(['chase','chase'])
            console.log("nexModetuto")
            saveMode(['Tutorial','chase'])
        }
        logoSavedModes();
        setStepIndex(stepIndex + 1);
      }, []);

    
    function logoSavedModes(){
        try{
            let myModes = window.localStorage.getItem("mode")
            if(myModes !== null){
                console.log(myModes)
                var myArray = myModes.split("/");
                console.log(myArray)
                if (myModes !=="/"){
                    // for (var i = 0; i < myArray.length; i++) {
                    //     console.log(myArray[i].split(","))
                    //     myArray[i] = myArray[i].split(",")
                        
                    // }
                    myArray.pop()
                    var res = [];
                    console.log(myArray)
                    for(var i = 0; i < myArray.length; i++){
                        res.push(myArray[i].split(","))
                    }

                    console.log(res)
                    console.log(myArray )
                    setModeList(res)
                }
            }
            else{
                console.log("no modes saved")
                setModeList([])
            }
            
        }
        catch(error){
            console.log(error)
        }
        
    }

    const runMyMode= (size,speed,mode,spacing,period,rainbow) =>{
        if (rainbow === 'true'){
            rainbow = true
        }
        rainbow = false
        let data = JSON.stringify({"length":Number(size),"speed":Number(speed),"mode":mode,"spacing":Number(spacing),"period":Number(period),"rainbow":rainbow});
        axios({
            method: "POST",
            url:"/api/Mode",
            data: data,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                Authorization: 'Bearer ' + auth.token
            }
        }).then((response) => {
            const res =response.data
            console.log(res)
        }).catch(error => console.log(error))
        return false;
    }

    const changeMode = (mode) =>{
        console.log(mode)
        let data = JSON.stringify({"length":size,"speed":speed,"mode":mode,"spacing":spacing,"period":period,"rainbow":rainbow});
        axios({
            method: "POST",
            url:"/api/Mode",
            data: data,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                Authorization: 'Bearer ' + auth.token
            }
        }).then((response) => {
            const res =response.data
            console.log(res)
        }).catch(error => console.log(error))
        return false;

    } 
    const saveMode = (demoMode) =>{

        if((newModeName !== ""  && (/^[A-Za-z1-9-'\s]+$/.test(newModeName)))||demoMode[0] === 'Tutorial'){
            let data ="";
            // let data = JSON.stringify({"length":size,"speed":speed,"mode":newMode,"spacing":spacing,"period":period,"rainbow":rainbow,"name":newModeName});
            console.log(demoMode)
            if(demoMode !== undefined &&demoMode[0] === 'Tutorial'  ){
                console.log("tuto")
                data =`${size},${speed},${demoMode[1]},${spacing},${period},${demoMode[1]},${demoMode[0]}/`;
            }
            else{
                data =`${size},${speed},${newMode[1]},${spacing},${period},${rainbow},${newModeName}/`;
            }
            
            console.log(data)
            let oldMode = localStorage.getItem("mode");
            
            console.log(oldMode)
            if (oldMode === null){
                localStorage.setItem("mode", data);
                console.log('est null')
                document.getElementById("closeNameBtn").click()
            }
            else{
                var myArray = oldMode.split("/");
                console.log(myArray)
                let isIn = false;
                console.log(data.slice(0, -2))
                console.log(myArray.find(v => data.slice(0, -2).includes(v)))
                for (var i = 0; i < myArray.length; i++) {
                    // if()
                    console.log()
                    if(data.slice(-9,-1) =="Tutorial"){
                        return false;
                    }
                    if( myArray[i].includes(data.slice(0, -2))){
                        isIn = true;
                    }
                }
                if (isIn ){
                    toast.error("Ce mode existe déjà")
                }
                else if(!isIn ){
                    toast.success('Mode bien enregistré')
                    let newModes =oldMode+ data;
                    console.log(newModes)
                    localStorage.setItem("mode", newModes);
                    document.getElementById("closeNameBtn").click()
                    logoSavedModes();
                }
            }
    
        }
        else{
            console.log("no name")
            document.getElementsByClassName("nameModeInput")[0].setAttribute('placeholder', 'Please enter a name');
            document.getElementsByClassName("nameModeInput")[0].style.borderColor = "red";
            document.getElementsByClassName("nameModeInput")[0].classList.add('invalidName');
        }
        // try{
        //     let myModes = window.localStorage.getItem("mode")
        //     console.log(myModes)
        //     var myArray = myModes.split("/");
        //     console.log(myArray)
        //     for (var i = 0; i < myArray.length; i++) {
        //         myArray[i] = myArray[i].split(",")
        //     }
        //     myArray.pop()
        //     console.log(myArray )
        
        //     setModeList(myArray)
        // }
        // catch(error){
        //     console.log(error)
        // }
    } 

    const removeMode = (mode) =>{
        mode =(mode.join(",").toString())
        console.log(mode)
        var myArray = localStorage.getItem("mode").split("/");
        console.log(myArray)
        myArray.pop()
        let index = myArray.indexOf(mode);
        myArray.splice(index, 1);
        console.log(myArray)
        console.log(myArray.join("/")+"/")
        if(myArray.length !== 0){
            localStorage.setItem("mode", myArray.join("/")+"/");
        }
        else{
            localStorage.removeItem("mode");
        }
        logoSavedModes();

    }

    const changeVisibilityDelete =() =>{
        if (visibility) {
            setVisibility(false)
        }
        else{   
            setVisibility(true)
        }
    }
    const handleChange=(e) =>{
        let isChecked = e.target.checked;
        setRainbow(isChecked);
        // do whatever you want with isChecked value
      }


    useState(() => {
        console.log(counter)

    }, [counter])
     
    //   const handleJoyrideCallback = data => {
    //       console.log(stepIndex)
    //       const { action, index, status, type } = data;
          
        
    //     // if (stepIndex ===4){
    //     //     history("/");
    //     //     // setStepIndex(0)
    //     // }
        
    //     if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
            
    //       setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    //     //   console.log("yes")
    //       setCounter(counter + 1)
    //     //   console.log(conter)
    //     //   if(stepIndex === 6){
           
    //     // }
    //         console.log(action, index,ACTIONS.PREV)
    //         if (index ===4 && action !== 'next' ){
    //             // document.getElementById("deuxBtnClose").click()
    //             history("/");
    //             // setStepIndex(0)
    //         }
    //         if (index ===5  && action === 'prev'){
    //             // document.getElementById("deuxBtnClose").click()
    //             history("/");
    //             // setStepIndex(0)
    //         }
    //         if (index === 5  && action === 'next') {
    //             document.getElementById("modalNum1").click()
    //             console.log("nexxssss")
    //         }
    //         if (index === 6 && action === 'prev') {
    //             document.getElementById("deuxBtnClose").click()
    //             console.log("yes")
    //         }
    //         if (index === 12 && action === 'next') {
    //             saveMode()
    //             document.getElementById("deuxBtnClose").click()
    //             let toScroll= document.getElementsByClassName("separator")[0].offsetTop
    //             window.scrollTo(toScroll, toScroll)
    //             console.log("saved")
    //         }
    //         if (index === 11 ) {
    //             setNewModeName('Tutorial')
    //             setNewMode(['chase','chase'])
                
    //         }
    //         if (index === 13 && action === 'prev') {
    //             document.getElementById("modalNum1").click()
    //             let toScroll= document.getElementById("modePageId").offsetTop
    //             window.scrollTo(toScroll, toScroll)
    //             console.log("yes")
    //         }
    //     }
    //     else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
    //       setRun(false);
    //     //   localStorage.setItem('tutorial', true);
    //     }
        
    //     // console.groupCollapsed(type);
    //     // console.log(data); //eslint-disable-line no-console
    //     // console.groupEnd();
    //   };

    return (       
        
        <div className="voirPhoto">
            <div >
                <h1 className="settingsTitle" id="modePageId" >Modes</h1>                
            </div>
            <div className="row mt-3">
            {mode.map((item, k) => (
                <div  key={k } className={`col-4 effetDiv ${"mode"+k}`} id={"modalNum"+k} data-bs-toggle="modal" data-bs-target={"#"+item.identifiant}>
                    <div className='modeItem '>
                         <i className={`bi ${item.logo} logoBootstrap`}></i>
                    </div>
                    <div className={`modeName`}>
                         {item.nom}
                    </div>
                    <div  className='modalInfo '>
                        <div className={`modal modalInfo `} id={item.identifiant} tabIndex="-1" aria-labelledby="choseModeLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content ">
                                    <div className="modal-header">
                                        <div className='col-10 modalTitle'>
                                            {item.nom}
                                        </div>
                                        <div className='col-2 d-flex justify-content-end '>
                                            <button type="button" className="btn-close " id={item.identifiant +"BtnClose"} data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                    </div>
                                    <div className="modal-body row d-flex justify-content-center">  
                                    {item.param.map((params, l) => (
                                        <div key={l+99 }>
                                        {params === "speed" && 
                                            <div className={`${"tourSpeed"+item.identifiant}`}>
                                            <div className={`paramSelect`}>Speed</div>
                                                <Form.Range step={0.01} min={0.01} max={1} value={speed} onChange={(e) =>setSpeed(e.target.value)}/>
                                            </div>
                                        }
                                        
                                        
                                        {params === "spacing" && 
                                        
                                            <div className={`${"tourSpacing"+item.identifiant}`}>
                                            <div className='paramSelect'>Spacing</div>
                                                <Form.Range step={1} min={1} max={30} value={spacing} onChange={(e) =>setSpacing(e.target.value)}/>
                                            </div>
                                        }
                                        {params === "size" && 
                                        
                                            <div className={`${"tourSize"+item.identifiant}`}>
                                            <div className='paramSelect'>Size</div>
                                                <Form.Range step={1} min={1} max={30} value={size} onChange={(e) =>setSize(e.target.value)}/>
                                            </div>
                                        }
                                        {params === "rainbow" && 
                                            <div className={`${"tourRainbow"+item.identifiant}`}>
                                                <div className='paramSelect'>Rainbow</div>
                                                <input className="form-check-input" type="checkbox" checked={rainbow}  id="flexCheckDefault" onChange={e => handleChange(e)}></input>
                                            </div>
                                        }
                                        {params === "period" && 
                                            <div className={`${"tourPeriod"+item.identifiant}`}>
                                            <div className='paramSelect'>Period</div>
                                                <Form.Range step={1} min={1} max={30} value={period} onChange={(e) =>setPeriod(e.target.value)}/>
                                            </div>
                                        }
                                        


                                        </div>
                                        
                                    ))
                                    }
                                    <div className={`col-12 c d-flex justify-content-center ${"tourStart"+item.identifiant}`}>
                                        <button onClick={() => changeMode(item.mode)} id="btnStart" className="btnSetParamMode">Démarrer</button>                               
                                    </div>
                                    <div className={`col-12 c d-flex justify-content-center ${"tourSave"+item.identifiant}`}>
                                        <button data-bs-toggle="modal" data-bs-target={"#modeName"} className="btnSetParamMode" onClick={() => setNewMode([item.nom,item.mode])}>Sauvegarder</button>
                                    </div>
                                    
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {/* Div for the save mode modal */}
            <div className='modalInfo '>
                <div className="modal modalInfo" id={"modeName"} tabIndex="-1" aria-labelledby="modeName" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content ">
                            <div className="modal-header">
                                <div className='col-10 modalTitle'>
                                    Save {newMode[0]} Mode
                                </div>
                                <div className='col-2 d-flex justify-content-end '>
                                    <button type="button" className="btn-close " id="closeNameBtn" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                            </div>
                            <div className="modal-body row d-flex justify-content-center">  
                                <div className="mb-3 ms-1 me-1">
                                    <label htmlFor="setModeName" className="form-label" >Mode name</label>
                                    <input  className="form-control nameModeInput" id="setModeName" placeholder='Mode Name' onChange={(e) =>setNewModeName(e.target.value)} />
                                </div> 
                                <div className='col-12 c d-flex justify-content-center'>
                                    <button  onClick={() => saveMode()} className="btnSetParamMode">Sauvegarder</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Div with saved modes */}
            { modeList.length > 0 &&
            <>
            <div className="col-12 separator">Modes Sauvegardés</div>
            
                {modeList.map((item, k) => (
                    <div className={`col-4 myOwnEffects ${"myOwnEffects" +item[6]}`}  key={k}>
                        <div className='col-12 deleteModeDivLogo' >
                            {visibility &&
                                <i className="bi bi-trash deleteMode" onClick={() =>removeMode(item)}></i>
                            }
                        </div>
                        <div className='col-12 row' onClick={() => runMyMode(item[0],item[1],item[2],item[3],item[4],item[5],item[6])}>
                            <div className='col-12'>
                                
                                <i className={`bi ${mode.find(o => o.mode === item[2])["logo"]} logoSavedModes`}></i>
                            </div>
                            <div className='col-12 savedModeText'>
                            {item[6]}
                            </div>
                        </div>
                        
                    </div>
                ))}
            

            {visibility &&
                <button className="col-12 btnModifiy d-flex justify-content-center" onClick={changeVisibilityDelete}> Sauvegarder</button>
            }
            {!visibility &&
                <button className="col-12 btnModifiy d-flex justify-content-center" onClick={changeVisibilityDelete}> Supprimer</button>
            }
            </>
        }
        </div>
        <Toaster
        position="top-center"
        reverseOrder={false}
        />
        
    </div>
    )
}
export default Mode;