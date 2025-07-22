const API_KEY = "$2a$10$5PzohAsSrmxvVESL5n2Vcu5ZJQwRVRYvXcqhgxtvPdyrN1C3QOxea"; // Updated API key
const BIN_ID = "67ead44f8960c979a57bde21"; // Added Bin ID

// State management
let visitedStates = [];
let allStates = [];
let autoMode = false;
let isProcessing = false;

// Auto-check interval settings
const AUTO_CHECK_DELAY = 2000; // 2 seconds between auto checks
const AUTO_UNCHECK_DELAY = 1000; // 1 second between auto unchecks

document.addEventListener("DOMContentLoaded", () => {
    const states = document.querySelectorAll(".state");
    allStates = Array.from(states);
    document.getElementById('loader').style.display = 'none';

    // Initialize control buttons
    initializeControls();

    // Load visited states from JSONBin
    loadVisitedStates();

    // Initialize individual state click handlers
    initializeStateHandlers();
});

function initializeControls() {
    // Auto check all states
    document.getElementById('auto-check-all').addEventListener('click', () => {
        if (isProcessing) return;
        autoCheckAllStates();
    });

    // Manual check all states
    document.getElementById('manual-check-all').addEventListener('click', () => {
        if (isProcessing) return;
        manualCheckAllStates();
    });

    // Uncheck all states
    document.getElementById('uncheck-all').addEventListener('click', () => {
        if (isProcessing) return;
        uncheckAllStates();
    });

    // Clear cache
    document.getElementById('clear-cache').addEventListener('click', () => {
        if (isProcessing) return;
        clearCache();
    });

    // Auto mode toggle
    document.getElementById('auto-mode').addEventListener('change', (e) => {
        autoMode = e.target.checked;
        updateStatus(`Auto mode ${autoMode ? 'enabled' : 'disabled'}`);
    });
}

async function loadVisitedStates() {
    try {
        updateStatus('Loading visited states...');
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            method: "GET",
            headers: {
                "X-Master-Key": API_KEY,
            },
        });
        
        const data = await response.json();
        visitedStates = data.record.visitedStates || [];

        // Mark states as visited if they are in JSONBin
        allStates.forEach(state => {
            const stateName = state.id || state.dataset.state;
            if (visitedStates.includes(stateName)) {
                markStateAsVisited(state, false); // Don't save to API yet
            }
            addStateLabel(state);
        });

        updateStats();
        updateStatus('Loaded successfully');
        
    } catch (error) {
        console.error("Error loading visited states from JSONBin:", error);
        updateStatus('Error loading data');
    }
}

function initializeStateHandlers() {
    allStates.forEach(state => {
        state.addEventListener("click", () => {
            if (isProcessing && !autoMode) return;
            
            const stateName = state.id || state.dataset.state;
            toggleStateVisited(state, stateName);
        });
    });
}

function addStateLabel(state) {
    // Add state code and name as text on each state
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.textContent = `${state.id}`; // Show only the state code
    textElement.setAttribute("x", state.getBBox().x + state.getBBox().width / 2);
    textElement.setAttribute("y", state.getBBox().y + state.getBBox().height / 2);
    textElement.setAttribute("text-anchor", "middle");
    textElement.style.fill = "black";
    textElement.style.fontSize = "12px";
    textElement.style.pointerEvents = "none"; // Prevent interference with click events
    state.parentNode.appendChild(textElement);
}

function markStateAsVisited(state, shouldSave = true) {
    const stateName = state.id || state.dataset.state;
    
    state.classList.add("visited");
    state.style.fill = "green";
    
    if (!visitedStates.includes(stateName)) {
        visitedStates.push(stateName);
    }
    
    if (shouldSave) {
        saveVisitedStates();
        updateStats();
    }
}

function markStateAsUnvisited(state, shouldSave = true) {
    const stateName = state.id || state.dataset.state;
    
    state.classList.remove("visited");
    state.style.fill = "#f9f9f9";
    
    const index = visitedStates.indexOf(stateName);
    if (index > -1) {
        visitedStates.splice(index, 1);
    }
    
    if (shouldSave) {
        saveVisitedStates();
        updateStats();
    }
}

function toggleStateVisited(state, stateName) {
    if (state.classList.contains("visited")) {
        markStateAsUnvisited(state);
        updateStatus(`Unchecked ${stateName}`);
    } else {
        markStateAsVisited(state);
        updateStatus(`Checked ${stateName}`);
    }
}

async function autoCheckAllStates() {
    if (isProcessing) return;
    
    isProcessing = true;
    updateStatus('Auto-checking all states...');
    
    const unvisitedStates = allStates.filter(state => !state.classList.contains("visited"));
    
    for (let i = 0; i < unvisitedStates.length; i++) {
        const state = unvisitedStates[i];
        const stateName = state.id || state.dataset.state;
        
        markStateAsVisited(state, false); // Don't save individually
        updateStatus(`Auto-checking: ${stateName} (${i + 1}/${unvisitedStates.length})`);
        updateStats();
        
        // Add delay between auto-checks
        if (i < unvisitedStates.length - 1) {
            await new Promise(resolve => setTimeout(resolve, AUTO_CHECK_DELAY));
        }
    }
    
    // Save all at once
    await saveVisitedStates();
    updateStatus(`Auto-checked ${unvisitedStates.length} states`);
    isProcessing = false;
}

function manualCheckAllStates() {
    if (isProcessing) return;
    
    isProcessing = true;
    updateStatus('Checking all states...');
    
    const unvisitedStates = allStates.filter(state => !state.classList.contains("visited"));
    
    unvisitedStates.forEach(state => {
        markStateAsVisited(state, false); // Don't save individually
    });
    
    // Save all at once
    saveVisitedStates();
    updateStatus(`Manually checked ${unvisitedStates.length} states`);
    isProcessing = false;
}

async function uncheckAllStates() {
    if (isProcessing) return;
    
    isProcessing = true;
    
    if (autoMode) {
        // Auto uncheck with delays
        updateStatus('Auto-unchecking all states...');
        const visitedStateElements = allStates.filter(state => state.classList.contains("visited"));
        
        for (let i = 0; i < visitedStateElements.length; i++) {
            const state = visitedStateElements[i];
            const stateName = state.id || state.dataset.state;
            
            markStateAsUnvisited(state, false); // Don't save individually
            updateStatus(`Auto-unchecking: ${stateName} (${i + 1}/${visitedStateElements.length})`);
            updateStats();
            
            // Add delay between auto-unchecks
            if (i < visitedStateElements.length - 1) {
                await new Promise(resolve => setTimeout(resolve, AUTO_UNCHECK_DELAY));
            }
        }
        
        updateStatus(`Auto-unchecked ${visitedStateElements.length} states`);
    } else {
        // Manual instant uncheck
        updateStatus('Unchecking all states...');
        const visitedStateElements = allStates.filter(state => state.classList.contains("visited"));
        
        visitedStateElements.forEach(state => {
            markStateAsUnvisited(state, false); // Don't save individually
        });
        
        updateStatus(`Unchecked ${visitedStateElements.length} states`);
    }
    
    // Save all at once
    await saveVisitedStates();
    isProcessing = false;
}

function clearCache() {
    visitedStates = [];
    allStates.forEach(state => {
        markStateAsUnvisited(state, false);
    });
    saveVisitedStates();
    updateStatus('Cache cleared');
}

async function saveVisitedStates() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY,
            },
            body: JSON.stringify({ visitedStates }),
        });
        
        const data = await response.json();
        console.log("Visited states saved to JSONBin:", data);
        
    } catch (error) {
        console.error("Error saving visited states to JSONBin:", error);
        updateStatus('Error saving data');
    }
}

function updateStats() {
    const statsElement = document.getElementById('stats');
    const visitedCount = visitedStates.length;
    const totalCount = allStates.length;
    const percentage = Math.round((visitedCount / totalCount) * 100);
    
    statsElement.textContent = `States visited: ${visitedCount}/${totalCount} (${percentage}%)`;
    
    // Add visual feedback for milestones
    if (percentage === 100) {
        statsElement.style.color = '#28a745';
        statsElement.style.fontWeight = 'bold';
        if (visitedCount === totalCount) {
            updateStatus('🎉 Congratulations! All states visited!');
        }
    } else if (percentage >= 75) {
        statsElement.style.color = '#fd7e14';
    } else if (percentage >= 50) {
        statsElement.style.color = '#007bff';
    } else {
        statsElement.style.color = '#333';
    }
}

function updateStatus(message) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    
    // Add processing visual feedback
    document.body.classList.toggle('processing', isProcessing);
    
    // Clear status after 3 seconds (unless it's a persistent processing message)
    if (!message.includes('...')) {
        setTimeout(() => {
            if (statusElement.textContent === message) {
                statusElement.textContent = '';
                document.body.classList.remove('processing');
            }
        }, 3000);
    }
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'a':
                e.preventDefault();
                if (!isProcessing) {
                    if (e.shiftKey) {
                        autoCheckAllStates();
                    } else {
                        manualCheckAllStates();
                    }
                }
                break;
            case 'u':
                e.preventDefault();
                if (!isProcessing) {
                    uncheckAllStates();
                }
                break;
            case 'd':
                e.preventDefault();
                if (!isProcessing) {
                    clearCache();
                }
                break;
            case 'm':
                e.preventDefault();
                const autoModeCheckbox = document.getElementById('auto-mode');
                autoModeCheckbox.checked = !autoModeCheckbox.checked;
                autoMode = autoModeCheckbox.checked;
                updateStatus(`Auto mode ${autoMode ? 'enabled' : 'disabled'}`);
                break;
        }
    }
});

// Add tooltip information
function addTooltips() {
    const buttons = [
        { id: 'auto-check-all', tooltip: 'Automatically check all states with animation (Ctrl+Shift+A)' },
        { id: 'manual-check-all', tooltip: 'Instantly check all states (Ctrl+A)' },
        { id: 'uncheck-all', tooltip: 'Uncheck all states (Ctrl+U)' },
        { id: 'clear-cache', tooltip: 'Clear all data and reset (Ctrl+D)' },
        { id: 'auto-mode', tooltip: 'Enable/disable auto mode for animations (Ctrl+M)' }
    ];
    
    buttons.forEach(({ id, tooltip }) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltip;
        }
    });
}

// Initialize tooltips after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Existing initialization code...
    addTooltips();
});