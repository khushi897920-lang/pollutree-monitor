import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

export default function MapLegend() {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const legend = L.control({ position: 'bottomleft' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = `
        <div style="
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 16px;
          border-radius: 12px;
          color: #f1f5f9;
          font-family: inherit;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          min-width: 200px;
        ">
          <h4 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #fff;">AQI LEGEND</h4>
          <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13px; font-weight: 400;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 14px; height: 14px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); display: inline-block;"></span>
              <span>0-50 (Good)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 14px; height: 14px; border-radius: 50%; background: #fbbf24; box-shadow: 0 0 10px rgba(251, 191, 36, 0.4); display: inline-block;"></span>
              <span>51-100 (Moderate)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 14px; height: 14px; border-radius: 50%; background: #f97316; box-shadow: 0 0 10px rgba(249, 115, 22, 0.4); display: inline-block;"></span>
              <span>101-200 (Poor)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 14px; height: 14px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4); display: inline-block;"></span>
              <span>201-300 (Unhealthy)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 14px; height: 14px; border-radius: 50%; background: #7f1d1d; box-shadow: 0 0 10px rgba(127, 29, 29, 0.4); display: inline-block;"></span>
              <span>301+ (Hazardous)</span>
            </div>
          </div>
        </div>
      `;
            return div;
        };

        legend.addTo(map);

        return () => {
            legend.remove();
        };
    }, [map]);

    return null;
}
