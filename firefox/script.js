// GitHub auto-update configuration
const GITHUB_REPO = 'izzxtikamal/dco-quicklaunch-extension'; // Replace 'yourusername' with your actual GitHub username
const UPDATE_CHECK_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

// Detect browser type
function getBrowserType() {
    if (typeof browser !== 'undefined') {
        return 'firefox';
    } else if (typeof chrome !== 'undefined') {
        return 'chrome';
    }
    return 'unknown';
}

async function checkForUpdates() {
    try {
        const response = await fetch(UPDATE_CHECK_URL);
        if (!response.ok) {
            console.log('No updates available or API limit reached');
            return;
        }
        
        const releaseData = await response.json();
        const latestVersion = releaseData.tag_name.replace(/^v/, '');
        
        // Get current version based on browser (Firefox compatibility)
        let currentVersion;
        if (getBrowserType() === 'firefox' && typeof browser !== 'undefined') {
            currentVersion = browser.runtime.getManifest().version;
        } else if (typeof chrome !== 'undefined') {
            currentVersion = chrome.runtime.getManifest().version;
        } else {
            console.log('Unable to determine browser version');
            return;
        }
        
        console.log(`Current version: ${currentVersion}, Latest version: ${latestVersion}`);
        
        if (isNewerVersion(latestVersion, currentVersion)) {
            // Find the appropriate extension file based on browser
            const browserType = getBrowserType();
            const extensionAsset = releaseData.assets.find(asset => {
                const name = asset.name.toLowerCase();
                return name.includes(browserType) && name.endsWith('.zip');
            });
            
            if (extensionAsset) {
                showUpdateNotification(latestVersion, extensionAsset.browser_download_url, releaseData.html_url);
            }
        }
    } catch (error) {
        console.error('Failed to check for updates:', error);
    }
}

function showUpdateNotification(version, downloadUrl, releaseUrl) {
    const existingNotification = document.getElementById('update-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const browserType = getBrowserType();
    const browserName = browserType === 'firefox' ? 'Firefox' : 'Chrome/Edge';
    
    const notification = document.createElement('div');
    notification.id = 'update-notification';
    notification.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px;
            margin: 10px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 999999;
            max-width: 350px;
            border: 2px solid rgba(255,255,255,0.2);
            animation: slideInFromRight 0.5s ease-out;
        ">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <span style="font-size: 24px;">🚀</span>
                <div>
                    <div style="font-weight: bold; font-size: 16px;">Update Available!</div>
                    <div style="opacity: 0.9; font-size: 14px;">Version ${version} for ${browserName}</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="${downloadUrl}" target="_blank" style="
                    background: rgba(255,255,255,0.25);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.3);
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.35)'" onmouseout="this.style.background='rgba(255,255,255,0.25)'">
                    📥 Download ${browserName} Update
                </a>
                <a href="${releaseUrl}" target="_blank" style="
                    background: transparent;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 600;
                    border: 1px solid rgba(255,255,255,0.4);
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='transparent'">
                    📋 Release Notes
                </a>
            </div>
            <div style="
                position: absolute;
                top: 8px;
                right: 12px;
                cursor: pointer;
                font-size: 18px;
                opacity: 0.7;
                transition: opacity 0.2s ease;
            " onclick="this.parentElement.parentElement.remove()" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                ✕
            </div>
        </div>
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('update-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'update-notification-styles';
        style.textContent = `
            @keyframes slideInFromRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutToRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    console.log('🚀 Update notification displayed for all users!');
    
    // Auto-hide after 15 seconds with slide-out animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutToRight 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 500);
        }
    }, 15000);
}

function isNewerVersion(latest, current) {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);
    
    const maxLength = Math.max(latestParts.length, currentParts.length);
    while (latestParts.length < maxLength) latestParts.push(0);
    while (currentParts.length < maxLength) currentParts.push(0);
    
    for (let i = 0; i < maxLength; i++) {
        if (latestParts[i] > currentParts[i]) return true;
        if (latestParts[i] < currentParts[i]) return false;
    }
    return false;
}

// Cross-browser event listeners
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkForUpdates, 2000); // Check for updates 2 seconds after page load
});

// Firefox-compatible extension lifecycle events
if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onInstalled) {
    browser.runtime.onInstalled.addListener(() => {
        checkForUpdates();
    });
} else if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
    chrome.runtime.onInstalled.addListener(() => {
        checkForUpdates();
    });
}

// Your existing code continues below...
console.log('Quick Launch: Script loaded');

(function() {
    'use strict';
    
    function initExtension() {
        console.log('Quick Launch: Initializing...');
        
        // Add click animations for regular buttons
        const buttons = document.querySelectorAll('.shortcut-btn:not(.dropdown-btn)');
        console.log('Quick Launch: Found buttons:', buttons.length);
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });
        
        // Handle dropdown functionality
        initDropdowns();
        
        // Update greeting
        updateGreeting();

        // Initialize snow animation
        initSnow();

        // Initialize Eva button
        function initEvaButton() {
            const evaBtn = document.querySelector('.eva-btn');
            if (evaBtn) {
                evaBtn.addEventListener('click', function(e) {
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
                
                console.log('Quick Launch: Eva button initialized');
            }	
        }

        // Initialize Meeting button
        function initCalendarButton() {
            const calendarBtn = document.querySelector('.calendar-btn');
            if (calendarBtn) {
                calendarBtn.addEventListener('click', function(e) {
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
                
                console.log('Quick Launch: Meeting button initialized');
            }
        }

        // Initialize Oncall button
        function initOncallButton() {
            const oncallBtn = document.querySelector('.oncall-btn');
            if (oncallBtn) {
                oncallBtn.addEventListener('click', function(e) {
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
        
                console.log('Quick Launch: Oncall button initialized');
            }
        }

        // Initialize Emergency button
        function initEmergencyButton() {
            const emergencyBtn = document.querySelector('.emergency-btn');
            if (emergencyBtn) {
                emergencyBtn.addEventListener('click', function(e) {
                    this.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                });
        
                console.log('Quick Launch: Emergency button initialized');
            }
        }

// Call initialization functions
initEvaButton();
initCalendarButton();
initOncallButton();
initEmergencyButton(); // Add this line

        // Call initialization functions
        initEvaButton();
        initCalendarButton();
        initOncallButton();
    }
    
    function initDropdowns() {
        const dropdownContainers = document.querySelectorAll('.dropdown-container');
        
        dropdownContainers.forEach(container => {
            const dropdownBtn = container.querySelector('.dropdown-btn');
            const dropdownMenu = container.querySelector('.dropdown-menu');
            
            dropdownBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdownContainers.forEach(otherContainer => {
                    if (otherContainer !== container) {
                        otherContainer.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                container.classList.toggle('active');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown-container')) {
                dropdownContainers.forEach(container => {
                    container.classList.remove('active');
                });
            }
        });
        
        // Handle dropdown item clicks - remove target="_blank" behavior
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
    }
    
    function updateGreeting() {
        const greeting = document.querySelector('.greeting');
        if (!greeting) {
            console.log('Quick Launch: Greeting element not found');
            return;
        }
        
        // Array of inspirational quotes
        const quotes = [
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The way to get started is to quit talking and begin doing.",
            "Innovation distinguishes between a leader and a follower.",
            "Your limitation—it's only your imagination.",
            "Push yourself, because no one else is going to do it for you.",
            "Great things never come from comfort zones.",
            "Dream it. Wish it. Do it.",
            "Success doesn't just find you. You have to go out and get it.",
            "The harder you work for something, the greater you'll feel when you achieve it.",
            "Dream bigger. Do bigger.",
            "Don't stop when you're tired. Stop when you're done.",
            "Wake up with determination. Go to bed with satisfaction.",
            "Do something today that your future self will thank you for.",
            "Little things make big days.",
            "It's going to be hard, but hard does not mean impossible.",
            "Don't wait for opportunity. Create it.",
            "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
            "The key to success is to focus on goals, not obstacles.",
            "Believe you can and you're halfway there.",
            "Excellence is not a skill, it's an attitude.",
            "The only way to do great work is to love what you do.",
            "Strive not to be a success, but rather to be of value.",
            "The future belongs to those who believe in the beauty of their dreams.",
            "It does not matter how slowly you go as long as you do not stop.",
            "Everything you've ever wanted is on the other side of fear.",
            "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.",
            "I learned that courage was not the absence of fear, but the triumph over it.",
            "Opportunities don't happen. You create them.",
            "Try not to become a person of success, but rather try to become a person of value.",
            "A person who never made a mistake never tried anything new."
        ];
        
        // Get a random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        
        greeting.textContent = randomQuote;
        
        console.log('Quick Launch: Quote updated to:', randomQuote);
    }

    function initSnow() {
        const snowContainer = document.querySelector('.snow-container');
        if (!snowContainer) return;

        function createSnowflake() {
            const snowflake = document.createElement('div');
            snowflake.classList.add('snowflake');
            snowflake.innerHTML = '❄';
            
            // Random starting position
            snowflake.style.left = Math.random() * 100 + '%';
            snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
            snowflake.style.opacity = Math.random();
            snowflake.style.fontSize = Math.random() * 10 + 10 + 'px';
            
            snowContainer.appendChild(snowflake);
            
            // Remove snowflake after animation
            setTimeout(() => {
                snowflake.remove();
            }, 5000);
        }
        
        // Create snowflakes periodically
        setInterval(createSnowflake, 300);
        
        console.log('Quick Launch: Snow animation initialized');
    }
    
    // Single initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExtension);
    } else {
        initExtension();
    }
})();


