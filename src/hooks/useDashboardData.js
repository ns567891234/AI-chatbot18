import { useState, useEffect, useRef } from 'react';
import { fetchISSLocation, fetchAstronauts, calculateSpeed, reverseGeocode } from '../services/issService';
import { fetchNews } from '../services/newsService';

export function useDashboardData() {
  const [issData, setIssData] = useState({
    lat: 0,
    lng: 0,
    speed: 0,
    locationName: "Loading...",
    astronauts: 0,
    astronautNames: [],
    path: [],
    speedHistory: [] // { time, speed }
  });
  
  const [newsData, setNewsData] = useState([]);
  const [newsCategory, setNewsCategory] = useState('general');
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);

  const prevPosRef = useRef(null);

  const updateISS = async () => {
    const loc = await fetchISSLocation();
    if (loc) {
      let speed = 0;
      if (prevPosRef.current) {
        const timeDiff = (loc.timestamp - prevPosRef.current.timestamp);
        speed = calculateSpeed(prevPosRef.current, loc, timeDiff);
      }
      prevPosRef.current = loc;

      const locName = await reverseGeocode(loc.lat, loc.lng);
      
      const timeLabel = new Date(loc.timestamp * 1000).toLocaleTimeString();

      setIssData(prev => {
        const newPath = [...prev.path, [loc.lat, loc.lng]].slice(-15);
        const newSpeedHistory = speed > 0 ? [...prev.speedHistory, { time: timeLabel, speed }].slice(-30) : prev.speedHistory;
        
        return {
          ...prev,
          lat: loc.lat,
          lng: loc.lng,
          speed: speed > 0 ? speed.toFixed(2) : prev.speed,
          locationName: locName,
          path: newPath,
          speedHistory: newSpeedHistory
        };
      });
    }
  };

  const loadAstronauts = async () => {
    const astros = await fetchAstronauts();
    if (astros) {
      setIssData(prev => ({
        ...prev,
        astronauts: astros.total,
        astronautNames: astros.people.map(p => p.name)
      }));
    }
  };

  const loadNews = async (category = newsCategory) => {
    setIsNewsLoading(true);
    setNewsError(null);
    try {
      const articles = await fetchNews(category);
      setNewsData(articles || []);
      setNewsCategory(category);
    } catch (err) {
      setNewsError(err.message);
    } finally {
      setIsNewsLoading(false);
    }
  };

  useEffect(() => {
    updateISS();
    loadAstronauts();
    loadNews();

    const issInterval = setInterval(updateISS, 15000);
    return () => clearInterval(issInterval);
  }, []);

  return {
    issData,
    refreshISS: updateISS,
    newsData,
    newsCategory,
    isNewsLoading,
    newsError,
    loadNews
  };
}
