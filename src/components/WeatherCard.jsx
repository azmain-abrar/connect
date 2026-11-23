import { useCallback, useEffect, useState } from "react";
import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain,
  CloudSnow, CloudSun, Droplets, RefreshCw, Sun, Wind, MapPin
} from "lucide-react";

const getWeatherCondition = (code) => {
  if (code === 0) return { label: "Clear sky", Icon: Sun };
  if (code === 1 || code === 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if (code === 45 || code === 48) return { label: "Foggy", Icon: CloudFog };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", Icon: CloudDrizzle };
  if ([61, 63, 65, 66, 67].includes(code)) return { label: "Rain", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", Icon: CloudSnow };
  if ([80, 81, 82].includes(code)) return { label: "Rain showers", Icon: CloudRain };
  if (code >= 95) return { label: "Thunderstorm", Icon: CloudLightning };
  return { label: "Cloudy", Icon: Cloud };
};

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=22.3569&longitude=91.7832&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=Asia%2FDhaka";

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(WEATHER_URL);
      if (!response.ok) throw new Error("Weather service is temporarily unavailable.");
      const result = await response.json();
      if (!result.current) throw new Error("Weather data was not returned.");
      setWeather(result.current);
    } catch (err) {
      setError(err.message || "Unable to load weather data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
    const intervalId = window.setInterval(fetchWeather, 15 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Loading live weather…</p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-[#102653]">Chattogram Weather</h2>
            <p className="mt-1 text-sm text-red-600">{error || "Weather data unavailable."}</p>
          </div>
          <button type="button" onClick={fetchWeather} className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100" aria-label="Retry weather loading">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    );
  }

  const { label, Icon } = getWeatherCondition(weather.weather_code);
  const updatedAt = new Date(weather.time).toLocaleTimeString("en-BD", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dhaka"
  });

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#102653] via-[#17427f] to-[#397ac4] p-5 text-white shadow-sm" aria-label="Live weather">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin size={18} /> Chattogram Weather</h2>
          <p className="mt-1 text-xs text-blue-100">Live weather · Open-Meteo</p>
        </div>
        <button type="button" onClick={fetchWeather} className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20" aria-label="Refresh weather">
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="my-5 flex items-center gap-4">
        <Icon size={58} strokeWidth={1.5} className="shrink-0 text-blue-100" />
        <div>
          <p className="text-4xl font-extrabold">{Math.round(weather.temperature_2m)}°C</p>
          <p className="mt-1 text-sm text-blue-100">{label}</p>
          <p className="mt-1 text-xs text-blue-200">Feels like {Math.round(weather.apparent_temperature)}°C</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-white/10 p-3">
          <Droplets size={19} />
          <p className="mt-2 text-xs text-blue-100">Humidity</p>
          <p className="font-bold">{weather.relative_humidity_2m}%</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <Wind size={19} />
          <p className="mt-2 text-xs text-blue-100">Wind speed</p>
          <p className="font-bold">{weather.wind_speed_10m} km/h</p>
        </div>
        <div className="col-span-2 rounded-xl bg-white/10 p-3 sm:col-span-1">
          <CloudSun size={19} />
          <p className="mt-2 text-xs text-blue-100">Condition</p>
          <p className="font-bold">{label}</p>
        </div>
      </div>

      <p className="mt-4 text-right text-xs text-blue-200">Updated at {updatedAt}</p>
    </section>
  );
}
