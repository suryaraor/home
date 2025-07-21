#!/usr/bin/env node

/**
 * Travel App Integration Script
 * Updates the travel app to display OpenAI-enhanced insights
 */

const fs = require('fs');
const path = require('path');

class TravelAppIntegrator {
    constructor() {
        this.htmlPath = path.join(__dirname, '..', 'towns.html');
        this.databasePath = path.join(__dirname, 'data', 'towns-database-openai-enhanced.json');
    }

    // Update the HTML file to use OpenAI-enhanced database
    updateTravelApp() {
        try {
            let htmlContent = fs.readFileSync(this.htmlPath, 'utf8');
            
            // Update database path
            htmlContent = htmlContent.replace(
                /const response = await fetch\('\.\/scripts\/data\/towns-database-enhanced\.json'\);/,
                "const response = await fetch('./scripts/data/towns-database-openai-enhanced.json');"
            );
            
            // Update console message
            htmlContent = htmlContent.replace(
                /console\.log\('📚 Loaded enhanced external town database with AI research notes'\);/,
                "console.log('🤖 Loaded OpenAI-enhanced town database with professional insights');"
            );
            
            // Update the overlay function to include OpenAI insights
            const overlayInsertPoint = htmlContent.indexOf('<!-- Enhanced Research Notes Section -->');
            if (overlayInsertPoint !== -1) {
                const openaiSection = `
                    <!-- OpenAI Professional Insights Section -->
                    \${townData.openaiInsights && townData.openaiInsights.length > 0 
                        ? \`
                        <div style="text-align: left; margin: 20px 0;">
                            <h4 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 1.2rem; text-align: center;">
                                🤖 Professional Travel Insights
                            </h4>
                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 10px; background: linear-gradient(135deg, #fff5f5, #ffeaea);">
                                \${townData.openaiInsights.map((insight, index) => \`
                                    <div style="
                                        background: linear-gradient(135deg, #ffffff, #f8f9fa);
                                        border-left: 4px solid #e74c3c;
                                        padding: 12px 15px;
                                        margin: 8px 0;
                                        border-radius: 6px;
                                        font-size: 0.95rem;
                                        line-height: 1.4;
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                                    ">
                                        \${insight}
                                    </div>
                                \`).join('')}
                            </div>
                        </div>
                        \` : ''}
                    
                    <!-- Enhanced Research Notes Section -->`;
                
                htmlContent = htmlContent.replace('<!-- Enhanced Research Notes Section -->', openaiSection);
            }
            
            fs.writeFileSync(this.htmlPath, htmlContent);
            console.log('✅ Travel app updated to use OpenAI-enhanced insights');
            
        } catch (error) {
            console.error('❌ Error updating travel app:', error.message);
        }
    }

    // Check if OpenAI database exists
    checkOpenAIDatabase() {
        if (fs.existsSync(this.databasePath)) {
            console.log('✅ OpenAI-enhanced database found');
            return true;
        } else {
            console.log('❌ OpenAI-enhanced database not found');
            console.log('   Run the OpenAI enhancement script first:');
            console.log('   node openai-enhance-towns.js your_api_key');
            return false;
        }
    }

    // Display sample OpenAI insights
    showSampleInsights() {
        if (!this.checkOpenAIDatabase()) return;
        
        try {
            const database = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
            const towns = Object.values(database.towns).filter(town => town.openaiInsights);
            
            if (towns.length === 0) {
                console.log('❌ No OpenAI-enhanced towns found in database');
                return;
            }
            
            const sampleTown = towns[Math.floor(Math.random() * towns.length)];
            
            console.log(`\n🎯 SAMPLE OPENAI INSIGHTS - ${sampleTown.name}, ${sampleTown.state}:`);
            console.log(`   Population: ${sampleTown.population.toLocaleString()}`);
            console.log('');
            
            sampleTown.openaiInsights.forEach((insight, i) => {
                console.log(`   ${i + 1}. ${insight}`);
            });
            
            console.log('');
            console.log('🌟 Notice how much more specific, creative, and engaging these are!');
            
        } catch (error) {
            console.error('❌ Error reading OpenAI database:', error.message);
        }
    }

    // Main execution
    run(command) {
        console.log('🔧 Travel App Integration Tool');
        console.log('');
        
        switch(command) {
            case 'update':
                this.updateTravelApp();
                break;
            case 'check':
                this.checkOpenAIDatabase();
                break;
            case 'sample':
                this.showSampleInsights();
                break;
            default:
                console.log('Available commands:');
                console.log('  update - Update travel app to use OpenAI insights');
                console.log('  check  - Check if OpenAI database exists');
                console.log('  sample - Show sample OpenAI insights');
                console.log('');
                console.log('Usage: node travel-app-integrator.js [command]');
        }
    }
}

// Run if called directly
if (require.main === module) {
    const integrator = new TravelAppIntegrator();
    const command = process.argv[2] || 'check';
    integrator.run(command);
}

module.exports = TravelAppIntegrator;
