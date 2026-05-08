import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Navigation, Activity, Users, MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet's default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export function ISSTrackerWidget({ issData, onRefresh }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Stats Panel */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md border p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Navigation className="text-primary" /> Live ISS Tracker
          </h2>
          <button onClick={onRefresh} className="p-2 hover:bg-secondary rounded-full transition-colors" title="Refresh">
            <RefreshCw size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><MapPin size={14}/> Coordinates</p>
            <p className="font-mono text-lg">{issData.lat.toFixed(4)}, {issData.lng.toFixed(4)}</p>
          </div>
          
          <div className="bg-secondary/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Activity size={14}/> Speed</p>
            <p className="font-mono text-lg">{issData.speed} <span className="text-sm">km/h</span></p>
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg mt-2">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Navigation size={14}/> Nearest Location</p>
          <p className="font-semibold text-lg">{issData.locationName}</p>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg mt-2 flex-grow">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Users size={14}/> People in Space ({issData.astronauts})</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {issData.astronautNames.map(name => (
              <span key={name} className="bg-primary/10 text-primary-foreground text-xs px-2 py-1 rounded-full">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map Panel */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md border p-2 lg:col-span-2 h-[400px] lg:h-[500px] overflow-hidden z-0">
        {issData.lat !== 0 ? (
          <MapContainer 
            center={[issData.lat, issData.lng]} 
            zoom={3} 
            scrollWheelZoom={true} 
            className="h-full w-full rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[issData.lat, issData.lng]}>
              <Popup>
                ISS Current Location<br/>
                Lat: {issData.lat.toFixed(4)}<br/>
                Lng: {issData.lng.toFixed(4)}<br/>
                Speed: {issData.speed} km/h
              </Popup>
            </Marker>
            {issData.path.length > 1 && (
              <Polyline positions={issData.path} color="red" />
            )}
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-secondary/20 rounded-lg">
            <RefreshCw className="animate-spin text-muted-foreground" size={32} />
          </div>
        )}
      </div>

      {/* Speed Chart */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md border p-6 lg:col-span-3">
        <h3 className="text-lg font-semibold mb-4">Speed History (km/h)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={issData.speedHistory}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="time" />
              <YAxis domain={['auto', 'auto']} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Line type="monotone" dataKey="speed" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
