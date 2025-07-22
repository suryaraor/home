#!/usr/bin/env node

/**
 * Quick script to check the status of AI insights in the towns database
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'data', 'towns-database-openai-enhanced.json');

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const database = JSON.parse(data);
    
    const townIds = Object.keys(database.towns);
    let hasInsights = 0;
    let emptyInsights = 0;
    let noInsightsProperty = 0;
    
    console.log('🔍 Analyzing AI Insights Status...\n');
    
    townIds.forEach(townId => {
        const town = database.towns[townId];
        
        if (!town.openaiInsights) {
            noInsightsProperty++;
            console.log(`❌ ${town.name}, ${town.state} - No openaiInsights property`);
        } else if (town.openaiInsights.length === 0) {
            emptyInsights++;
            console.log(`⭕ ${town.name}, ${town.state} - Empty openaiInsights array`);
        } else {
            hasInsights++;
            console.log(`✅ ${town.name}, ${town.state} - Has ${town.openaiInsights.length} insights`);
        }
    });
    
    console.log('\n📊 SUMMARY:');
    console.log(`   ✅ Towns with AI insights: ${hasInsights}`);
    console.log(`   ⭕ Towns with empty insights: ${emptyInsights}`);
    console.log(`   ❌ Towns without insights property: ${noInsightsProperty}`);
    console.log(`   🔄 Towns needing processing: ${emptyInsights + noInsightsProperty}`);
    console.log(`   📋 Total towns: ${townIds.length}`);
    
} catch (error) {
    console.error('❌ Error reading database:', error.message);
}
