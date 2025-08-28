import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '300px', marginTop: 16 };
const center = { lat: 19.075983, lng: 72.877655 };

export default function TeamTracker(){
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY });
  const [members, setMembers] = useState({});

  useEffect(() => {
    const sock = io(import.meta.env.VITE_API_BASE.replace('/api',''), { transports: ['websocket'] });
    const user = JSON.parse(localStorage.getItem('user')||'null');
    // If user is distributor, join distributor room to receive locations
    if(user?.role === 'distributor'){
      sock.emit('joinDistributor', user.id);
    }
    sock.on('teamLocation', (payload) => {
      setMembers(prev => ({ ...prev, [payload.userId]: payload }));
    });
    return () => sock.disconnect();
  }, []);

  if(!isLoaded) return <div>Loading map</div>;
  return (
    <div>
      <h4>Live Tracking</h4>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {Object.values(members).map(m => (
          <Marker key={m.userId} position={{ lat: m.lat, lng: m.lng }} label={m.userId} />
        ))}
      </GoogleMap>
    </div>
  );
}
