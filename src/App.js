import React, { useEffect, useState } from 'react';
import './App.css';
import Plot from 'react-plotly.js';
import createTracesFromJSON from './Traces.js'

import Spinner from 'react-bootstrap/Spinner'
import Menu from './components/Menu';

function App() {
  const [appState, setAppState] = useState({
    loading: false,
    ammoData: null,
  });

  useEffect(() => {
    setAppState({ loading: true });
    const apiUrl = "https://api.jsonbin.io/v3/b/" + process.env.REACT_APP_JSONBIN_BIN_ID;
    fetch(apiUrl, {
      headers: {
        'X-Master-Key': process.env.REACT_APP_JSONBIN_API_KEY
      }
    })
      .then((res) => res.json())
      .then((ammoData) => {
        setAppState({ loading: false, ammoData: ammoData });
      });
  }, [setAppState]);

  let finalTraces
  if (appState.ammoData) {
    finalTraces = createTracesFromJSON(appState.ammoData)
  }

  const plot = <Plot
    config={{displayModeBar: false}}
    data={finalTraces}
    layout={{
      paper_bgcolor:"rgb(230,230,230)",
      height: 1200,
      width: 1200,
      title: `Tarkov Ammo by Caliber: Damage/Penetration/Price`,
      autosize: true,
      scene: {
        xaxis: {
          title: "Damage",
          range: [200, 0],
        },
        yaxis: {
          title: "Penetration",
          range: [80, 0],
        },
        zaxis: {
          title: "Cost (₽, 24hr avg.)",
          range: [0, 5000],
        }
      }
    }}
    useResizeHandler={true}
    style={{width: "100%", height: "100%"}}
  />

  return (
    <div>
      <div>
        <Menu/>
      </div>
      <div> 
        {appState.loading ? (
          <div>
            <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
              <div>          
                <Spinner animation="border" role="status">
                  <span className="sr-only"></span>
                </Spinner>
              </div>
            </div>
          </div>
          ):(
            <div>
              <div>{plot}</div>
              <div>Single-click a caliber to remove/add it to the graph</div>
              <div>Double-click a caliber to isolate it</div>
              <div>Left click+drag to rotate</div>
              <div>Right click+drag to pan</div>
              <div>Mouse wheel to zoom</div>
              <div>Ctrl+click to add single calibers to the graph</div>
            </div>
          )} 
      </div>
    </div>
  );
}

export default App;
