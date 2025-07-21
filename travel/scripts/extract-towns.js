#!/usr/bin/env node

/**
 * Extract town list from existing townsData and create a clean list
 * for the data fetching script
 */

const fs = require('fs');

// Your existing townsData (copy from your HTML file)
const townsData = {
    "route1": {
        "name": "Missouri to Iowa Route",
        "distance": "350 miles",
        "towns": [
            { name: "Kansas City", state: "MO", lat: 39.0997, lng: -94.5786, population: 508394, type: "city", points: 25 },
            { name: "Liberty", state: "MO", lat: 39.2461, lng: -94.4191, population: 30167, type: "city", points: 15 },
            { name: "Lawson", state: "MO", lat: 39.4358, lng: -94.2036, population: 2473, type: "town", points: 8 },
            { name: "Cameron", state: "MO", lat: 39.7397, lng: -94.2405, population: 9933, type: "city", points: 10 },
            { name: "Gallatin", state: "MO", lat: 39.9142, lng: -93.9627, population: 1788, type: "town", points: 7 },
            { name: "Trenton", state: "MO", lat: 40.0764, lng: -93.6163, population: 5989, type: "city", points: 10 },
            { name: "Spickard", state: "MO", lat: 40.2514, lng: -93.7232, population: 336, type: "village", points: 5 },
            { name: "Princeton", state: "MO", lat: 40.4031, lng: -93.5810, population: 1166, type: "city", points: 6 },
            { name: "Corydon", state: "IA", lat: 40.7564, lng: -93.3185, population: 1585, type: "city", points: 7 },
            { name: "Chariton", state: "IA", lat: 41.0133, lng: -93.3057, population: 4321, type: "city", points: 9 },
            { name: "Indianola", state: "IA", lat: 41.3581, lng: -93.5579, population: 15833, type: "city", points: 12 },
            { name: "Winterset", state: "IA", lat: 41.3308, lng: -94.0138, population: 5190, type: "city", points: 10 },
            { name: "Adel", state: "IA", lat: 41.6147, lng: -94.0155, population: 6153, type: "city", points: 10 },
            { name: "Des Moines", state: "IA", lat: 41.5868, lng: -93.6250, population: 214133, type: "city", points: 20 },
            { name: "Ankeny", state: "IA", lat: 41.7297, lng: -93.6058, population: 67887, type: "city", points: 15 },
            { name: "Ames", state: "IA", lat: 42.0308, lng: -93.6319, population: 66427, type: "city", points: 15 },
            { name: "Story City", state: "IA", lat: 42.1894, lng: -93.5952, population: 3431, type: "city", points: 8 },
            { name: "Grundy Center", state: "IA", lat: 42.3611, lng: -92.7677, population: 2706, type: "city", points: 8 }
        ]
    }
    // Add your other routes here...
};

function extractTownsList() {
    const allTowns = [];
    
    Object.values(townsData).forEach(route => {
        route.towns.forEach(town => {
            // Check if town already exists (some towns might be on multiple routes)
            const existing = allTowns.find(t => 
                t.name === town.name && t.state === town.state
            );
            
            if (!existing) {
                allTowns.push({
                    name: town.name,
                    state: town.state,
                    lat: town.lat,
                    lng: town.lng,
                    population: town.population,
                    type: town.type,
                    points: town.points
                });
            }
        });
    });
    
    // Sort by state then by name
    allTowns.sort((a, b) => {
        if (a.state !== b.state) {
            return a.state.localeCompare(b.state);
        }
        return a.name.localeCompare(b.name);
    });
    
    return allTowns;
}

function generateTownsList() {
    const towns = extractTownsList();
    
    console.log(`📊 Extracted ${towns.length} unique towns`);
    
    // Save as JSON
    fs.writeFileSync('./towns-list.json', JSON.stringify(towns, null, 2));
    console.log('💾 Saved to towns-list.json');
    
    // Save as JavaScript constant (for use in the fetcher script)
    const jsContent = `// Auto-generated town list
const TOWNS_LIST = ${JSON.stringify(towns, null, 2)};

module.exports = TOWNS_LIST;`;
    
    fs.writeFileSync('./towns-list.js', jsContent);
    console.log('💾 Saved to towns-list.js');
    
    // Print summary
    const stateStats = {};
    towns.forEach(town => {
        stateStats[town.state] = (stateStats[town.state] || 0) + 1;
    });
    
    console.log('\n📈 Summary by state:');
    Object.entries(stateStats).forEach(([state, count]) => {
        console.log(`  ${state}: ${count} towns`);
    });
    
    return towns;
}

// Run if this file is executed directly
if (require.main === module) {
    generateTownsList();
}

module.exports = { extractTownsList, generateTownsList };
