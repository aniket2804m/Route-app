import React from 'react';
import MapPlanner from '../components/MapPlanner';
import TeamTracker from '../components/TeamTracker';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const user = JSON.parse(localStorage.getItem('user')||'null');
  return (
    <div style={{display:'flex', gap:20, padding:20}}>
      <div style={{width:'30%'}}>
        <h3>Welcome {user?.name}</h3>
        <nav><Link to="/">Planner</Link></nav>
        <p>Use the planner to create & optimize routes.</p>
      </div>
      <div style={{flex:1}}>
        <MapPlanner />
        <TeamTracker />
      </div>
    </div>
  );
}
