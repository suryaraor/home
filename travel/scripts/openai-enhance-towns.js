#!/usr/bin/env node

/**
 * OpenAI-Powered Town Research Enhancement
 * Uses OpenAI GPT models to generate genuinely interesting, creative,
 * and engaging research notes for small towns and cities
 */

const fs = require('fs');
const path = require('path');

// You'll need to install the OpenAI package first:
// npm install openai

let OpenAI;
try {
    OpenAI = require('openai');
} catch (error) {
    console.error('❌ OpenAI package not found. Please install it first:');
    console.error('   npm install openai');
    process.exit(1);
}

// Configuration
const CONFIG = {
    inputFile: path.join(__dirname, 'data', 'towns-database-enhanced.json'),
    outputFile: path.join(__dirname, 'data', 'towns-database-openai-enhanced.json'),
    
    // OpenAI Settings
    model: 'gpt-4', // or 'gpt-3.5-turbo' for faster/cheaper requests
    maxTokens: 800,
    temperature: 0.8, // Higher = more creative, Lower = more factual
    
    // Rate limiting (to respect API limits and costs)
    delayBetweenRequests: 2000, // 2 seconds between requests
    batchSize: 5, // Save progress every 5 towns
    
    // Cost estimation (approximate)
    estimatedCostPerTown: 0.03, // USD per town (varies by model and response length)
};

class OpenAITownEnhancer {
    constructor(apiKey) {
        if (!apiKey) {
            console.error('❌ OpenAI API key is required');
            process.exit(1);
        }
        
        this.openai = new OpenAI({
            apiKey: apiKey
        });
        
        this.database = null;
        this.enhanced = 0;
        this.totalCost = 0;
    }

    // Load the existing database
    loadDatabase() {
        try {
            const data = fs.readFileSync(CONFIG.inputFile, 'utf8');
            this.database = JSON.parse(data);
            const totalTowns = Object.keys(this.database.towns).length;
            console.log(`📊 Loaded database with ${totalTowns} towns`);
            
            // Cost estimation
            const estimatedTotalCost = totalTowns * CONFIG.estimatedCostPerTown;
            console.log(`💰 Estimated API cost: $${estimatedTotalCost.toFixed(2)} (${totalTowns} towns × ~$${CONFIG.estimatedCostPerTown})`);
            
            return totalTowns;
        } catch (error) {
            console.error('❌ Error loading database:', error.message);
            process.exit(1);
        }
    }

    // Generate OpenAI prompt for a specific town
    generatePrompt(town, existingFacts, wikipediaSummary) {
        const prompt = `You are a creative travel writer and local historian specializing in American small towns and cities. Your task is to generate fascinating, unique, and genuinely interesting insights about ${town.name}, ${town.state}.

TOWN INFORMATION:
- Name: ${town.name}, ${town.state}
- Population: ${town.population.toLocaleString()}
- Type: ${town.type}
- Wikipedia Summary: ${wikipediaSummary || 'Not available'}
- Known Facts: ${existingFacts && existingFacts.length > 0 ? existingFacts.join('; ') : 'Limited information available'}

TASK: Generate 6-8 compelling research insights that would make travelers excited to visit or learn more about this place. Focus on:

1. **Hidden Stories**: What untold or lesser-known stories might this place hold?
2. **Cultural Quirks**: What unique local customs, traditions, or characteristics might exist?
3. **Historical Mysteries**: What intriguing historical questions or connections might be worth exploring?
4. **Local Character**: What gives this place its distinctive personality and charm?
5. **Surprising Connections**: How might this place connect to larger American stories or unexpected themes?
6. **Future Potential**: What interesting developments or changes might be happening?

STYLE REQUIREMENTS:
- Each insight should be 1-2 sentences
- Use engaging, curiosity-sparking language
- Include specific, plausible details (even if speculative)
- Make each insight feel fresh and surprising
- Avoid generic statements that could apply to any town
- Use emojis sparingly but effectively
- Be respectful and positive about the community

FORMAT: Return exactly 6-8 insights, each on a new line, starting with an emoji and category tag like "🏛️ HISTORICAL INTRIGUE:" or "🎭 LOCAL CHARACTER:".

Example format:
🏛️ HISTORICAL INTRIGUE: The positioning near [geographic feature] suggests this town may have played a role in [historical context] that local records might not fully capture.
🎭 LOCAL CHARACTER: A community this size likely has [specific local tradition] where [interesting detail about community dynamics].

Generate insights that feel authentic to ${town.name}, ${town.state} specifically:`;

        return prompt;
    }

    // Call OpenAI API to enhance a town
    async enhanceTownWithOpenAI(town, existingFacts, wikipediaSummary) {
        try {
            const prompt = this.generatePrompt(town, existingFacts, wikipediaSummary);
            
            console.log(`🤖 Requesting OpenAI enhancement for ${town.name}, ${town.state}...`);
            
            const response = await this.openai.chat.completions.create({
                model: CONFIG.model,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: CONFIG.maxTokens,
                temperature: CONFIG.temperature,
            });

            const insights = response.choices[0].message.content.trim();
            
            // Parse the insights into an array
            const insightLines = insights.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && line.includes(':'));

            // Track usage for cost estimation
            const tokensUsed = response.usage.total_tokens;
            const estimatedCost = (tokensUsed / 1000) * 0.03; // Rough estimate for GPT-4
            this.totalCost += estimatedCost;

            console.log(`✅ Generated ${insightLines.length} insights (${tokensUsed} tokens, ~$${estimatedCost.toFixed(3)})`);
            
            return insightLines;

        } catch (error) {
            console.error(`❌ Error enhancing ${town.name}: ${error.message}`);
            
            // Return fallback insights if API fails
            return [
                `🔍 RESEARCH OPPORTUNITY: ${town.name} represents the authentic character of ${town.state} communities, with stories waiting to be discovered.`,
                `🏛️ HISTORICAL CONTEXT: This ${town.type} of ${town.population.toLocaleString()} likely has fascinating local history shaped by regional development patterns.`,
                `🎭 COMMUNITY SPIRIT: Small communities like this often maintain unique traditions and social dynamics that reflect broader American values.`
            ];
        }
    }

    // Add delay between API calls
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Process all towns with OpenAI enhancement
    async enhanceAllTowns() {
        console.log('🚀 Starting OpenAI-powered town enhancement...');
        console.log(`⚙️ Using model: ${CONFIG.model}`);
        console.log(`⏱️ Delay between requests: ${CONFIG.delayBetweenRequests}ms`);
        console.log('');
        
        const townIds = Object.keys(this.database.towns);
        
        for (let i = 0; i < townIds.length; i++) {
            const townId = townIds[i];
            const townData = this.database.towns[townId];
            
            console.log(`📍 Processing ${i + 1}/${townIds.length}: ${townData.name}, ${townData.state}`);
            
            // Skip if already enhanced with OpenAI
            if (townData.openaiEnhanced) {
                console.log(`⏭️ Already enhanced, skipping...`);
                continue;
            }
            
            // Get OpenAI enhancement
            const openaiInsights = await this.enhanceTownWithOpenAI(
                townData,
                townData.facts || [],
                townData.wikipediaSummary || ''
            );
            
            // Add to town data
            townData.openaiInsights = openaiInsights;
            townData.openaiEnhanced = new Date().toISOString();
            townData.openaiModel = CONFIG.model;
            
            this.enhanced++;
            
            // Save progress periodically
            if ((i + 1) % CONFIG.batchSize === 0) {
                this.saveProgress();
            }
            
            // Rate limiting delay
            if (i < townIds.length - 1) { // Don't delay after the last request
                await this.delay(CONFIG.delayBetweenRequests);
            }
        }
        
        this.saveFinalDatabase();
    }

    // Save progress
    saveProgress() {
        try {
            fs.writeFileSync(CONFIG.outputFile, JSON.stringify(this.database, null, 2));
            console.log(`💾 Progress saved (${this.enhanced} towns enhanced, cost: ~$${this.totalCost.toFixed(2)})`);
        } catch (error) {
            console.error('❌ Error saving progress:', error.message);
        }
    }

    // Save final enhanced database
    saveFinalDatabase() {
        try {
            // Update metadata
            this.database.metadata.lastOpenAIEnhanced = new Date().toISOString();
            this.database.metadata.openaiEnhancedTowns = this.enhanced;
            this.database.metadata.openaiModel = CONFIG.model;
            this.database.metadata.estimatedOpenAICost = this.totalCost;
            
            fs.writeFileSync(CONFIG.outputFile, JSON.stringify(this.database, null, 2));
            console.log(`✅ OpenAI-enhanced database saved to ${CONFIG.outputFile}`);
            
            this.generateEnhancementReport();
            
        } catch (error) {
            console.error('❌ Error saving final database:', error.message);
        }
    }

    // Generate enhancement report
    generateEnhancementReport() {
        const report = {
            summary: {
                totalTowns: Object.keys(this.database.towns).length,
                openaiEnhancedTowns: this.enhanced,
                enhancementDate: new Date().toISOString(),
                modelUsed: CONFIG.model,
                estimatedCost: this.totalCost,
                avgInsightsPerTown: this.enhanced > 0 ? 
                    Math.round(Object.values(this.database.towns)
                        .reduce((sum, town) => sum + (town.openaiInsights?.length || 0), 0) / this.enhanced * 100) / 100
                    : 0
            },
            features: [
                "🤖 OpenAI GPT-powered creative insights",
                "🎯 Town-specific, non-generic content",
                "🏛️ Historical intrigue and mysteries",
                "🎭 Local character and cultural quirks",
                "🔍 Hidden stories and surprising connections",
                "🚀 Future potential and developments",
                "📚 Professional travel writing style",
                "💡 Curiosity-sparking narratives"
            ],
            recommendations: [
                "Review generated insights for accuracy and local appropriateness",
                "Consider reaching out to local historians to verify interesting claims",
                "Use insights as starting points for deeper research",
                "Integrate with travel app overlay for enhanced user experience",
                "Share interesting discoveries with local communities",
                "Consider creating social media content from the insights"
            ]
        };

        const reportPath = path.join(__dirname, 'openai-enhancement-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log('\n🎯 OPENAI ENHANCEMENT COMPLETE!');
        console.log(`   🤖 Model Used: ${report.summary.modelUsed}`);
        console.log(`   🏘️ Towns Enhanced: ${report.summary.openaiEnhancedTowns}/${report.summary.totalTowns}`);
        console.log(`   📝 Avg Insights per Town: ${report.summary.avgInsightsPerTown}`);
        console.log(`   💰 Estimated Cost: $${report.summary.estimatedCost.toFixed(2)}`);
        console.log(`   📋 Report saved to: ${reportPath}`);
        
        return report;
    }

    // Main execution function
    async run() {
        console.log('🤖 OpenAI Town Enhancement Starting...');
        
        const totalTowns = this.loadDatabase();
        
        // Confirm before proceeding
        console.log('\n⚠️ IMPORTANT: This will make API calls to OpenAI');
        console.log(`   📊 Towns to process: ${totalTowns}`);
        console.log(`   💰 Estimated cost: $${(totalTowns * CONFIG.estimatedCostPerTown).toFixed(2)}`);
        console.log(`   ⏱️ Estimated time: ${Math.round(totalTowns * CONFIG.delayBetweenRequests / 1000 / 60)} minutes`);
        console.log('\n🚀 Starting enhancement in 3 seconds...');
        
        await this.delay(3000);
        
        await this.enhanceAllTowns();
        
        console.log('\n🎉 OpenAI enhancement complete!');
        console.log('📱 Your town insights are now dramatically more interesting and engaging!');
    }
}

// Command line interface
async function main() {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY || process.argv[2];
    
    if (!apiKey) {
        console.log('🔑 OpenAI API Key Required');
        console.log('');
        console.log('Method 1 - Environment Variable:');
        console.log('   set OPENAI_API_KEY=your_api_key_here');
        console.log('   node openai-enhance-towns.js');
        console.log('');
        console.log('Method 2 - Command Line Argument:');
        console.log('   node openai-enhance-towns.js your_api_key_here');
        console.log('');
        console.log('Method 3 - Interactive:');
        console.log('   Just provide your API key when prompted');
        console.log('');
        
        // Interactive input (simplified for demo)
        console.log('Please provide your OpenAI API key as a command line argument for now.');
        process.exit(1);
    }
    
    console.log('🔑 API Key provided, initializing...');
    
    const enhancer = new OpenAITownEnhancer(apiKey);
    await enhancer.run();
}

// Export for use as module
module.exports = OpenAITownEnhancer;

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    });
}
