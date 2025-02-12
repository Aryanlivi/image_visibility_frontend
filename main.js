import {fetchFtpServers} from './ftp_configs.js';
import {fetchUrls} from './fetchUrls.js';
document.addEventListener("DOMContentLoaded", () => {
    fetchUrls();
    fetchFtpServers();
});
