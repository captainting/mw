const HKT = 'Asia/Hong_Kong';
const piers = {
  muiWo: { nameZh: '梅窩', nameEn: 'Mui Wo', lat: 22.2647, lon: 114.0017 },
  central: { nameZh: '中環', nameEn: 'Central', lat: 22.2869, lon: 114.1610 }
};

const timetable = {
  weekday: {
    centralToMuiWo: [
      '03:00','06:10','06:50','07:10','07:40','08:30','09:00','09:50','10:30','11:10','11:50',
      '12:30','13:10','13:50','14:30','15:00','15:10','15:50','16:30','17:20','17:40','18:00',
      '18:30','19:00','19:30','20:00','20:35','21:20','22:00','22:45','23:30','24:30'
    ],
    muiWoToCentral: [
      '03:40','05:55','06:20','06:30','07:00','07:10','07:20','07:50','08:05','08:30','08:45',
      '09:40','10:00','10:40','11:30','12:10','12:50','13:30','14:10','14:50','15:30','16:10',
      '16:50','17:30','18:10','18:40','19:30','20:30','21:30','22:40','23:30'
    ]
  },
  holiday: {
    centralToMuiWo: [
      '03:00','07:00','08:00','08:30','09:00','09:40','10:20','11:00','12:00','13:00','13:40',
      '14:20','15:00','15:40','16:20','17:00','17:40','18:20','19:00','19:40','20:20','21:00',
      '21:40','22:20','23:00','23:40','24:30'
    ],
    muiWoToCentral: [
      '03:40','06:20','06:30','07:05','08:00','08:40','09:20','10:00','10:40','11:20','12:00',
      '12:40','13:20','14:00','14:40','15:20','16:00','16:40','17:20','18:00','18:40','19:20',
      '20:00','20:40','21:20','22:00','22:50','23:30'
    ]
  }
};

const labels = {
  zh: {
    useLocation: '📍 使用我的位置', smartTitle: '按定位，顯示你應該看的方向',
    smartText: '點擊下面按鈕，網站會判斷你較接近梅窩碼頭還是中環碼頭。',
    checking: '正在取得位置…', denied: '未能取得位置。請允許瀏覽器定位，或手動選擇方向。',
    closer: p => `你較接近${p}`, openFrom: p => `下一班由${p}開出`,
    to: p => `前往${p}`, minutes: m => m < 60 ? `${m} 分鐘` : `${Math.floor(m/60)}小時 ${m%60}分鐘`,
    tomorrow: '明天', fast: '* 快船', last: '尾班', weekday: '星期一至六', holiday: '星期日及假日'
  },
  en: {
    useLocation: '📍 Use my location', smartTitle: 'Use location to choose the correct direction',
    smartText: 'Tap the button and the site will check whether you are closer to Mui Wo Pier or Central Pier.',
    checking: 'Checking location…', denied: 'Location unavailable. Please allow browser location, or choose direction manually.',
    closer: p => `You are closer to ${p}`, openFrom: p => `Next ferry from ${p}`,
    to: p => `To ${p}`, minutes: m => m < 60 ? `${m} min` : `${Math.floor(m/60)} hr ${m%60} min`,
    tomorrow: 'Tomorrow', fast: '* Fast ferry', last: 'Last ferry', weekday: 'Mon-Sat', holiday: 'Sun & holidays'
  }
};

let lang = 'zh';
let scheduleType = new Intl.DateTimeFormat('en-GB', { timeZone: HKT, weekday: 'short' }).format(new Date()) === 'Sun' ? 'holiday' : 'weekday';
let selectedDirection = 'centralToMuiWo';

const $ = id => document.getElementById(id);

function nowHkt() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: HKT, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).formatToParts(new Date()).reduce((a, p) => (a[p.type] = p.value, a), {});
  return new Date(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}+08:00`);
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(t) {
  const [h, m] = t.split(':').map(Number);
  return `${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getNext(direction, type = scheduleType, count = 2) {
  const now = nowHkt();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const rows = [];
  timetable[type][direction].forEach(t => {
    const mins = timeToMinutes(t);
    const adjusted = mins >= currentMinutes ? mins : mins + 1440;
    rows.push({ time: t, wait: adjusted - currentMinutes, tomorrow: adjusted >= 1440 });
  });
  return rows.sort((a, b) => a.wait - b.wait).slice(0, count);
}

function directionNames(direction) {
  if (direction === 'centralToMuiWo') {
    return lang === 'zh' ? { from: '中環', to: '梅窩' } : { from: 'Central', to: 'Mui Wo' };
  }
  return lang === 'zh' ? { from: '梅窩', to: '中環' } : { from: 'Mui Wo', to: 'Central' };
}

function renderList(direction, targetId) {
  const next = getNext(direction, scheduleType, 2);
  const l = labels[lang];
  $(targetId).innerHTML = next.map((item, i) => `
    <div class="time-row">
      <div>
        <div class="time-main">${formatTime(item.time)}</div>
        <div class="time-sub">${l.minutes(item.wait)}</div>
        ${item.tomorrow ? `<div class="tomorrow">🗓 ${l.tomorrow}</div>` : ''}
      </div>
      <div class="badges">
        <span class="badge fast">${l.fast}</span>
        ${i === next.length - 1 && item.time.includes('23:30') ? `<span class="badge last">${l.last}</span>` : ''}
      </div>
    </div>`).join('');
}

function renderRecommendation(direction) {
  selectedDirection = direction;
  const names = directionNames(direction);
  const next = getNext(direction, scheduleType, 1)[0];
  const l = labels[lang];
  $('recommendation').classList.remove('hidden');
  $('recommendTitle').textContent = l.openFrom(names.from);
  $('recommendTime').textContent = formatTime(next.time);
  $('recommendMeta').textContent = `${l.to(names.to)} · ${l.minutes(next.wait)}${next.tomorrow ? ' · ' + l.tomorrow : ''}`;
  updateActiveCards();
}

function updateActiveCards() {
  document.querySelectorAll('.route-choice').forEach(btn => btn.classList.toggle('active', btn.dataset.direction === selectedDirection));
  $('centralCard').classList.toggle('active-card', selectedDirection === 'centralToMuiWo');
  $('muiWoCard').classList.toggle('active-card', selectedDirection === 'muiWoToCentral');
}

function haversineKm(a, b) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

function locate() {
  const l = labels[lang];
  $('locationStatus').textContent = l.checking;
  if (!navigator.geolocation) {
    $('locationStatus').textContent = l.denied;
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const user = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    const dMuiWo = haversineKm(user, piers.muiWo);
    const dCentral = haversineKm(user, piers.central);
    const closerToMuiWo = dMuiWo < dCentral;
    const pierName = closerToMuiWo ? (lang === 'zh' ? '梅窩碼頭' : 'Mui Wo Pier') : (lang === 'zh' ? '中環碼頭' : 'Central Pier');
    const direction = closerToMuiWo ? 'muiWoToCentral' : 'centralToMuiWo';
    $('locationStatus').textContent = `${l.closer(pierName)} · Mui Wo ${dMuiWo.toFixed(1)} km · Central ${dCentral.toFixed(1)} km`;
    renderRecommendation(direction);
  }, () => {
    $('locationStatus').textContent = l.denied;
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}

function renderAll() {
  const l = labels[lang];
  $('locateBtn').textContent = l.useLocation;
  $('smartTitle').textContent = l.smartTitle;
  $('smartText').textContent = l.smartText;
  $('weekdayBtn').textContent = l.weekday;
  $('holidayBtn').textContent = l.holiday;
  document.querySelectorAll('[data-zh]').forEach(el => el.textContent = el.dataset[lang]);
  document.querySelectorAll('.tab').forEach(btn => btn.classList.toggle('active', btn.dataset.type === scheduleType));
  renderList('centralToMuiWo', 'centralList');
  renderList('muiWoToCentral', 'muiWoList');
  if (!$('recommendation').classList.contains('hidden')) renderRecommendation(selectedDirection);
  updateActiveCards();
}

function tick() {
  const d = nowHkt();
  $('clock').textContent = d.toLocaleTimeString('en-GB', { hour12: false });
  const date = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-HK' : 'en-HK', { timeZone: HKT, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
  $('dateLine').textContent = `${date} HKT`;
}

$('locateBtn').addEventListener('click', locate);
$('langBtn').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; $('langBtn').textContent = lang === 'zh' ? 'EN' : '中'; renderAll(); tick(); });
document.querySelectorAll('.tab').forEach(btn => btn.addEventListener('click', () => { scheduleType = btn.dataset.type; renderAll(); }));
document.querySelectorAll('.route-choice').forEach(btn => btn.addEventListener('click', () => renderRecommendation(btn.dataset.direction)));

renderAll();
tick();
setInterval(() => { tick(); renderAll(); }, 1000);
