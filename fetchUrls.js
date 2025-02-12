import { apiUrl } from "./api.js";
const urlList = document.getElementById('url-list');
const editForm = document.getElementById('edit-url-form');
const modal = new bootstrap.Modal(document.getElementById('editModal'));


// Function to fetch URLs from the backend
export async function fetchUrls() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const urls = await response.json();

        // Clear the URL list
        urlList.innerHTML = '';

        // Create cards for each URL
        urls.forEach((url) => {
            const card = document.createElement('li');
            card.className = 'list-group-item d-flex justify-content-between align-items-center';
            card.style.cursor = 'pointer';

            // Card content
            card.innerHTML = `
                <div>
                    <h5>${url.name}</h5>
                    <p class="mb-1">${url.url}</p>
                </div>
                <span class="badge ${url.active ? 'bg-success' : 'bg-danger'}">
                    ${url.active ? 'Active' : 'Inactive'}
                </span> 
            `;

            // Add click event to the card
            card.addEventListener('click', () => {
                populateEditForm(url);
                modal.show();
            });

            urlList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching URLs:', error);
    }
}

let initialData = {};
// Function to populate the edit form with data
function populateEditForm(url) {
    initialData = {
        ...url,
        image_metadata:{...url.image_metadata} } // Deep copy of image_metadata
    document.getElementById('edit-url').value = url.url;
    document.getElementById('edit-name').value = url.name;
    document.getElementById('edit-capture-interval').value = url.capture_interval;
    document.getElementById('edit-active').value=url.active;
    document.getElementById('edit-device-id').value = url.image_metadata.device_id;
    document.getElementById('edit-device-code').value = url.image_metadata.devicecode;
    document.getElementById('edit-album-code').value = url.image_metadata.album_code;
    document.getElementById('edit-latitude').value = url.image_metadata.latitude;
    document.getElementById('edit-longitude').value = url.image_metadata.longitude;
    document.getElementById('edit-altitude').value = url.image_metadata.altitude;
    document.getElementById('edit-image-owner').value = url.image_metadata.imageowner;
    document.getElementById('edit-angle').value = url.image_metadata.angle;
    
    //Preserve The id for later delete function
    document.getElementById('editModal').setAttribute('data-id', url.id);
    // Add an event listener for form submission
    editForm.onsubmit = (e) => {
        e.preventDefault();
        updateUrl(url.id);
    };
}

// Function to send the updated data to the backend
async function updateUrl(id) {
    const updatedData = {};
    const currentData = {
        url: document.getElementById('edit-url').value,
        name: document.getElementById('edit-name').value,
        capture_interval: document.getElementById('edit-capture-interval').value,
        active:document.getElementById('edit-active').value,
        image_metadata:{
                device_id: document.getElementById('edit-device-id').value,
                devicecode: document.getElementById('edit-device-code').value,
                album_code: document.getElementById('edit-album-code').value,
                latitude: document.getElementById('edit-latitude').value,
                longitude: document.getElementById('edit-longitude').value,
                altitude: document.getElementById('edit-altitude').value,
                imageowner: document.getElementById('edit-image-owner').value,
                angle: document.getElementById('edit-angle').value
            }
        }
        // Compare each field and add only the changed fields to the updatedData object
        for (const key in currentData) {
            if (key === 'image_metadata') {
                // Compare nested fields in image_metadata
                updatedData.image_metadata = {};
                for (const nestedKey in currentData.image_metadata) {
                    if (currentData.image_metadata[nestedKey] != initialData.image_metadata[nestedKey]) {
                        updatedData.image_metadata[nestedKey] = currentData.image_metadata[nestedKey];
                    }
                }
                // Remove image_metadata if no changes were found in its fields
                if (Object.keys(updatedData.image_metadata).length === 0) {
                    delete updatedData.image_metadata;
                }
            } else {
                // Compare top-level fields
                if (currentData[key] != initialData[key]) {
                    updatedData[key] = currentData[key];
                }
            }
        }

    // If there are no changes, do not send the request
    if (Object.keys(updatedData).length === 0) {
        alert('No changes detected.');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('URL updated successfully!');
        modal.hide();
        fetchUrls(); // Refresh the list
    } catch (error) {
        console.error('Error updating URL:', error);
        alert("Error updating")
    }
}
// Function to delete a URL
async function deleteUrl(id) {
    const confirmed = confirm("Are you sure you want to delete this URL?");
    if (!confirmed) return;

    try {
        const response = await fetch(`${apiUrl}${id}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        alert('URL deleted successfully!');
        modal.hide();
        fetchUrls(); // Refresh the list
    } catch (error) {
        console.error('Error deleting URL:', error);
        alert("Error deleting");
    }
}
// Event listener for the delete button
document.getElementById('delete-url-btn').addEventListener('click', () => {
    const modal = document.getElementById('editModal');
    const id = modal.getAttribute('data-id'); // Get the ID from the modal's data attribute
    deleteUrl(id);
});




document.getElementById("search_urls").addEventListener("input", function () {
    // console.log("Search input detected:", this.value); // Debugging log
    searchURLs();
});


function searchURLs() {
    let query = document.getElementById('search_urls').value.trim();

    if (query === "") {
        fetchUrls(); // Reload full list when search is empty
        return;
    }

    fetch(`${apiUrl}?name__icontains=${encodeURIComponent(query)}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        urlList.innerHTML = ""; // Clear existing results

        if (data.length === 0) {
            let noResult = document.createElement("li");
            noResult.textContent = "No results found";
            noResult.classList.add("list-group-item", "text-muted");
            urlList.appendChild(noResult);
            return;
        }

        data.forEach(url => {
            const card = document.createElement('li');
            card.className = 'list-group-item d-flex justify-content-between align-items-center';
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div>
                    <h5>${url.name}</h5>
                    <p class="mb-1">${url.url}</p>
                </div>
                <span class="badge ${url.active ? 'bg-success' : 'bg-danger'}">
                    ${url.active ? 'Active' : 'Inactive'}
                </span> 
            `;

            // Add click event for editing
            card.addEventListener('click', () => {
                populateEditForm(url);
                modal.show();
            });

            urlList.appendChild(card);
        });
    })
    .catch(error => {
        console.error("Error fetching search data:", error);
    });
}
