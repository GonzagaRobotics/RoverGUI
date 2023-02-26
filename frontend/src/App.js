// Importing modules
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
	// usestate for setting a javascript
	// object for storing and using data
	const [data, setdata] = useState({
		name: "",
		age: 0,
		date: "",
		programming: "",
	});

  //const [data, setdata] = useState(null)

  function getData() {
    axios({
      method: "GET",
      url:"/data",
    })
    .then((response) => {
      const res =response.data
      console.log(res)
      setdata(({
        name: res.Name,
        age: res.Age,
        date: res.Date,
        programming: res.programming,
      }))
    }).catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
        }
    })}

	// Using useEffect for single rendering
	// useEffect(() => {
	// 	// Using fetch to fetch the api from
	// 	// flask server it will be redirected to proxy
	// 	fetch("/api/data").then((res) =>
	// 		res.json().then((data) => {
	// 			// Setting a data from api
	// 			setdata({
	// 				name: data.Name,
	// 				age: data.Age,
	// 				date: data.Date,
	// 				programming: data.programming,
	// 			});
	// 		})
	// 	);
	// }, []);

	return (
		<div className="App">
			<header className="App-header">
				<h1>React and flask</h1>
				{/* Calling a data from setdata for showing */}

        <p>To get your profile details: </p><button onClick={getData}>Click me</button>
				<p>{data.name}</p>
				<p>{data.age}</p>
				<p>{data.date}</p>
				<p>{data.programming}</p>

			</header>
		</div>
	);
}

export default App;
