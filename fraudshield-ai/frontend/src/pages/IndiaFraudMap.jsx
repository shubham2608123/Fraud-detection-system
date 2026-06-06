import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import L from 'leaflet';

const CITY_COORDS = {
  'Mumbai': [19.076, 72.8777],
  'Delhi': [28.7041, 77.1025],
  'Bangalore': [12.9716, 77.5946],
  'Hyderabad': [17.385, 78.4867],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
  'Kanpur': [26.4499, 80.3319],
  'Nagpur': [21.1458, 79.0882],
  'Indore': [22.7196, 75.8577],
  'Thane': [19.2183, 72.9781],
  'Bhopal': [23.2599, 77.4126],
  'Patna': [25.6093, 85.1376],
  'Vadodara': [22.3072, 73.1812],
  'Surat': [21.1702, 72.8311],
  'Rajkot': [22.3039, 70.8022],
  'Coimbatore': [11.0168, 76.9558],
};

const createIcon = (color, size = 12) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [size, size],
  iconAnchor: [size / 2, size / 2],
});

export default function IndiaFraudMap() {
  const { data } = useApp();
  const [selectedCities, setSelectedCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const routes = useMemo(() => {
    if (!data?.routes) return [];
    return data.routes.filter(r => CITY_COORDS[r.source_city] && CITY_COORDS[r.destination_city]);
  }, [data]);

  const cityRisk = useMemo(() => {
    if (!data?.predictions) return {};
    const risk = {};
    data.predictions.forEach(p => {
      if (p.city) {
        if (!risk[p.city]) risk[p.city] = { total: 0, high: 0 };
        risk[p.city].total++;
        if (p.risk_score > 80) risk[p.city].high++;
      }
    });
    return risk;
  }, [data]);

  const activeCities = useMemo(() => {
    return Object.entries(cityRisk)
      .filter(([city]) => CITY_COORDS[city])
      .map(([city, risk]) => ({ city, ...risk }))
      .sort((a, b) => b.high - a.high);
  }, [cityRisk]);

  const filteredCities = useMemo(() => {
    if (!searchTerm) return activeCities;
    return activeCities.filter(c =>
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeCities, searchTerm]);

  const showAll = selectedCities.length === 0;

  const filteredRoutes = useMemo(() => {
    if (showAll) return routes;
    return routes.filter(r =>
      selectedCities.includes(r.source_city) || selectedCities.includes(r.destination_city)
    );
  }, [routes, selectedCities, showAll]);

  const filteredMarkers = useMemo(() => {
    if (showAll) {
      return activeCities.map(({ city }) => ({
        city,
        coords: CITY_COORDS[city],
        isHighRisk: cityRisk[city]?.high > 0,
        count: cityRisk[city]?.total || 0,
        highCount: cityRisk[city]?.high || 0,
      }));
    }
    return activeCities
      .filter(c => selectedCities.includes(c.city))
      .map(({ city }) => ({
        city,
        coords: CITY_COORDS[city],
        isHighRisk: cityRisk[city]?.high > 0,
        count: cityRisk[city]?.total || 0,
        highCount: cityRisk[city]?.high || 0,
      }));
  }, [activeCities, selectedCities, showAll, cityRisk]);

  const toggleCity = (city) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const toggleAll = () => {
    setSelectedCities([]);
  };

  if (!data) {
    return (
      <EmptyState
        title="No Map Data"
        message="Upload a transaction file to visualize fraud patterns across India on an interactive map."
        actionText="Upload Transactions"
        actionPath="/upload"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mule Account Connections</h1>
        <p className="text-sm text-gray-400 mt-1">Filter connections by city to focus on specific regions</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search or select city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${showAll ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={toggleAll}
                className="sr-only"
              />
              All Cities
            </label>
            {filteredCities.map(({ city, high }) => (
              <label
                key={city}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  selectedCities.includes(city)
                    ? high > 0
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCities.includes(city)}
                  onChange={() => toggleCity(city)}
                  className="sr-only"
                />
                {city}
                {high > 0 && (
                  <span className={`ml-0.5 text-[10px] ${selectedCities.includes(city) ? 'text-red-200' : 'text-red-500'}`}>
                    {high}
                  </span>
                )}
              </label>
            ))}
          </div>

          {!showAll && (
            <p className="text-xs text-gray-400">
              Showing connections for: <span className="font-medium text-gray-600">{selectedCities.join(', ')}</span>
            </p>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            style={{ height: '480px' }}
          >
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />

              {filteredMarkers.map((m, i) => (
                <Marker
                  key={i}
                  position={m.coords}
                  icon={createIcon(m.isHighRisk ? '#ef4444' : '#3b82f6', m.isHighRisk ? 16 : 12)}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-sm">{m.city}</p>
                      <p>Total accounts: {m.count}</p>
                      <p>High risk: {m.highCount}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {filteredRoutes.map((route, i) => {
                const src = CITY_COORDS[route.source_city];
                const dst = CITY_COORDS[route.destination_city];
                if (!src || !dst) return null;

                const color = route.risk_level === 'high' ? '#ef4444' :
                  route.risk_level === 'medium' ? '#f59e0b' : '#3b82f6';

                const isSelected = showAll || selectedCities.includes(route.source_city) || selectedCities.includes(route.destination_city);

                return (
                  <Polyline
                    key={i}
                    positions={[src, dst]}
                    pathOptions={{
                      color,
                      weight: isSelected ? Math.max(2, Math.min(route.count, 4)) : 1.5,
                      opacity: isSelected ? 0.85 : 0.3,
                      dashArray: route.risk_level === 'high' ? '6, 4' : undefined,
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <p className="font-bold">{route.source_city} → {route.destination_city}</p>
                        <p>Transactions: {route.count}</p>
                        <p>Suspicious: {route.suspicious_count}</p>
                        <p>Risk: {route.risk_level}</p>
                      </div>
                    </Popup>
                  </Polyline>
                );
              })}
            </MapContainer>
          </motion.div>
        </div>

        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Route Legend</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-amber-500 rounded"></div>
                <span className="text-gray-600">Suspicious</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-0 border-t-2 border-dashed border-red-500"></div>
                <span className="text-gray-600">High Risk</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Routes shown</span>
                <span className="font-semibold text-gray-800">{filteredRoutes.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Cities shown</span>
                <span className="font-semibold text-gray-800">{filteredMarkers.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">High risk</span>
                <span className="font-semibold text-red-600">{filteredRoutes.filter(r => r.risk_level === 'high').length}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Top Risk Cities</h3>
            <div className="space-y-2">
              {activeCities
                .filter(c => c.high > 0)
                .slice(0, 6)
                .map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{c.city}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-semibold">
                      {c.high}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
