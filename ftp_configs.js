import { apiFtp } from "./api.js";

const ftpList = document.getElementById('ftp-list');
const ftpListDropdown = document.getElementById('ftp-list-dropdown');
const selectedFtpDiv = document.getElementById('selected-ftp'); 
const addFtpForm = document.getElementById('add-ftp-form');
const searchInput = document.getElementById('ftp-search');
const dropdownSearchInput = document.getElementById('ftp-dropdown-search');
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

// Function to handle checkbox selection
function handleCheckboxChange(event) {
    const checkbox = event.target;
    const ftpConfig = JSON.stringify({
        ftp_server: checkbox.value,
        remote_directory: checkbox.getAttribute('data-remote-directory')
    });
    
    if (checkbox.checked) {
        selectedFtpServers.add(ftpConfig);
    } else {
        selectedFtpServers.delete(ftpConfig);
    }
    updateSelectedFtp();
}

// Function to fetch and display FTP servers with search functionality
export async function fetchFtpServers(searchTerm = '') {
    try {
        const response = await fetch(`${apiFtp}?ftp_server__icontains=${searchTerm}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const ftpServers = await response.json();
        ftpList.innerHTML = '';
        
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

// Event listener for FTP search input
searchInput.addEventListener('input', (event) => {
    fetchFtpServers(event.target.value);
});

// Function to fetch and populate FTP dropdown with search functionality
async function fetchFtpServersDropdown(searchTerm = '') {
    try {
        const response = await fetch(`${apiFtp}?ftp_server__icontains=${searchTerm}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const ftpServers = await response.json();
        ftpListDropdown.innerHTML = '';
        
        ftpServers.forEach((ftpServer) => {
            const listItem = document.createElement('li');
            listItem.className = 'ftp-item';
            
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

        document.querySelectorAll('.ftp-option').forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
    } catch (error) {
        console.error('Error fetching FTP servers:', error);
    }
}

// Event listener for FTP dropdown search input
dropdownSearchInput.addEventListener('input', (event) => {
    fetchFtpServersDropdown(event.target.value);
});

document.getElementById('ftpDropdown').addEventListener('click', () => fetchFtpServersDropdown());

// Function to add FTP server
async function addFtp(event) {
    event.preventDefault();
    
    const ftpServerInput = document.getElementById('ftp-server');
    const ftpRemoteDirInput = document.getElementById('ftp-remote-dir');
    const ftpUsernameInput = document.getElementById('ftp-username');
    const ftpPasswordInput = document.getElementById('ftp-password');

    const ftpServer = ftpServerInput.value.trim();
    const ftpRemoteDir = ftpRemoteDirInput.value.trim();
    const ftpUsername = ftpUsernameInput.value.trim();
    const ftpPassword = ftpPasswordInput.value.trim();

    if (!ftpServer || !ftpRemoteDir || !ftpUsername || !ftpPassword) {
        alert('Please fill out all fields correctly.');
        return;
    }

    try {
        const response = await fetch(apiFtp, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ftp_server: ftpServer,
                remote_directory: ftpRemoteDir,
                ftp_username: ftpUsername,
                ftp_password: ftpPassword,
            }),
        });

        if (!response.ok) throw new Error('Failed to add FTP server.');
        alert('FTP server added successfully!');
        
        ftpServerInput.value = '';
        ftpRemoteDirInput.value = '';
        ftpUsernameInput.value = '';
        ftpPasswordInput.value = '';

        fetchFtpServers();
    } catch (error) {
        console.error(error);
        alert('Error adding FTP server: ' + error.message);
    }
}

addFtpForm.addEventListener('submit', addFtp);
