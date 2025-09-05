// Language switcher for Varadaraja Swamy Temple site
const content = {
  te: '',
  en: ''
};

const locationContent = {
  te: {
    title: '📍 ఆలయ స్థానం మరియు దిశలు',
    openMaps: 'గూగుల్ మ్యాప్స్‌లో తెరవండి',
    address: `<strong>పూర్తి చిరునామా:</strong><br>
శ్రీ వరదరాజ స్వామి ఆలయం, వర్దరాజ్‌పూర్<br>
జగదేవ్‌పూర్ మండలం, సిద్దిపేట జిల్లా<br>
తెలంగాణ రాష్ట్రం, భారతదేశం<br>
<strong>గూగుల్ మ్యాప్ కోడ్:</strong> PQM9+8J`,
    byRoad: {
      title: '🚗 రోడ్డు మార్గం ద్వారా',
      content: `<p><strong>హైదరాబాద్ నుండి:</strong> సుమారు 120 కి.మీ. (2.5 గంటలు)</p>
<p><strong>వరంగల్ నుండి:</strong> సుమారు 45 కి.మీ. (1 గంట)</p>
<p><strong>సిద్దిపేట్ నుండి:</strong> సుమారు 25 కి.మీ. (30 నిమిషాలు)</p>
<p>జగదేవ్‌పూర్ వరకు బస్సులు అందుబాటులో ఉన్నాయి</p>`
    },
    byTrain: {
      title: '🚂 రైలు మార్గం ద్వారా',
      content: `<p><strong>సమీప రైల్వే స్టేషన్:</strong> గజ్వేల్ (20 కి.మీ.)</p>
<p><strong>ప్రధాన రైల్వే స్టేషన్:</strong> సికింద్రాబాద్ (120 కి.మీ.)</p>
<p>రైల్వే స్టేషన్ నుండి బస్సు లేదా టాక్సీ సౌకర్యం</p>`
    },
    byAir: {
      title: '✈️ విమాన మార్గం ద్వారా',
      content: `<p><strong>సమీప విమానాశ్రయం:</strong> రాజీవ్ గాంధీ అంతర్జాతీయ విమానాశ్రయం</p>
<p><strong>దూరం:</strong> సుమారు 130 కి.మీ. (3 గంటలు)</p>
<p>విమానాశ్రయం నుండి టాక్సీ సేవలు అందుబాటులో ఉన్నాయి</p>`
    }
  },
  en: {
    title: '📍 Temple Location & Directions',
    openMaps: 'Open in Google Maps',
    address: `<strong>Complete Address:</strong><br>
Sri Varadaraja Swamy Temple, Vardarajpur<br>
Jagadevpur Mandal, Siddipet District<br>
Telangana State, India<br>
<strong>Google Map Code:</strong> PQM9+8J`,
    byRoad: {
      title: '🚗 By Road',
      content: `<p><strong>From Hyderabad:</strong> Approx. 120 km (2.5 hours)</p>
<p><strong>From Warangal:</strong> Approx. 45 km (1 hour)</p>
<p><strong>From Siddipet:</strong> Approx. 25 km (30 minutes)</p>
<p>Regular buses available to Jagadevpur</p>`
    },
    byTrain: {
      title: '🚂 By Train',
      content: `<p><strong>Nearest Railway Station:</strong> Gajwel (20 km)</p>
<p><strong>Major Railway Station:</strong> Secunderabad (120 km)</p>
<p>Bus and taxi services available from railway station</p>`
    },
    byAir: {
      title: '✈️ By Air',
      content: `<p><strong>Nearest Airport:</strong> Rajiv Gandhi International Airport</p>
<p><strong>Distance:</strong> Approx. 130 km (3 hours)</p>
<p>Taxi services available from airport</p>`
    }
  }
};

// Fetch Telugu and English content from text files
fetch('temple-content-te.txt').then(r => r.text()).then(t => { content.te = t; if (getLang() === 'te') setContent('te'); });
fetch('temple-content-en.txt').then(r => r.text()).then(t => { content.en = t; if (getLang() === 'en') setContent('en'); });

function setContent(lang) {
  document.getElementById('temple-content').innerText = content[lang] || '';
  document.getElementById('btn-te').classList.toggle('active', lang === 'te');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  
  // Update location section
  const loc = locationContent[lang];
  document.getElementById('location-title').innerText = loc.title;
  document.getElementById('address-text').innerHTML = loc.address;
  document.getElementById('open-maps-text').innerText = loc.openMaps;
  document.getElementById('by-road-title').innerText = loc.byRoad.title;
  document.getElementById('by-road-content').innerHTML = loc.byRoad.content;
  document.getElementById('by-train-title').innerText = loc.byTrain.title;
  document.getElementById('by-train-content').innerHTML = loc.byTrain.content;
  document.getElementById('by-air-title').innerText = loc.byAir.title;
  document.getElementById('by-air-content').innerHTML = loc.byAir.content;
  
  localStorage.setItem('templeLang', lang);
}

function getLang() {
  return localStorage.getItem('templeLang') || 'te';
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('btn-te').addEventListener('click', () => setContent('te'));
  document.getElementById('btn-en').addEventListener('click', () => setContent('en'));
  setContent(getLang());
});
