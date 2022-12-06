import React, { useState, useEffect } from "react"
import axios from "axios"
import { Marker, Popup, TileLayer, MapContainer } from "react-leaflet"
import { mark } from "./Mark"
const { VITE_USERNAME, VITE_STYLE_ID, VITE_ACCESS_TOKEN } = import.meta.env


function App() {
    const [currentIP, setCurrentIP] = useState("")
    const [position, setPosition] = useState({ lat: 0, lng: 0 })
    const [serverInfo, setServerInfo] = useState({
        ip: "UNKNOWN",
        location: "UNKNOWN",
        timeZone: "UNKNOWN",
        isp: "UNKNOWN"
    })
    const [ipChangeFlag, setIpChangeFlag] = useState(true)

    useEffect(() => {
        function getUserIp() {
            axios.get("https://api.ipify.org")
                .then((response) => {
                    setCurrentIP(response.data)
                })
                .catch((error) => {
                    console.log(error)
                })
        }

        function setCurrentPositionFromIp() {
            axios.get("https://geo.ipify.org/api/v2/country,city", {
                params: {
                    apiKey: "at_eP8Cs1fpKnAxp0FReVpdnCo5qgvjK",
                    ipAddress: currentIP
                }
            })
            .then((response) => {
                const { 
                    lat, 
                    lng, 
                    city, 
                    country, 
                    timezone, 
                    region 
                } = response.data.location
                setPosition((prev) => ({ lat: lat, lng: lng }))
                setServerInfo((prev) => ({
                    ...prev,
                    ip: response.data.ip,
                    location: `${city}, ${country} ${region}`,
                    timeZone: `UTC${timezone}`,
                    isp: response.data.isp
                }))
            })
            .catch((error) => {
                console.log(error)
            })
        }

        if (currentIP === "") {
            getUserIp()
        }

        setCurrentPositionFromIp()
        
    }, [ipChangeFlag])

    function handleChange(event) {
        event.preventDefault()

        if (event.target.name === "ip_address") {
            setCurrentIP(event.target.value)
        }
    }

    function handleSubmit(event) {
        event.preventDefault()
        setIpChangeFlag((prevFlag) => !prevFlag)
    }

    return (
        <div className="app">
            <section className="ip--header">
                <div className="title">
                    IP Address Tracker
                </div>
                <form className="ip--form">
                    <input 
                        type="text"
                        name="ip_address"
                        value={currentIP}
                        onChange={handleChange}
                        placeholder="Search for any IP address or domain"
                    />
                    <button 
                        className="ip--submit"
                        onClick={(event) => handleSubmit(event)}
                    > 
                    </button>
                </form>
            </section>
            { 
                (position.lat !== 0 && position.lng !== 0) && 
                <section id="map">
                    <section className="ip--info">
                        <div className="info-sec">
                            <div className="info-holder">
                                <div className="sub-title">
                                    IP ADDRESS
                                </div>
                                <div className="sub-value">
                                    {serverInfo.ip}
                                </div>
                            </div>
                        </div>
                        <div className="info-sec bf">
                            <div className="info-holder">
                                <div className="sub-title">
                                    LOCATION
                                </div>
                                <div className="sub-value">
                                    {serverInfo.location}
                                </div>
                            </div>
                        </div>
                        <div className="info-sec bf">
                            <div className="info-holder">
                                <div className="sub-title">
                                    TIMEZONE
                                </div>
                                <div className="sub-value">
                                    {serverInfo.timeZone}
                                </div>
                            </div>
                        </div>
                        <div className="info-sec bf">
                            <div className="info-holder">
                                <div className="sub-title">
                                    ISP
                                </div>
                                <div className="sub-value">
                                    {serverInfo.isp}
                                </div>
                            </div>
                        </div>
                    </section>
                    <MapContainer
                        center={[position.lat, position.lng]}
                        zoom={15}
                        scrollWheelZoom={true}
                        className="map--section"
                    >
                        <TileLayer 
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url={`https://api.mapbox.com/styles/v1/${VITE_USERNAME}/${VITE_STYLE_ID}/tiles/256/{z}/{x}/{y}@2x?access_token=${VITE_ACCESS_TOKEN}`}                  
                        />
                        <Marker position={[position.lat, position.lng]} icon={mark}>
                            <Popup>
                                <ul>
                                    <li>ip: {serverInfo.ip}</li>
                                    <li>location: {serverInfo.location}</li>
                                    <li>timezone: {serverInfo.timeZone}</li>
                                    <li>isp: {serverInfo.isp}</li>
                                </ul>
                            </Popup>
                        </Marker>
                    </MapContainer>
                </section>
            }
        </div>
    )
}

export default App
