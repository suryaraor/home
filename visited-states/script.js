const API_KEY = "$2a$10$5PzohAsSrmxvVESL5n2Vcu5ZJQwRVRYvXcqhgxtvPdyrN1C3QOxea"; // Updated API key
const BIN_ID = "67ead44f8960c979a57bde21"; // Added Bin ID

document.addEventListener("DOMContentLoaded", () => {
    const states = document.querySelectorAll(".state");
    document.getElementById('loader').style.display = 'none';

    // Load visited states from JSONBin
    fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        method: "GET",
        headers: {
            "X-Master-Key": API_KEY,
        },
    })
    .then(response => response.json())
    .then(data => {
        const visitedStates = data.record.visitedStates || [];

        // Mark states as visited if they are in JSONBin
        states.forEach(state => {
            const stateName = state.id || state.dataset.state;
            if (visitedStates.includes(stateName)) {
                state.classList.add("visited");
                state.style.fill = "green"; // Change color to green for visited states
            }

            // Add state code and name as text on each state
            const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElement.textContent = `${state.id}`; // Update the text content to show only the state code
            textElement.setAttribute("x", state.getBBox().x + state.getBBox().width / 2);
            textElement.setAttribute("y", state.getBBox().y + state.getBBox().height / 2);
            textElement.setAttribute("text-anchor", "middle");
            textElement.style.fill = "black";
            textElement.style.fontSize = "12px";
            state.parentNode.appendChild(textElement);
            document.getElementById('loader').style.display = 'none';

            // Add click event listener to toggle visited state
            state.addEventListener("click", () => {
                state.classList.toggle("visited");

                if (state.classList.contains("visited")) {
                    visitedStates.push(stateName);
                    state.style.fill = "green"; // Change color to green on click
                } else {
                    const index = visitedStates.indexOf(stateName);
                    if (index > -1) {
                        visitedStates.splice(index, 1);
                    }
                    state.style.fill = ""; // Reset color if unvisited
                }
                
                // Save updated visited states to JSONBin
                fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Master-Key": API_KEY,
                    },
                    body: JSON.stringify({ visitedStates }),
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Visited states saved to JSONBin:", data);
                })
                .catch(error => {
                    console.error("Error saving visited states to JSONBin:", error);
                });
            });
        });
    })
    .catch(error => {
        console.error("Error loading visited states from JSONBin:", error);
    });
});