#!/usr/bin/env node

/**
 * Town Data Fetcher Script
 * Fetches comprehensive information about towns from multiple sources
 * and builds a complete database for the travel app
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    outputFile: './data/towns-database.json',
    sources: {
        wikipedia: 'https://en.wikipedia.org/api/rest_v1/page/summary/',
        geonames: 'http://api.geonames.org/',
        // Add other APIs as needed
    },
    delay: 1000, // Delay between API calls to be respectful
};

// Your town list from the existing data
const TOWNS_LIST = [
    { name: "Grundy Center", state: "IA", lat: 42.3611, lng: -92.7677, population: 2706, type: "city" },
    { name: "Princeton", state: "MO", lat: 40.4031, lng: -93.5810, population: 1166, type: "city" },
    { name: "Reinbeck", state: "IA", lat: 42.3247, lng: -92.5999, population: 1664, type: "city" },
    // Add all your towns here...
];

class TownDataFetcher {
    constructor() {
        this.database = {
            metadata: {
                version: "1.0",
                lastUpdated: new Date().toISOString(),
                totalTowns: 0,
                sources: Object.keys(CONFIG.sources)
            },
            towns: {}
        };
    }

    // Generate town ID (same format as your existing system)
    generateTownId(name, state) {
        return `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${state.toLowerCase()}`;
    }

    // Fetch from Wikipedia API
    async fetchWikipediaData(townName, state) {
        try {
            const searchTerms = [
                `${townName},_${state}`,
                `${townName}_(${state})`,
                `${townName}_${state}`
            ];

            for (const term of searchTerms) {
                try {
                    const url = `${CONFIG.sources.wikipedia}${encodeURIComponent(term)}`;
                    console.log(`Fetching Wikipedia data for: ${term}`);
                    
                    const response = await fetch(url);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.extract && data.extract.length > 50) {
                            return {
                                summary: data.extract,
                                facts: this.extractFactsFromSummary(data.extract),
                                pageUrl: data.content_urls?.desktop?.page
                            };
                        }
                    }
                } catch (error) {
                    console.log(`Wikipedia attempt failed for ${term}:`, error.message);
                }
            }
        } catch (error) {
            console.error(`Error fetching Wikipedia data for ${townName}, ${state}:`, error);
        }
        return null;
    }

    // Extract facts from Wikipedia summary
    extractFactsFromSummary(summary) {
        const facts = [];
        const sentences = summary.split('. ');
        
        sentences.forEach(sentence => {
            sentence = sentence.trim();
            if (sentence.length > 20 && sentence.length < 200) {
                // Look for interesting patterns
                if (sentence.includes('founded') || 
                    sentence.includes('established') ||
                    sentence.includes('known for') ||
                    sentence.includes('home to') ||
                    sentence.includes('named after') ||
                    sentence.includes('population') ||
                    sentence.includes('county seat')) {
                    facts.push(sentence + (sentence.endsWith('.') ? '' : '.'));
                }
            }
        });
        
        return facts.slice(0, 5); // Limit to 5 facts
    }

    // Research individual town
    async researchTown(town) {
        console.log(`\n🔍 Researching ${town.name}, ${town.state}...`);
        
        const townId = this.generateTownId(town.name, town.state);
        const townData = {
            name: town.name,
            state: town.state,
            population: town.population,
            type: town.type,
            coordinates: {
                lat: town.lat,
                lng: town.lng
            },
            facts: [],
            attractions: [],
            founded: null,
            county: null,
            notableFacts: []
        };

        // Fetch Wikipedia data
        const wikiData = await this.fetchWikipediaData(town.name, town.state);
        if (wikiData) {
            townData.facts.push(...wikiData.facts);
            townData.wikipediaUrl = wikiData.pageUrl;
            
            // Try to extract founded date and county from summary
            const summary = wikiData.summary.toLowerCase();
            const foundedMatch = summary.match(/founded in (\d{4})/);
            if (foundedMatch) {
                townData.founded = parseInt(foundedMatch[1]);
            }
            
            const countyMatch = summary.match(/(\w+) county/);
            if (countyMatch) {
                townData.county = countyMatch[1].charAt(0).toUpperCase() + countyMatch[1].slice(1) + " County";
            }
        }

        // Add manual research prompts
        townData.researchNotes = [
            `Research ${town.name} official website for local attractions`,
            `Check state tourism site for ${town.state} - ${town.name} section`,
            `Look up ${town.name} historical society for unique facts`,
            `Search for annual festivals or events in ${town.name}`,
            `Find notable residents or businesses from ${town.name}`
        ];

        this.database.towns[townId] = townData;
        
        // Delay to be respectful to APIs
        await this.delay(CONFIG.delay);
        
        return townData;
    }

    // Helper delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Process all towns
    async fetchAllTownData() {
        console.log(`🚀 Starting research for ${TOWNS_LIST.length} towns...`);
        
        for (let i = 0; i < TOWNS_LIST.length; i++) {
            const town = TOWNS_LIST[i];
            console.log(`\n📍 Progress: ${i + 1}/${TOWNS_LIST.length}`);
            
            try {
                await this.researchTown(town);
                console.log(`✅ Completed ${town.name}, ${town.state}`);
            } catch (error) {
                console.error(`❌ Failed ${town.name}, ${town.state}:`, error);
            }
            
            // Save progress every 10 towns
            if ((i + 1) % 10 === 0) {
                this.saveDatabase();
                console.log(`💾 Progress saved (${i + 1}/${TOWNS_LIST.length})`);
            }
        }
        
        this.database.metadata.totalTowns = Object.keys(this.database.towns).length;
        this.saveDatabase();
        console.log(`\n🎉 Research complete! Database saved to ${CONFIG.outputFile}`);
    }

    // Save database to file
    saveDatabase() {
        try {
            const outputPath = path.resolve(CONFIG.outputFile);
            const outputDir = path.dirname(outputPath);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            fs.writeFileSync(outputPath, JSON.stringify(this.database, null, 2), 'utf8');
            console.log(`💾 Database saved to ${outputPath}`);
        } catch (error) {
            console.error('❌ Error saving database:', error);
        }
    }

    // Generate research template for manual completion
    generateResearchTemplate() {
        const template = {
            instructions: "Complete the research for each town using the provided notes",
            towns: {}
        };
        
        Object.entries(this.database.towns).forEach(([townId, townData]) => {
            template.towns[townId] = {
                name: townData.name,
                state: townData.state,
                currentFacts: townData.facts.length,
                researchTasks: townData.researchNotes,
                suggestedFacts: [
                    "Historical founding story or origin",
                    "Notable residents (past or present)",
                    "Unique local businesses or industries",
                    "Annual festivals or community events",
                    "Interesting geographical features",
                    "Local legends or unusual facts"
                ]
            };
        });
        
        fs.writeFileSync('./research-template.json', JSON.stringify(template, null, 2));
        console.log('📋 Research template generated: research-template.json');
    }
}

// Main execution
async function main() {
    const fetcher = new TownDataFetcher();
    
    console.log('🎯 Town Data Fetcher Starting...');
    console.log(`📊 Total towns to research: ${TOWNS_LIST.length}`);
    
    try {
        await fetcher.fetchAllTownData();
        fetcher.generateResearchTemplate();
        
        console.log('\n✅ All done! Next steps:');
        console.log('1. Review the generated database file');
        console.log('2. Use the research template to manually add more facts');
        console.log('3. Update your travel app to use the new database');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = TownDataFetcher;
