// Script to extract all towns from all routes in townsData
const fs = require('fs');

// Simulated townsData structure (extracted from towns.html)
const townsData = {
    "route1": {
        name: "Kansas City, MO → Milwaukee, WI",
        distance: "540 miles",
        towns: [
            { name: "Kansas City", state: "MO", type: "city", lat: 39.0997, lng: -94.5786, population: 508000 },
            { name: "Liberty", state: "MO", type: "city", lat: 39.2461, lng: -94.4191, population: 31000 },
            { name: "Lawson", state: "MO", type: "city", lat: 39.4358, lng: -94.2038, population: 2500 },
            { name: "Cameron", state: "MO", type: "city", lat: 39.7403, lng: -94.2413, population: 9900 },
            { name: "Gallatin", state: "MO", type: "city", lat: 39.9139, lng: -93.9622, population: 1800 },
            { name: "Trenton", state: "MO", type: "city", lat: 40.0764, lng: -93.6166, population: 6000 },
            { name: "Spickard", state: "MO", type: "village", lat: 40.2414, lng: -93.7305, population: 300 },
            { name: "Princeton", state: "MO", type: "city", lat: 40.4000, lng: -93.5811, population: 1200 },
            { name: "Corydon", state: "IA", type: "city", lat: 40.7561, lng: -93.3188, population: 1600 },
            { name: "Chariton", state: "IA", type: "city", lat: 41.0119, lng: -93.3055, population: 4200 },
            { name: "Indianola", state: "IA", type: "city", lat: 41.3581, lng: -93.5577, population: 15800 },
            { name: "Winterset", state: "IA", type: "city", lat: 41.3306, lng: -94.0138, population: 5200 },
            { name: "Adel", state: "IA", type: "city", lat: 41.6144, lng: -94.0144, population: 5000 },
            { name: "Des Moines", state: "IA", type: "city", lat: 41.5868, lng: -93.6250, population: 215000 },
            { name: "Ankeny", state: "IA", type: "city", lat: 41.7297, lng: -93.6058, population: 67000 },
            { name: "Ames", state: "IA", type: "city", lat: 42.0308, lng: -93.6319, population: 66000 },
            { name: "Story City", state: "IA", type: "city", lat: 42.1872, lng: -93.5972, population: 3400 },
            { name: "Grundy Center", state: "IA", type: "city", lat: 42.3617, lng: -92.7685, population: 2700 },
            { name: "Reinbeck", state: "IA", type: "city", lat: 42.3247, lng: -92.5974, population: 1700 },
            { name: "Waterloo", state: "IA", type: "city", lat: 42.4928, lng: -92.3426, population: 68000 },
            { name: "Cedar Falls", state: "IA", type: "city", lat: 42.5348, lng: -92.4453, population: 40000 },
            { name: "Waverly", state: "IA", type: "city", lat: 42.7258, lng: -92.4732, population: 10000 },
            { name: "Sumner", state: "IA", type: "city", lat: 42.8469, lng: -92.1079, population: 2000 },
            { name: "Fayette", state: "IA", type: "city", lat: 42.8419, lng: -91.8004, population: 1300 },
            { name: "Prairie du Chien", state: "WI", type: "city", lat: 43.0517, lng: -91.1404, population: 5900 },
            { name: "Fennimore", state: "WI", type: "city", lat: 42.9839, lng: -90.6551, population: 2500 },
            { name: "Platteville", state: "WI", type: "city", lat: 42.7341, lng: -90.4787, population: 12000 },
            { name: "Dodgeville", state: "WI", type: "city", lat: 42.9600, lng: -90.1301, population: 5000 },
            { name: "Mount Horeb", state: "WI", type: "village", lat: 43.0119, lng: -89.7373, population: 7500 },
            { name: "Middleton", state: "WI", type: "city", lat: 43.0972, lng: -89.5043, population: 21000 },
            { name: "Madison", state: "WI", type: "city", lat: 43.0731, lng: -89.4012, population: 260000 },
            { name: "Sun Prairie", state: "WI", type: "city", lat: 43.1836, lng: -89.2137, population: 33000 },
            { name: "Watertown", state: "WI", type: "city", lat: 43.1947, lng: -88.7292, population: 24000 },
            { name: "Oconomowoc", state: "WI", type: "city", lat: 43.1119, lng: -88.4993, population: 16000 },
            { name: "Waukesha", state: "WI", type: "city", lat: 43.0117, lng: -88.2315, population: 72000 },
            { name: "Milwaukee", state: "WI", type: "city", lat: 43.0389, lng: -87.9065, population: 590000 }
        ]
    },
    "route2": {
        name: "Milwaukee, WI → Columbus, OH",
        distance: "420 miles",
        towns: [
            { name: "Milwaukee", state: "WI", type: "city", lat: 43.0389, lng: -87.9065, population: 590000 },
            { name: "Racine", state: "WI", type: "city", lat: 42.7261, lng: -87.7829, population: 78000 },
            { name: "Kenosha", state: "WI", type: "city", lat: 42.5847, lng: -87.8212, population: 100000 },
            { name: "Waukegan", state: "IL", type: "city", lat: 42.3636, lng: -87.8448, population: 87000 },
            { name: "Highland Park", state: "IL", type: "city", lat: 42.1817, lng: -87.8006, population: 30000 },
            { name: "Evanston", state: "IL", type: "city", lat: 42.0451, lng: -87.6877, population: 75000 },
            { name: "Chicago", state: "IL", type: "city", lat: 41.8781, lng: -87.6298, population: 2700000 },
            { name: "Gary", state: "IN", type: "city", lat: 41.5934, lng: -87.3464, population: 75000 },
            { name: "Portage", state: "IN", type: "city", lat: 41.5759, lng: -87.1762, population: 37000 },
            { name: "Valparaiso", state: "IN", type: "city", lat: 41.4731, lng: -87.0611, population: 35000 },
            { name: "Plymouth", state: "IN", type: "city", lat: 41.3436, lng: -86.3100, population: 10000 },
            { name: "Warsaw", state: "IN", type: "city", lat: 41.2381, lng: -85.8530, population: 15000 },
            { name: "Fort Wayne", state: "IN", type: "city", lat: 41.0793, lng: -85.1394, population: 270000 },
            { name: "Decatur", state: "IN", type: "city", lat: 40.8306, lng: -84.9291, population: 9500 },
            { name: "Van Wert", state: "OH", type: "city", lat: 40.8695, lng: -84.5844, population: 10500 },
            { name: "Lima", state: "OH", type: "city", lat: 40.7425, lng: -84.1052, population: 36000 },
            { name: "Bellefontaine", state: "OH", type: "city", lat: 40.3614, lng: -83.7596, population: 14000 },
            { name: "Marysville", state: "OH", type: "city", lat: 40.2364, lng: -83.3677, population: 25000 },
            { name: "Delaware", state: "OH", type: "city", lat: 40.2987, lng: -83.0679, population: 40000 },
            { name: "Sunbury", state: "OH", type: "village", lat: 40.2431, lng: -82.8590, population: 5000 },
            { name: "Westerville", state: "OH", type: "city", lat: 40.1262, lng: -82.9291, population: 39000 },
            { name: "Columbus", state: "OH", type: "city", lat: 39.9612, lng: -82.9988, population: 900000 }
        ]
    },
    "route3": {
        name: "Columbus, OH → Pittsburgh, PA",
        distance: "185 miles",
        towns: [
            { name: "Columbus", state: "OH", type: "city", lat: 39.9612, lng: -82.9988, population: 900000 },
            { name: "Reynoldsburg", state: "OH", type: "city", lat: 39.9548, lng: -82.8121, population: 37000 },
            { name: "Newark", state: "OH", type: "city", lat: 40.0581, lng: -82.4013, population: 49000 },
            { name: "Zanesville", state: "OH", type: "city", lat: 39.9403, lng: -82.0132, population: 25000 },
            { name: "Cambridge", state: "OH", type: "city", lat: 40.0312, lng: -81.5882, population: 11000 },
            { name: "St. Clairsville", state: "OH", type: "city", lat: 40.0806, lng: -80.9009, population: 5000 },
            { name: "Bridgeport", state: "OH", type: "village", lat: 40.1089, lng: -80.7545, population: 1800 },
            { name: "Wheeling", state: "WV", type: "city", lat: 40.0687, lng: -80.7209, population: 27000 },
            { name: "Triadelphia", state: "WV", type: "town", lat: 40.0634, lng: -80.6309, population: 800 },
            { name: "Washington", state: "PA", type: "city", lat: 40.1740, lng: -80.2462, population: 13000 },
            { name: "Canonsburg", state: "PA", type: "city", lat: 40.2620, lng: -80.1878, population: 9000 },
            { name: "Peters Township", state: "PA", type: "town", lat: 40.3351, lng: -80.0809, population: 21000 },
            { name: "Bethel Park", state: "PA", type: "city", lat: 40.3276, lng: -80.0387, population: 32000 },
            { name: "Pittsburgh", state: "PA", type: "city", lat: 40.4406, lng: -79.9959, population: 300000 }
        ]
    },
    "route4": {
        name: "Pittsburgh, PA → Indianapolis, IN",
        distance: "360 miles",
        towns: [
            { name: "Pittsburgh", state: "PA", type: "city", lat: 40.4406, lng: -79.9959, population: 300000 },
            { name: "Sewickley", state: "PA", type: "town", lat: 40.5356, lng: -80.1848, population: 4000 },
            { name: "Beaver", state: "PA", type: "city", lat: 40.6956, lng: -80.3048, population: 4300 },
            { name: "East Liverpool", state: "OH", type: "city", lat: 40.6187, lng: -80.5773, population: 10000 },
            { name: "Salem", state: "OH", type: "city", lat: 40.9009, lng: -80.8567, population: 12000 },
            { name: "Alliance", state: "OH", type: "city", lat: 40.9153, lng: -81.1059, population: 22000 },
            { name: "Canton", state: "OH", type: "city", lat: 40.7989, lng: -81.3784, population: 71000 },
            { name: "Massillon", state: "OH", type: "city", lat: 40.7967, lng: -81.5215, population: 32000 },
            { name: "Wooster", state: "OH", type: "city", lat: 40.8051, lng: -81.9351, population: 27000 },
            { name: "Mansfield", state: "OH", type: "city", lat: 40.7584, lng: -82.5154, population: 47000 },
            { name: "Marion", state: "OH", type: "city", lat: 40.5887, lng: -83.1285, population: 36000 },
            { name: "Delaware", state: "OH", type: "city", lat: 40.2987, lng: -83.0679, population: 40000 },
            { name: "Dublin", state: "OH", type: "city", lat: 40.0992, lng: -83.1141, population: 47000 },
            { name: "Richmond", state: "IN", type: "city", lat: 39.8289, lng: -84.8903, population: 36000 },
            { name: "New Castle", state: "IN", type: "city", lat: 39.9289, lng: -85.3703, population: 18000 },
            { name: "Anderson", state: "IN", type: "city", lat: 40.1053, lng: -85.6803, population: 56000 },
            { name: "Noblesville", state: "IN", type: "city", lat: 40.0456, lng: -86.0086, population: 65000 },
            { name: "Fishers", state: "IN", type: "city", lat: 39.9568, lng: -85.9685, population: 95000 },
            { name: "Indianapolis", state: "IN", type: "city", lat: 39.7684, lng: -86.1581, population: 880000 }
        ]
    },
    "route5": {
        name: "Indianapolis, IN → Kansas City, MO",
        distance: "290 miles",
        towns: [
            { name: "Indianapolis", state: "IN", type: "city", lat: 39.7684, lng: -86.1581, population: 880000 },
            { name: "Plainfield", state: "IN", type: "town", lat: 39.7042, lng: -86.3994, population: 34000 },
            { name: "Greencastle", state: "IN", type: "city", lat: 39.6439, lng: -86.8647, population: 10000 },
            { name: "Terre Haute", state: "IN", type: "city", lat: 39.4667, lng: -87.4139, population: 61000 },
            { name: "Robinson", state: "IL", type: "city", lat: 39.0053, lng: -87.7392, population: 7500 },
            { name: "Lawrenceville", state: "IL", type: "city", lat: 38.7297, lng: -87.6819, population: 4300 },
            { name: "Vincennes", state: "IN", type: "city", lat: 38.6772, lng: -87.5286, population: 17000 },
            { name: "Mount Carmel", state: "IL", type: "city", lat: 38.4106, lng: -87.7614, population: 7200 },
            { name: "Fairfield", state: "IL", type: "city", lat: 38.3789, lng: -88.3598, population: 5000 },
            { name: "Flora", state: "IL", type: "city", lat: 38.6689, lng: -88.4856, population: 5000 },
            { name: "Effingham", state: "IL", type: "city", lat: 39.1200, lng: -88.5434, population: 12500 },
            { name: "Vandalia", state: "IL", type: "city", lat: 38.9606, lng: -89.0937, population: 7000 },
            { name: "Greenville", state: "IL", type: "city", lat: 38.8923, lng: -89.4131, population: 7000 },
            { name: "Highland", state: "IL", type: "city", lat: 38.7392, lng: -89.6712, population: 10000 },
            { name: "St. Louis", state: "MO", type: "city", lat: 38.6270, lng: -90.1994, population: 300000 },
            { name: "Wentzville", state: "MO", type: "city", lat: 38.8114, lng: -90.8526, population: 40000 },
            { name: "Columbia", state: "MO", type: "city", lat: 38.9517, lng: -92.3341, population: 125000 },
            { name: "Boonville", state: "MO", type: "city", lat: 38.9736, lng: -92.7432, population: 8300 },
            { name: "Marshall", state: "MO", type: "city", lat: 39.1231, lng: -93.1971, population: 13000 },
            { name: "Sedalia", state: "MO", type: "city", lat: 38.7047, lng: -93.2283, population: 21000 },
            { name: "Warrensburg", state: "MO", type: "city", lat: 38.7628, lng: -93.7360, population: 20000 },
            { name: "Harrisonville", state: "MO", type: "city", lat: 38.6531, lng: -94.3488, population: 10000 },
            { name: "Raymore", state: "MO", type: "city", lat: 38.8022, lng: -94.4497, population: 22000 },
            { name: "Kansas City", state: "MO", type: "city", lat: 39.0997, lng: -94.5786, population: 508000 }
        ]
    }
};

// Function to extract all unique towns from all routes
function extractAllTowns() {
    const allTowns = [];
    const seenTowns = new Set(); // To avoid duplicates
    
    // Iterate through all routes
    Object.keys(townsData).forEach(routeKey => {
        const route = townsData[routeKey];
        route.towns.forEach(town => {
            const townKey = `${town.name}-${town.state}`;
            if (!seenTowns.has(townKey)) {
                seenTowns.add(townKey);
                allTowns.push({
                    name: town.name,
                    state: town.state,
                    type: town.type,
                    lat: town.lat,
                    lng: town.lng,
                    population: town.population
                });
            }
        });
    });
    
    return allTowns;
}

// Extract all towns
const allTowns = extractAllTowns();

console.log(`Extracted ${allTowns.length} unique towns from ${Object.keys(townsData).length} routes`);

// Create the towns-list.json file
const townsList = {
    metadata: {
        description: "Complete list of all towns across all travel routes",
        totalTowns: allTowns.length,
        totalRoutes: Object.keys(townsData).length,
        extractedDate: new Date().toISOString(),
        routes: Object.keys(townsData).map(key => ({
            id: key,
            name: townsData[key].name,
            distance: townsData[key].distance,
            townCount: townsData[key].towns.length
        }))
    },
    towns: allTowns
};

// Write to file
const outputPath = './data/towns-list.json';
fs.writeFileSync(outputPath, JSON.stringify(townsList, null, 2));

console.log(`✅ Complete towns list written to ${outputPath}`);
console.log(`📊 Summary:`);
console.log(`   - Total unique towns: ${allTowns.length}`);
console.log(`   - Total routes: ${Object.keys(townsData).length}`);
console.log(`   - Output file: ${outputPath}`);

// Display first few towns as preview
console.log(`\n🔍 Preview (first 10 towns):`);
allTowns.slice(0, 10).forEach((town, index) => {
    console.log(`   ${index + 1}. ${town.name}, ${town.state} (${town.type}) - Pop: ${town.population.toLocaleString()}`);
});

console.log(`\n🚀 Ready to run: node fetch-town-data.js`);
