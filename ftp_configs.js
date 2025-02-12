
import {apiFtp} from './api.js';
const ftpList = document.getElementById('ftp-list');
const ftpListDropdown = document.getElementById('ftp-list-dropdown');
const selectedFtpDiv = document.getElementById('selected-ftp'); 

const selectedFtpServers = new Set(); // Store selected FTP servers

// Function to update the selected FTP display
function updateSelectedFtp() {
    if (selectedFtpServers.size > 0) {
        let badges = Array.from(selectedFtpServers).map(ftpConfig => {
            const parsedFtpConfig = JSON.parse(ftpConfig);

            return `<span class="badge bg-primary me-1">${parsedFtpConfig.ftp_server}-${parsedFtpConfig.remote_directory}</span>`;
        }); 

        selectedFtpDiv.innerHTML = badges.join(' ');
    } else {
        selectedFtpDiv.innerHTML = '<span class="text-muted">No FTP server selected</span>';
    }
}

// Function to handle checkbox clicks
function handleCheckboxChange(event) { 
    const checkbox = event.target;
    const id = checkbox.getAttribute("data-id"); // Use data-id for ID
    
    // Get the ftp_server and remote_directory values for the selected FTP
    const server = ftpListDropdown.querySelector(`[data-id="${id}"]`);
    const ftp_server = server ? server.value : 'Unknown';
    const remote_directory = server ? server.getAttribute('data-remote-directory') : 'Unknown';

    // Create an object with ftp_server and remote_directory
    const ftpConfig = {id, ftp_server, remote_directory };

    // Add the object to the set if checked, remove it if unchecked
    if (checkbox.checked) {
        selectedFtpServers.add(JSON.stringify(ftpConfig)); // Store as a stringified object
    } else {
        selectedFtpServers.delete(JSON.stringify(ftpConfig));
    }

    updateSelectedFtp();
}

// Function to fetch FTP servers and populate the dropdown with checkboxes
async function fetchFtpServersDropdown() {  
    try {
        const response = await fetch(apiFtp);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const ftpServers = await response.json();
        ftpListDropdown.innerHTML = ''; // Clear existing list before adding new items

        ftpServers.forEach((ftpServer) => {
            const listItem = document.createElement('li');
            listItem.className = 'ftp-item';

            // Check if the server is already selected
            const isChecked = Array.from(selectedFtpServers).some(config => {
                const { ftp_server, remote_directory } = JSON.parse(config);
                return ftp_server === ftpServer.ftp_server && remote_directory === ftpServer.remote_directory;
            }) ? 'checked' : '';

            listItem.innerHTML = `
                <label class="ftp-label">
                    <input type="checkbox" class="ftp-option" value="${ftpServer.ftp_server}" 
                        data-id="${ftpServer.id}" data-remote-directory="${ftpServer.remote_directory}" 
                        ${isChecked}>
                    ${ftpServer.ftp_server || 'Unnamed Server'} - ${ftpServer.remote_directory || 'Unknown Directory'}
                </label>
            `;

            ftpListDropdown.appendChild(listItem);
        });

        // Attach event listener for each checkbox
        document.querySelectorAll('.ftp-option').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
    } catch (error) {
        console.error('Error fetching FTP servers:', error);
    }
}

// Re-fetch FTP list when opening the dropdown
document.getElementById('ftpDropdown').addEventListener('click', fetchFtpServersDropdown);


// Function to fetch FTP servers from the backend
export async function fetchFtpServers() {
    try {
        const response = await fetch(apiFtp);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const ftpServers = await response.json();
        ftpList.innerHTML = '';  // Clear the list before adding new items

        ftpServers.forEach((ftpServer) => {
            const card = document.createElement('li');
            card.className = 'list-group-item d-flex justify-content-between align-items-center';
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div>
                    <h5>${ftpServer.ftp_server || 'No Server Name'}</h5>
                    <p class="mb-1">${ftpServer.remote_directory || 'No Directory'}</p>
                </div>
            `;

            ftpList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching FTP servers:', error);
    }
} 


