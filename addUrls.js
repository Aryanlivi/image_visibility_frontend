import { apiUrl } from "./api.js";
const addUrlForm = document.getElementById('add-url-form');

// Function to add a new URL
async function addUrl(event) {
    event.preventDefault(); // Prevent form submission
    const urlInput = document.getElementById('url-input');
    const nameInput = document.getElementById('name'); 
    const captureIntervalInput = document.getElementById('capture_interval');
    const activeInput=document.getElementById('active');
    const deviceIdInput = document.getElementById('device_id');
    const deviceCodeInput = document.getElementById('devicecode');
    const albumCodeInput = document.getElementById('album_code');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');
    const altitudeInput = document.getElementById('altitude');
    const imageOwnerInput = document.getElementById('imageowner');
    const angleInput = document.getElementById('angle');
    
    const url = urlInput.value.trim();
    const name = nameInput.value.trim();
    const captureInterval = parseInt(captureIntervalInput.value.trim());
    const active=activeInput.value;
    const deviceId = parseInt(deviceIdInput.value.trim());
    const deviceCode = deviceCodeInput.value.trim();
    const albumCode = albumCodeInput.value.trim();
    const latitude = parseFloat(latitudeInput.value.trim());
    const longitude = parseFloat(longitudeInput.value.trim());
    const altitude = parseFloat(altitudeInput.value.trim());
    const imageOwner = imageOwnerInput.value.trim();
    const angle = parseFloat(angleInput.value.trim());

    // Validate the URL input
    if (!url) {
        alert('Please enter a valid YouTube URL.');
        return;
    }

    // Validate other required fields
    if (!name || !captureInterval || !deviceId || !deviceCode || !albumCode || isNaN(latitude) || isNaN(longitude) || isNaN(altitude) || !imageOwner || isNaN(angle)) {
        alert('Please fill out all fields correctly.');
        return;
    }
    console.log(selectedFtpServers)
   // Convert selectedFtpServers to an array of objects
    const selectedFtpArray = Array.from(selectedFtpServers).map(ftpString => {
        // Parse the string into an object
        return JSON.parse(ftpString);
    }); 
    if (selectedFtpArray.length === 0) {
        alert('Please select at least one FTP server.');
        return;
    }
    console.log(selectedFtpArray)
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {  
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                name,
                capture_interval: captureInterval,
                active:active,
                image_metadata: {
                    device_id: deviceId,
                    devicecode: deviceCode,
                    album_code: albumCode,
                    latitude: latitude,
                    longitude: longitude,
                    altitude: altitude,
                    imageowner: imageOwner,
                    angle: angle                                 
                },
                ftp_configs: selectedFtpArray // Include selected FTP servers
            }),
        });

        if (!response.ok) throw new Error('Failed to add URL.');
        alert('URL added successfully!');
        urlInput.value = ''; // Clear the input field
        nameInput.value = '';
        captureIntervalInput.value = '';
        deviceIdInput.value = '';
        deviceCodeInput.value = '';
        albumCodeInput.value = '';
        latitudeInput.value = '';
        longitudeInput.value = '';
        altitudeInput.value = '';
        imageOwnerInput.value = '';
        angleInput.value = '';
        selectedFtpServers.clear(); // Clear selected FTPs after submission
        updateSelectedFtp(); // Refresh selected FTP UI
        fetchUrls(); // Refresh the list
        fetchFtpServers(); // Refresh the FTP list
    } catch (error) {
        console.error(error);
        alert('Error adding URL: ' + error.message);
    }
}

addUrlForm.addEventListener('submit', addUrl);

