// Initialize AOS animations
AOS.init({
  duration: 1000,
  once: true
});

// Smooth scroll (optional)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Get bundle info from URL
const urlParams = new URLSearchParams(window.location.search);
const bundle = urlParams.get("bundle");
const price = urlParams.get("price");

const bundleInfoDiv = document.getElementById("bundleInfo");
if (bundleInfoDiv) {
  bundleInfoDiv.innerHTML = `<p><strong>Selected Bundle:</strong> ${bundle}</p>
                             <p><strong>Price:</strong> GH₵${price}</p>`;
}

// ✅ FIREBASE CONFIG (define once on window to avoid duplicate-declaration errors)
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

// Initialize Firebase (v8-style) if the SDK is present
let db; // will remain undefined on pages that don't include Firebase SDK
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(window.firebaseConfig);
  }
  if (typeof firebase.firestore === 'function') {
    db = firebase.firestore();
  }
}

// ✅ Paystack + Firestore Integration
function payWithPaystack() {
  let phone = document.getElementById("phone").value;
  if (!phone) {
    alert("Please enter your phone number");
    return;
  }

  let handler = PaystackPop.setup({
    key: "pk_test_4e01d4e633c2913adc530e74628c9a5350929918",
    email: "testuser@gmail.com", // Paystack requires an email
    amount: price * 100, // Convert to pesewas
    currency: "GHS",
    metadata: {
      custom_fields: [
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: phone
        },
        {
          display_name: "Bundle",
          variable_name: "bundle",
          value: bundle
        }
      ]
    },
    callback: function(response) {
      // ✅ Save Order in Firestore (if available), otherwise just redirect
      if (db) {
        db.collection("orders").add({
          phone: phone,
          bundle: bundle,
          price: parseFloat(price),
          status: "pending",
          reference: response.reference,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          window.location.href = "success.html?ref=" + response.reference;
        })
        .catch(err => {
          console.error("Error saving order:", err);
          alert("Payment succeeded but order not saved to database.");
        });
      } else {
        // No Firestore available on this page; just redirect to success
        window.location.href = "success.html?ref=" + response.reference;
      }
    },
    onClose: function() {
      alert("Transaction cancelled");
    }
  });
  handler.openIframe();
}

// Responsive nav toggle for mobile
document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.querySelector('.navbar');
  if (!menuToggle || !navbar) return;

  menuToggle.addEventListener('click', function () {
    const isOpen = navbar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});
