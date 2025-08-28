import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import api from '../api/axios';

const containerStyle = { width: '100%', height: '450px' };
const center = { lat: 19.075983, lng: 72.877655 }; // example (Mumbai)

export default function MapPlanner(){
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY, libraries:['geometry','places']});
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [polylinePath, setPolylinePath] = useState(null);

  const mapRef = useRef();

  const onMapClick = (e) => {
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    // If no origin => set origin; else if no dest => set destination; else push waypoint
    if(!origin) setOrigin(pos);
    else if(!destination) setDestination(pos);
    else setWaypoints(prev => [...prev, pos]);
  };

  const optimize = async () => {
    if(!origin || !destination) { alert('set origin and destination by clicking map'); return; }
    try {
      const res = await api.post('/routes/optimize', { origin, destination, waypoints, mode: 'driving' });
      if(res.data.routes && res.data.routes[0]){
        const overview = res.data.routes[0].overview_polyline?.points;
        if(!overview) { alert('No route found'); return; }
        // decode overview_polyline to LatLng array using google.maps.geometry.encoding
        const decoded = window.google.maps.geometry.encoding.decodePath(overview)
          .map(p => ({ lat: p.lat(), lng: p.lng() }));
        setPolylinePath(decoded);
      } else {
        alert('No route returned');
      }
    } catch(err){
      console.error(err);
      alert('Optimize failed: '+(err.response?.data?.message || err.message));
    }
  };

  const clear = () => { setOrigin(null); setDestination(null); setWaypoints([]); setPolylinePath(null); };

  if(!isLoaded) return <div>Loading maps...</div>;
  return (
    <div>
      <div style={{marginBottom:8}}>
        <button onClick={optimize}>Optimize Route</button>
        <button onClick={clear}>Clear</button>
        <div style={{display:'inline-block', marginLeft:10}}>
          <strong>Instructions:</strong> Click map — first click sets start, second sets destination, subsequent clicks add waypoints.
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={origin||center}
        zoom={12}
        onClick={onMapClick}
        onLoad={map => mapRef.current = map}
      >
        { origin && <Marker label="A" position={origin} /> }
        { destination && <Marker label="B" position={destination} /> }
        { waypoints.map((w,i) => <Marker key={i} label={`${i+1}`} position={w} />) }
        { polylinePath && <Polyline path={polylinePath} options={{ strokeWeight: 5 }} /> }
      </GoogleMap>
    </div>
  );
}
