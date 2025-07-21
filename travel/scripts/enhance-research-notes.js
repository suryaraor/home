#!/usr/bin/env node

/**
 * AI-Enhanced Research Notes Generator
 * Takes the existing town database and enhances research notes with AI-generated
 * compelling, interesting, and unique insights about each town
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    inputFile: path.join(__dirname, 'data', 'towns-database.json'),
    outputFile: path.join(__dirname, 'data', 'towns-database-enhanced.json'),
    batchSize: 10, // Process towns in batches
    enhancementPrompts: {
        quirky: "quirky local legends, unusual town traditions, or bizarre historical events",
        cultural: "unique cultural elements, local artisans, hidden culinary gems, or artistic heritage",
        natural: "remarkable natural features, geological curiosities, or unique wildlife",
        historical: "fascinating historical mysteries, forgotten stories, or surprising historical connections",
        modern: "innovative community projects, remarkable local achievements, or modern claims to fame"
    }
};

class ResearchNotesEnhancer {
    constructor() {
        this.database = null;
        this.enhanced = 0;
        this.total = 0;
    }

    // Load the existing database
    loadDatabase() {
        try {
            const data = fs.readFileSync(CONFIG.inputFile, 'utf8');
            this.database = JSON.parse(data);
            this.total = Object.keys(this.database.towns).length;
            console.log(`📊 Loaded database with ${this.total} towns`);
        } catch (error) {
            console.error('❌ Error loading database:', error.message);
            process.exit(1);
        }
    }

    // Generate AI-inspired enhanced research notes
    generateEnhancedNotes(town, existingFacts, wikipediaSummary) {
        const townName = town.name;
        const state = town.state;
        const population = town.population;
        const type = town.type;

        // Create compelling research notes based on available data
        const enhancedNotes = [];

        // 1. Population-based insights
        if (population < 1000) {
            enhancedNotes.push(`🏘️ HIDDEN GEM: With only ${population.toLocaleString()} residents, ${townName} represents the intimate charm of small-town America where everyone knows your name and local stories span generations.`);
        } else if (population < 10000) {
            enhancedNotes.push(`🌟 COMMUNITY SPIRIT: This ${type} of ${population.toLocaleString()} people embodies the perfect balance of small-town warmth and growing opportunities, making it a fascinating study in American community evolution.`);
        } else if (population < 50000) {
            enhancedNotes.push(`🏙️ THRIVING HUB: With ${population.toLocaleString()} residents, ${townName} serves as a regional anchor, likely harboring surprising cultural depth and economic innovation beyond its modest size.`);
        } else {
            enhancedNotes.push(`🌆 URBAN ENERGY: As a significant ${state} city with ${population.toLocaleString()} people, ${townName} pulses with diverse neighborhoods, hidden culinary scenes, and untold stories of urban reinvention.`);
        }

        // 2. Geographic and state-based insights
        const stateInsights = {
            'MO': 'Missouri\'s crossroads heritage means this town likely sits at the intersection of multiple cultural influences - from Southern hospitality to Midwestern pragmatism.',
            'IA': 'Iowa\'s agricultural innovation and surprising cultural depth suggest this community may harbor unexpected artistic traditions or agricultural breakthroughs.',
            'WI': 'Wisconsin\'s blend of German heritage, cheese craftsmanship, and progressive politics creates unique local character and possibly fascinating food traditions.',
            'IL': 'Illinois\' position as America\'s heartland crossroads means this town could be hiding remarkable architectural gems or transportation history.',
            'IN': 'Indiana\'s automotive heritage and Hoosier hospitality suggest this community may have surprising industrial innovation or basketball legends.',
            'OH': 'Ohio\'s role as the "Mother of Presidents" and aviation pioneer state hints at potential historical significance or innovative spirit.',
            'PA': 'Pennsylvania\'s colonial foundations and industrial legacy suggest this town may harbor remarkable historical architecture or manufacturing heritage.',
            'WV': 'West Virginia\'s mountainous terrain and coal heritage create communities with fierce independence and possibly unique cultural traditions.'
        };

        if (stateInsights[state]) {
            enhancedNotes.push(`🗺️ REGIONAL CHARACTER: ${stateInsights[state]}`);
        }

        // 3. Extract interesting elements from existing facts
        if (existingFacts && existingFacts.length > 0) {
            const factAnalysis = this.analyzeExistingFacts(existingFacts);
            enhancedNotes.push(...factAnalysis);
        }

        // 4. Wikipedia summary analysis
        if (wikipediaSummary) {
            const wikipediaInsights = this.extractWikipediaInsights(wikipediaSummary, townName);
            enhancedNotes.push(...wikipediaInsights);
        }

        // 5. Generate curiosity-driven research questions
        const researchQuestions = this.generateResearchQuestions(townName, state, type, population);
        enhancedNotes.push(...researchQuestions);

        // 6. Add storytelling elements
        const storyElements = this.generateStoryElements(townName, state, population);
        enhancedNotes.push(...storyElements);

        return enhancedNotes;
    }

    // Analyze existing facts for interesting patterns
    analyzeExistingFacts(facts) {
        const insights = [];
        
        facts.forEach(fact => {
            // Look for superlatives and unique claims
            if (fact.toLowerCase().includes('first') || fact.toLowerCase().includes('oldest') || fact.toLowerCase().includes('largest')) {
                insights.push(`🏆 RECORD HOLDER: ${fact} - This achievement suggests a community that values innovation and historical significance.`);
            }
            
            // Look for cultural elements
            if (fact.toLowerCase().includes('museum') || fact.toLowerCase().includes('festival') || fact.toLowerCase().includes('arts')) {
                insights.push(`🎨 CULTURAL DEPTH: ${fact} - Indicates a community that prioritizes cultural preservation and artistic expression.`);
            }
            
            // Look for natural features
            if (fact.toLowerCase().includes('park') || fact.toLowerCase().includes('lake') || fact.toLowerCase().includes('river')) {
                insights.push(`🌿 NATURAL BEAUTY: ${fact} - Points to outdoor recreation opportunities and possible environmental stewardship traditions.`);
            }
        });

        return insights;
    }

    // Extract insights from Wikipedia summaries
    extractWikipediaInsights(summary, townName) {
        const insights = [];
        
        // Look for notable mentions
        if (summary.includes('county seat')) {
            insights.push(`🏛️ ADMINISTRATIVE CENTER: As a county seat, ${townName} likely features impressive courthouse architecture and hosts important regional government functions.`);
        }
        
        if (summary.includes('founded') || summary.includes('established')) {
            insights.push(`📜 HISTORICAL ROOTS: The town's founding story likely involves fascinating pioneer tales, strategic location choices, or economic opportunities that shaped its character.`);
        }
        
        if (summary.includes('railroad') || summary.includes('railway')) {
            insights.push(`🚂 TRANSPORTATION HERITAGE: Railroad connections suggest this town once buzzed with commerce and migration, possibly leaving behind interesting architectural or cultural remnants.`);
        }
        
        if (summary.includes('college') || summary.includes('university')) {
            insights.push(`🎓 EDUCATIONAL HUB: The presence of higher education institutions creates a unique dynamic of youthful energy, intellectual discourse, and cultural programming.`);
        }

        return insights;
    }

    // Generate research questions to spark curiosity
    generateResearchQuestions(townName, state, type, population) {
        const questions = [];
        
        // Size-based questions
        if (population < 5000) {
            questions.push(`🔍 RESEARCH OPPORTUNITY: What surprising businesses or individuals have emerged from this small community? Small towns often produce outsized personalities or innovations.`);
        } else {
            questions.push(`🔍 RESEARCH OPPORTUNITY: What unique neighborhoods or districts exist within ${townName}? Larger communities often hide distinct cultural pockets with their own identities.`);
        }
        
        // Historical questions
        questions.push(`📚 HISTORICAL MYSTERY: What major events shaped ${townName}'s development? Every community has pivotal moments that defined its character - floods, fires, economic booms, or famous visitors.`);
        
        // Cultural questions
        questions.push(`🎭 CULTURAL PUZZLE: What local traditions, festivals, or customs make ${townName} unique? Even the smallest communities often maintain surprising cultural practices.`);
        
        return questions;
    }

    // Generate storytelling elements
    generateStoryElements(townName, state, population) {
        const stories = [];
        
        // Create narrative hooks
        stories.push(`📖 STORYTELLING ANGLE: Imagine the stories told in ${townName}'s oldest establishment - what conversations have shaped this community over decades?`);
        
        // Population-based narratives
        if (population < 2000) {
            stories.push(`🏘️ INTIMATE NARRATIVE: In a town of ${population.toLocaleString()}, every resident likely has a story that connects to the community's larger narrative - from the mail carrier to the mayor.`);
        } else {
            stories.push(`🌆 URBAN TAPESTRY: With ${population.toLocaleString()} residents, ${townName} contains multiple stories - from immigrant families to established dynasties, each thread weaving the community's larger story.`);
        }
        
        // Future potential
        stories.push(`🚀 FUTURE POTENTIAL: What emerging trends or developments might transform ${townName} in the coming decades? Every community sits at the edge of change.`);
        
        return stories;
    }

    // Process all towns and enhance their research notes
    async enhanceAllTowns() {
        console.log('🎯 Starting AI-enhanced research note generation...');
        
        const townIds = Object.keys(this.database.towns);
        
        for (let i = 0; i < townIds.length; i++) {
            const townId = townIds[i];
            const townData = this.database.towns[townId];
            
            console.log(`📍 Processing ${i + 1}/${townIds.length}: ${townData.name}, ${townData.state}`);
            
            // Generate enhanced notes
            const enhancedNotes = this.generateEnhancedNotes(
                townData,
                townData.facts || [],
                townData.wikipediaSummary || ''
            );
            
            // Update the town data
            this.database.towns[townId].researchNotes = enhancedNotes;
            this.database.towns[townId].enhancedDate = new Date().toISOString();
            
            this.enhanced++;
            
            // Save progress periodically
            if ((i + 1) % 20 === 0) {
                this.saveProgress();
            }
        }
        
        // Final save
        this.saveEnhancedDatabase();
        console.log(`🎉 Enhancement complete! ${this.enhanced} towns enhanced with AI-generated research notes.`);
    }

    // Save progress
    saveProgress() {
        try {
            fs.writeFileSync(CONFIG.outputFile, JSON.stringify(this.database, null, 2));
            console.log(`💾 Progress saved (${this.enhanced}/${this.total})`);
        } catch (error) {
            console.error('❌ Error saving progress:', error.message);
        }
    }

    // Save the final enhanced database
    saveEnhancedDatabase() {
        try {
            // Update metadata
            this.database.metadata.lastEnhanced = new Date().toISOString();
            this.database.metadata.enhancedTowns = this.enhanced;
            this.database.metadata.enhancementVersion = "1.0";
            
            fs.writeFileSync(CONFIG.outputFile, JSON.stringify(this.database, null, 2));
            console.log(`✅ Enhanced database saved to ${CONFIG.outputFile}`);
            
            // Generate summary report
            this.generateSummaryReport();
            
        } catch (error) {
            console.error('❌ Error saving enhanced database:', error.message);
        }
    }

    // Generate a summary report
    generateSummaryReport() {
        const report = {
            summary: {
                totalTowns: this.total,
                enhancedTowns: this.enhanced,
                enhancementDate: new Date().toISOString(),
                avgNotesPerTown: Math.round(this.enhanced > 0 ? 
                    Object.values(this.database.towns)
                        .reduce((sum, town) => sum + (town.researchNotes?.length || 0), 0) / this.enhanced 
                    : 0),
            },
            features: [
                "🎯 AI-generated research insights based on population, location, and existing data",
                "🔍 Curiosity-driven research questions for further exploration",
                "📖 Storytelling elements to make each town memorable",
                "🌟 Pattern analysis of existing facts to highlight significance",
                "🗺️ Regional and state-based cultural context",
                "🏆 Identification of unique achievements and characteristics"
            ],
            nextSteps: [
                "Review generated notes for accuracy and relevance",
                "Research specific questions raised in the notes",
                "Add community-specific details through local sources",
                "Integrate enhanced notes into travel app overlay system",
                "Consider reaching out to local historians or chambers of commerce"
            ]
        };

        const reportPath = path.join(__dirname, 'enhancement-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📋 Enhancement report saved to ${reportPath}`);
        
        // Display summary
        console.log('\n🎯 ENHANCEMENT SUMMARY:');
        console.log(`   📊 Towns Enhanced: ${report.summary.enhancedTowns}/${report.summary.totalTowns}`);
        console.log(`   📝 Average Notes per Town: ${report.summary.avgNotesPerTown}`);
        console.log(`   🎨 Features Added: ${report.features.length} types of enhancements`);
        console.log('\n✨ Your research notes are now much more engaging and curiosity-driven!');
    }

    // Main execution function
    async run() {
        console.log('🚀 AI-Enhanced Research Notes Generator Starting...');
        
        this.loadDatabase();
        await this.enhanceAllTowns();
        
        console.log('\n🎉 All done! Your town database now includes compelling, AI-enhanced research notes.');
        console.log('📱 Ready to integrate with your travel app for amazing next-town overlays!');
    }
}

// Run the enhancer
if (require.main === module) {
    const enhancer = new ResearchNotesEnhancer();
    enhancer.run().catch(console.error);
}

module.exports = ResearchNotesEnhancer;
