#!/usr/bin/env node

/**
 * Research Notes Management Tool
 * Utilities for managing, customizing, and optimizing AI-generated research notes
 */

const fs = require('fs');
const path = require('path');

class ResearchNotesManager {
    constructor() {
        this.databasePath = path.join(__dirname, 'data', 'towns-database-enhanced.json');
        this.database = null;
    }

    // Load the database
    loadDatabase() {
        try {
            const data = fs.readFileSync(this.databasePath, 'utf8');
            this.database = JSON.parse(data);
            console.log(`📊 Loaded database with ${Object.keys(this.database.towns).length} towns`);
        } catch (error) {
            console.error('❌ Error loading database:', error.message);
            process.exit(1);
        }
    }

    // Display statistics about research notes
    showStatistics() {
        const towns = Object.values(this.database.towns);
        const totalTowns = towns.length;
        const townsWithResearch = towns.filter(town => town.researchNotes && town.researchNotes.length > 0);
        const totalNotes = towns.reduce((sum, town) => sum + (town.researchNotes?.length || 0), 0);
        const avgNotes = Math.round(totalNotes / totalTowns * 100) / 100;

        console.log('\n📊 RESEARCH NOTES STATISTICS:');
        console.log(`   🏘️  Total Towns: ${totalTowns}`);
        console.log(`   📝  Towns with Research Notes: ${townsWithResearch.length}`);
        console.log(`   📄  Total Research Notes: ${totalNotes}`);
        console.log(`   📈  Average Notes per Town: ${avgNotes}`);
        
        // Note type analysis
        const noteTypes = {
            hidden_gem: 0,
            urban_energy: 0,
            community_spirit: 0,
            regional_character: 0,
            research_opportunity: 0,
            historical_mystery: 0,
            cultural_puzzle: 0,
            storytelling_angle: 0,
            future_potential: 0
        };

        towns.forEach(town => {
            if (town.researchNotes) {
                town.researchNotes.forEach(note => {
                    if (note.includes('HIDDEN GEM')) noteTypes.hidden_gem++;
                    if (note.includes('URBAN ENERGY')) noteTypes.urban_energy++;
                    if (note.includes('COMMUNITY SPIRIT')) noteTypes.community_spirit++;
                    if (note.includes('REGIONAL CHARACTER')) noteTypes.regional_character++;
                    if (note.includes('RESEARCH OPPORTUNITY')) noteTypes.research_opportunity++;
                    if (note.includes('HISTORICAL MYSTERY')) noteTypes.historical_mystery++;
                    if (note.includes('CULTURAL PUZZLE')) noteTypes.cultural_puzzle++;
                    if (note.includes('STORYTELLING ANGLE')) noteTypes.storytelling_angle++;
                    if (note.includes('FUTURE POTENTIAL')) noteTypes.future_potential++;
                });
            }
        });

        console.log('\n🏷️  NOTE TYPES DISTRIBUTION:');
        Object.entries(noteTypes).forEach(([type, count]) => {
            console.log(`   ${type.replace(/_/g, ' ').toUpperCase()}: ${count}`);
        });
    }

    // Find towns by criteria
    findTowns(criteria) {
        const towns = Object.entries(this.database.towns).filter(([id, town]) => {
            if (criteria.state && town.state !== criteria.state.toUpperCase()) return false;
            if (criteria.minPopulation && town.population < criteria.minPopulation) return false;
            if (criteria.maxPopulation && town.population > criteria.maxPopulation) return false;
            if (criteria.hasResearchNotes && (!town.researchNotes || town.researchNotes.length === 0)) return false;
            if (criteria.searchText) {
                const searchLower = criteria.searchText.toLowerCase();
                const hasMatch = 
                    town.name.toLowerCase().includes(searchLower) ||
                    (town.researchNotes && town.researchNotes.some(note => note.toLowerCase().includes(searchLower)));
                if (!hasMatch) return false;
            }
            return true;
        });

        return towns.map(([id, town]) => ({ id, ...town }));
    }

    // Display enhanced notes for a specific town
    showTownDetails(townName, state) {
        const townId = `${townName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${state.toLowerCase()}`;
        const town = this.database.towns[townId];
        
        if (!town) {
            console.log(`❌ Town not found: ${townName}, ${state}`);
            return;
        }

        console.log(`\n🏘️  ${town.name}, ${town.state}`);
        console.log(`   Population: ${town.population.toLocaleString()}`);
        console.log(`   Type: ${town.type}`);
        
        if (town.facts && town.facts.length > 0) {
            console.log('\n📚 FACTS:');
            town.facts.forEach((fact, i) => {
                console.log(`   ${i + 1}. ${fact}`);
            });
        }

        if (town.researchNotes && town.researchNotes.length > 0) {
            console.log('\n🔬 AI RESEARCH NOTES:');
            town.researchNotes.forEach((note, i) => {
                console.log(`   ${i + 1}. ${note}`);
            });
        }

        if (town.advancedResearchNotes && town.advancedResearchNotes.length > 0) {
            console.log('\n🧠 ADVANCED RESEARCH NOTES:');
            town.advancedResearchNotes.forEach((note, i) => {
                console.log(`   ${i + 1}. ${note}`);
            });
        }
    }

    // Export filtered data
    exportData(criteria, outputFile) {
        const filteredTowns = this.findTowns(criteria);
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                criteria: criteria,
                totalTowns: filteredTowns.length
            },
            towns: filteredTowns
        };

        const outputPath = path.join(__dirname, outputFile);
        fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
        console.log(`✅ Exported ${filteredTowns.length} towns to ${outputPath}`);
    }

    // Generate a random interesting town
    getRandomInterestingTown() {
        const towns = Object.values(this.database.towns).filter(town => 
            town.researchNotes && town.researchNotes.length > 0
        );
        
        if (towns.length === 0) {
            console.log('❌ No towns with research notes found');
            return;
        }

        const randomTown = towns[Math.floor(Math.random() * towns.length)];
        console.log(`\n🎲 RANDOM INTERESTING TOWN: ${randomTown.name}, ${randomTown.state}`);
        this.showTownDetails(randomTown.name, randomTown.state);
    }

    // Generate summary report
    generateSummaryReport() {
        const towns = Object.values(this.database.towns);
        const report = {
            overview: {
                totalTowns: towns.length,
                enhancedTowns: towns.filter(town => town.researchNotes?.length > 0).length,
                lastUpdated: this.database.metadata.lastEnhanced || 'Unknown'
            },
            states: {},
            populationRanges: {
                'Under 1,000': 0,
                '1,000 - 10,000': 0,
                '10,000 - 50,000': 0,
                '50,000+': 0
            },
            topTowns: []
        };

        // Analyze by state
        towns.forEach(town => {
            if (!report.states[town.state]) {
                report.states[town.state] = { count: 0, enhanced: 0 };
            }
            report.states[town.state].count++;
            if (town.researchNotes?.length > 0) {
                report.states[town.state].enhanced++;
            }

            // Population analysis
            if (town.population < 1000) report.populationRanges['Under 1,000']++;
            else if (town.population < 10000) report.populationRanges['1,000 - 10,000']++;
            else if (town.population < 50000) report.populationRanges['10,000 - 50,000']++;
            else report.populationRanges['50,000+']++;
        });

        // Find top towns by research note count
        report.topTowns = towns
            .filter(town => town.researchNotes?.length > 0)
            .sort((a, b) => (b.researchNotes?.length || 0) - (a.researchNotes?.length || 0))
            .slice(0, 10)
            .map(town => ({
                name: `${town.name}, ${town.state}`,
                population: town.population,
                noteCount: town.researchNotes?.length || 0
            }));

        const reportPath = path.join(__dirname, 'research-summary-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n📋 SUMMARY REPORT GENERATED');
        console.log(`   📄 Report saved to: ${reportPath}`);
        console.log(`   🏘️  Total Towns: ${report.overview.totalTowns}`);
        console.log(`   ✨ Enhanced Towns: ${report.overview.enhancedTowns}`);
        console.log(`   📊 States Covered: ${Object.keys(report.states).length}`);
        
        return report;
    }

    // Interactive CLI
    async runInteractive() {
        console.log('🎯 Welcome to the Research Notes Manager!');
        console.log('Available commands:');
        console.log('  stats - Show statistics');
        console.log('  random - Show a random interesting town');
        console.log('  find <state> - Find towns by state (e.g., find IA)');
        console.log('  show <name> <state> - Show specific town details');
        console.log('  report - Generate summary report');
        console.log('  help - Show this help');
        console.log('  exit - Exit the tool');
        
        // Note: In a real implementation, you'd add readline for interactive input
        // For now, just show the available functionality
        console.log('\n🔧 Use the individual methods for now:');
        console.log('   manager.showStatistics()');
        console.log('   manager.getRandomInterestingTown()');
        console.log('   manager.showTownDetails("Kansas City", "MO")');
        console.log('   manager.generateSummaryReport()');
    }

    // Main execution
    run(command, ...args) {
        this.loadDatabase();
        
        switch(command) {
            case 'stats':
                this.showStatistics();
                break;
            case 'random':
                this.getRandomInterestingTown();
                break;
            case 'show':
                if (args.length >= 2) {
                    this.showTownDetails(args[0], args[1]);
                } else {
                    console.log('Usage: show <townName> <state>');
                }
                break;
            case 'find':
                if (args.length >= 1) {
                    const towns = this.findTowns({ state: args[0] });
                    console.log(`\n🔍 Found ${towns.length} towns in ${args[0]}:`);
                    towns.forEach(town => {
                        console.log(`   ${town.name} (pop: ${town.population.toLocaleString()})`);
                    });
                } else {
                    console.log('Usage: find <state>');
                }
                break;
            case 'report':
                this.generateSummaryReport();
                break;
            case 'interactive':
                this.runInteractive();
                break;
            default:
                console.log('Available commands: stats, random, show, find, report, interactive');
        }
    }
}

// Run if called directly
if (require.main === module) {
    const manager = new ResearchNotesManager();
    const command = process.argv[2] || 'stats';
    const args = process.argv.slice(3);
    manager.run(command, ...args);
}

module.exports = ResearchNotesManager;
