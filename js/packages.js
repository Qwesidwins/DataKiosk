// Firebase config (use shared window.firebaseConfig to avoid redeclaration errors)
if (typeof window.firebaseConfig === 'undefined') {
  window.firebaseConfig = {
    apiKey: "AIzaSyCQQgf1PGElY9nBxOJdgPNKHuJigJaObI8",
    authDomain: "datastore-47bc1.firebaseapp.com",
    projectId: "datastore-47bc1",
    storageBucket: "datastore-47bc1.firebasestorage.app",
    messagingSenderId: "179913186339",
    appId: "1:179913186339:web:2e973acc115edab3aee596"
  };
}

document.addEventListener('DOMContentLoaded', function () {
  // Init Firebase (if SDK is present)
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not found on packages page. Bundles will not load.');
    // show helpful message in each grid
    const elIds = ['mtnBundles', 'airtelBundles', 'telecelBundles'];
    elIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<p style="opacity:0.8">No bundles available (offline).</p>';
    });
    AOS.init();
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  console.log('Firebase initialized on packages page, fetching bundles...');

  // DOM references
  const mtnBundles = document.getElementById("mtnBundles");
  const airtelBundles = document.getElementById("airtelBundles");
  const telecelBundles = document.getElementById("telecelBundles");

  // Local sample bundles fallback (useful for offline/demo)
  function renderSampleBundles() {
    const samples = [
      { network: 'MTN', name: 'MTN 5GB', price: 16 },
      { network: 'AirtelTigo', name: 'AirtelTigo 10GB', price: 48 },
      { network: 'Telecel', name: 'Telecel 2GB', price: 10 }
    ];

    // clear
    if (mtnBundles) mtnBundles.innerHTML = '';
    if (airtelBundles) airtelBundles.innerHTML = '';
    if (telecelBundles) telecelBundles.innerHTML = '';

    samples.forEach(bundle => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <h3>${bundle.name}</h3>
        <p>Valid 30 Days</p>
        <span>GH₵${bundle.price}</span>
        <a href="checkout.html?bundle=${encodeURIComponent(bundle.network + '-' + bundle.name)}&price=${bundle.price}" class="btn">Buy Now</a>
      `;
      if (bundle.network === 'MTN' && mtnBundles) mtnBundles.appendChild(card);
      if (bundle.network === 'AirtelTigo' && airtelBundles) airtelBundles.appendChild(card);
      if (bundle.network === 'Telecel' && telecelBundles) telecelBundles.appendChild(card);
    });
  }

  // Fetch bundles
  db.collection("bundles").onSnapshot(snapshot => {
    // Clear tabs
    if (mtnBundles) mtnBundles.innerHTML = "";
    if (airtelBundles) airtelBundles.innerHTML = "";
    if (telecelBundles) telecelBundles.innerHTML = "";

    if (snapshot.empty) {
      console.info('Bundles collection is empty. Rendering sample bundles.');
      renderSampleBundles();
      return;
    }

    snapshot.forEach(doc => {
      const bundle = doc.data();
      const card = document.createElement("div");
      card.classList.add("card");

      const name = bundle.name || 'Unnamed';
      const price = bundle.price || '0';
      const network = bundle.network || '';

      card.innerHTML = `
        <h3>${name}</h3>
        <p>Valid 30 Days</p>
        <span>GH₵${price}</span>
        <a href="checkout.html?bundle=${encodeURIComponent(network + '-' + name)}&price=${price}" class="btn">Buy Now</a>
      `;

      if (network === "MTN" && mtnBundles) {
        mtnBundles.appendChild(card);
      } else if (network === "AirtelTigo" && airtelBundles) {
        airtelBundles.appendChild(card);
      } else if (network === "Telecel" && telecelBundles) {
        telecelBundles.appendChild(card);
      }
    });
  }, err => {
    console.error('Error listening to bundles collection:', err);
    // show sample bundles so the UI is usable
    renderSampleBundles();
  });

  // Init AOS
  AOS.init();
});
