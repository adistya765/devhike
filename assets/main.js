// Global variables for tracking simulation
let timerInterval;
let startTime;
let isTracking = false;
let totalTime = 0; // in seconds
let totalDistance = 0; // in km
let currentElevation = 0; // in meters, dummy
let mapInstance; // To store Leaflet map instance

// Function to set active state for bottom navigation items
function setActiveNavItem() {
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.bottom-nav-item');

    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        // Check if the current path ends with the href of the nav item
        // Handle cases where path might be just '/' for index.html
        if (path.endsWith(href) || (path === '/' && href === 'index.html')) {
            item.classList.add('active');
        }
    });
}

// --- Loading Overlay Functions ---
// Function to show the loading overlay
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        // Add a class to disable transition briefly for instant hide/show
        loadingOverlay.classList.remove('no-transition');
        loadingOverlay.classList.add('show');
    }
}

// Function to hide the loading overlay
function hideLoading(instant = false) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        if (instant) {
            loadingOverlay.classList.add('no-transition'); // Apply class to disable transition
        }
        loadingOverlay.classList.remove('show');
        // Remove no-transition class after a short delay to re-enable transitions for next time
        if (instant) {
            setTimeout(() => {
                loadingOverlay.classList.remove('no-transition');
            }, 50); // Small delay to ensure class is applied before removal
        }
    }
}

// Handle browser back/forward navigation (bfcache)
// The 'pageshow' event fires when a page is loaded from the bfcache.
// If event.persisted is true, it means the page was retrieved instantly from cache
// (e.g., via back/forward button), so we should hide the loading overlay immediately.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // Page was restored from bfcache, hide loading overlay instantly
        hideLoading(true); // Pass true for instant hide
    } else {
        // For fresh page loads (not from bfcache), show loading initially
        showLoading();
    }
});

// Hide loading overlay once all page content (including images, etc.) has fully loaded
window.addEventListener('load', () => {
    hideLoading(); // Hide with transition for normal loads
});


// --- Leaflet Map & Tracking Logic (for maps.html) ---
function initializeMap() {
    if (document.getElementById('mapid') && !mapInstance) { // Only initialize if mapid exists and map not yet initialized
        mapInstance = L.map('mapid').setView([-7.7956, 110.3695], 13); // Dummy coordinates for Yogyakarta

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Add a dummy marker
        L.marker([-7.7956, 110.3695]).addTo(mapInstance)
            .bindPopup('Posisi Anda')
            .openPopup();

        // Invalidate map size to ensure it renders correctly after being displayed
        setTimeout(() => {
            mapInstance.invalidateSize();
        }, 100);
    } else if (mapInstance) {
        mapInstance.invalidateSize(); // Ensure map resizes if already initialized
    }
}

function startTracking() {
    if (isTracking) return;
    isTracking = true;
    startTime = Date.now() - (totalTime * 1000); // Resume from last time if paused

    document.getElementById('start-tracking-btn').classList.add('d-none');
    document.getElementById('pause-tracking-btn').classList.remove('d-none');
    document.getElementById('stop-tracking-btn').classList.remove('d-none');

    timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        totalTime = elapsedSeconds;
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;

        document.getElementById('time-display').textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Simulate distance and elevation gain
        totalDistance += 0.001; // Add 1 meter every second
        currentElevation += 0.1; // Add 0.1 meter every second
        document.getElementById('distance-display').textContent = `${totalDistance.toFixed(2)} KM`;
        document.getElementById('elevation-display').textContent = `${currentElevation.toFixed(0)} M`;

    }, 1000);
    console.log('Tracking dimulai!');
}

function pauseTracking() {
    if (!isTracking) return;
    isTracking = false;
    clearInterval(timerInterval);

    document.getElementById('start-tracking-btn').classList.remove('d-none');
    document.getElementById('pause-tracking-btn').classList.add('d-none');
    console.log('Tracking dijeda.');
}

function stopTracking() {
    if (!isTracking && totalTime === 0) return; // Don't stop if not started
    isTracking = false;
    clearInterval(timerInterval);

    // For demo, reset data. In real app, save to history.
    document.getElementById('time-display').textContent = '00:00:00';
    document.getElementById('distance-display').textContent = '0.00 KM';
    document.getElementById('elevation-display').textContent = '0 M';
    totalTime = 0;
    totalDistance = 0;
    currentElevation = 0;

    document.getElementById('start-tracking-btn').classList.remove('d-none');
    document.getElementById('pause-tracking-btn').classList.add('d-none');
    document.getElementById('stop-tracking-btn').classList.add('d-none');

    alert('Tracking selesai! Data disimpan ke riwayat (simulasi).');
    console.log('Tracking selesai. Data disimpan ke log (simulasi).');
    window.location.href = 'riwayat.html'; // Navigate to history page
}

// --- Wishlist Logic (for wishlist.html) ---
function removeWishlistItem(buttonElement) {
    const item = buttonElement.closest('.wishlist-item');
    if (item && confirm('Yakin ingin menghapus gunung ini dari wishlist?')) {
        item.remove();
        alert('Gunung dihapus dari wishlist.');
    }
}

// --- Edit Account Logic (for edit-akun.html) ---
function saveProfileChanges() {
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    // For photo, you'd handle file upload here
    alert(`Perubahan profil disimpan!\nNama: ${name}\nEmail: ${email}`);
    window.location.href = 'akun.html'; // Navigate back to profile page
}

// --- Checklist Logic (for checklist.html) ---
function addChecklistItem() {
    const newItemInput = document.getElementById('new-checklist-item');
    const newItemText = newItemInput.value.trim();

    if (newItemText) {
        const checklistItemsContainer = document.getElementById('checklist-items');
        const uniqueId = 'item' + Date.now(); // Unique ID for each item

        const newItemHtml = `
            <div class="checklist-item">
                <input type="checkbox" id="${uniqueId}">
                <label for="${uniqueId}">${newItemText}</label>
            </div>
        `;
        checklistItemsContainer.insertAdjacentHTML('beforeend', newItemHtml);
        newItemInput.value = ''; // Clear the input field
    } else {
        alert('Mohon masukkan nama item checklist.');
    }
}


// --- Global DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', () => {
    setActiveNavItem(); // Set active nav item on page load

    // Specific initializations for maps.html
    if (document.getElementById('maps-page')) {
        initializeMap();
        // Set initial button states for maps.html
        document.getElementById('start-tracking-btn').classList.remove('d-none');
        document.getElementById('pause-tracking-btn').classList.add('d-none');
        document.getElementById('stop-tracking-btn').classList.add('d-none');
    }

    // Initial hide for pages that aren't navigated to via intercepted links
    // This handles the very first load or direct URL access.
    // For bfcache, pageshow handles it.
    if (!window.performance || window.performance.navigation.type !== window.performance.navigation.TYPE_BACK_FORWARD) {
         hideLoading(); // Hide with transition for normal loads
    }
});

// --- Intercept all link clicks to show loading animation ---
document.addEventListener('click', (event) => {
    // Check if the clicked element or its parent is an anchor tag
    let targetElement = event.target;
    while (targetElement && targetElement.tagName !== 'A') {
        targetElement = targetElement.parentElement;
    }

    if (targetElement && targetElement.href && !targetElement.href.startsWith('#')) {
        // Prevent default navigation for internal links
        event.preventDefault();

        // Show loading animation
        showLoading();

        // Navigate after a short delay to allow animation to show
        setTimeout(() => {
            window.location.href = targetElement.href;
        }, 300); // Adjust delay as needed (e.g., 300ms)
    }
});
