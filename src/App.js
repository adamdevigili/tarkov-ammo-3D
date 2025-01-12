import React, { useEffect, useState } from "react";

import "./App.css";

import Plot from "react-plotly.js";
import createTracesFromJSON from "./Traces.js";

import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import TCNavbar from "./components/Navbar";

function App() {
	const [appState, setAppState] = useState({
		loading: false,
		ammoData: null,
	});

	// useEffect(() => {
	//   setAppState({ loading: true });
	//   let endpoint = "";
	//   if (process.env.REACT_APP_API_ENDPOINT) {
	//     endpoint = process.env.REACT_APP_API_ENDPOINT;
	//   } else {
	//     endpoint = "https://www.tarkov-charts.com";
	//   }
	//   const apiUrl = endpoint + "/api/ammo";
	//   fetch(apiUrl, {
	//     headers: {
	//       "X-Tarkov-Charts-API-Key": process.env.REACT_APP_TC_API_KEY,
	//     },
	//   })
	//     .then((res) => res.json())
	//     .then((ammoData) => {
	//       console.log(ammoData)
	//       setAppState({ loading: false, ammoData: ammoData });
	//     });
	// }, [setAppState]);

	useEffect(() => {
		setAppState({ loading: true });
		fetch("https://api.tarkov.dev/graphql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				query: `{
        ammo {
          item {
            name
            shortName
            basePrice
            avg24hPrice
            buyFor {
              vendor {
                name
              }
              priceRUB
            }
          }
          caliber
          ammoType
          damage
          armorDamage
          penetrationPower
        }
      }`,
			}),
		})
			.then((r) => r.json())
			.then((data) => {
				// console.log('data returned:', data)
				setAppState({ loading: false, ammoData: data });
			});
	}, [setAppState]);

	let finalTraces;
	let updatedAt;
	let releaseVersion = process.env.REACT_APP_RELEASE_VERSION;
	if (appState.ammoData) {
		finalTraces = createTracesFromJSON(appState.ammoData);
		// console.log(finalTraces);
		updatedAt = appState.ammoData["_human_timestamp"];
	}

	const plot = (
		<Plot
			config={{ displayModeBar: false }}
			data={finalTraces}
			layout={{
				// paper_bgcolor: "rgb(230,230,230)",
				paper_bgcolor: "rgb(38,38,38)",
				plot_bgcolor: "rgb(0,0,255)",
				height: 1000,
				width: 1200,
				title:
					`Ammo by Caliber: Damage/Penetration/Price (last updated: ` +
					updatedAt +
					`)`,
				font: {
					family: "Bender",
					size: 14,
					color: "rgb(255,255,255)",
				},
				autosize: true,
				scene: {
					xaxis: {
						color: "rgb(255,255,255)",
						title: "Damage",
						range: [200, 0],
					},
					yaxis: {
						color: "rgb(255,255,255)",
						title: "Penetration",
						range: [80, 0],
					},
					zaxis: {
						color: "rgb(255,255,255)",
						title: "Cost (₽, 24hr avg.)",
						range: [0, 5000],
					},
					camera: {
						center: { x: 0.05, y: 0.075, z: -0.15 },
						eye: { x: 1.35, y: 1.4, z: 1 },
					},
				},
			}}
			useResizeHandler={true}
			style={{ width: "100%", height: "100%" }}
			// onUpdate={() => console.log(plot)}
		/>
	);

	return (
		<div style={{ backgroundColor: "#262626", height: "100vh" }}>
			<div>
				<TCNavbar releaseVersion={releaseVersion} />
			</div>
			<div>
				{appState.loading ? (
					<div
						className="loading"
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100vh",
							color: "#e6e6e6",
						}}
					>
						<div className="spinner">
							<Spinner animation="border" role="status" />
						</div>
						<div className="spinner-text">Checking the stash...</div>
					</div>
				) : (
					<Container fluid className="gx-0">
						<Row className="gx-0">
							<Col
								xs="2"
								sm="2"
								md="2"
								lg="2"
								xl="2"
								xxl="2"
								style={{ color: "#e6e6e6" }}
							>
								<div className="instructions">
									<ul>
										<li>
											<b>Single-click</b> a caliber to remove/add it to the
											graph
										</li>
										<li>
											<b>Double-click</b> a caliber to isolate it
										</li>
										<li>
											<b>Left click+drag</b> to rotate
										</li>
										<li>
											<b>Right click+drag</b> to pan
										</li>
										<li>
											<b>Mouse wheel</b> to zoom
										</li>
										<li>
											<b>Ctrl+click</b> to add single calibers to the graph
										</li>
									</ul>
								</div>
							</Col>
							<Col xs={true} sm={true} md={true} lg={true} xl={true} xxl={true}>
								<div className="main-plot">{plot}</div>
							</Col>
							<Col xs="2" sm="2" md="2" lg="2" xl="2" xxl="2"></Col>
						</Row>
					</Container>
				)}
			</div>
		</div>
	);
}

export default App;
