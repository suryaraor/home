#!/usr/bin/env node

/**
 * Analyze duplicate content in towns-database-openai-enhanced.json
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'data', 'towns-database-openai-enhanced.json');

try {
    const data = fs.readFileSync(inputFile, 'utf8');
    const database = JSON.parse(data);
    
    console.log('🔍 Analyzing Duplicate Content in Towns Database...\n');
    
    const townIds = Object.keys(database.towns);
    
    // Track duplicate patterns
    const duplicatePatterns = {
        'Missouri crossroads heritage': 0,
        'What emerging trends or developments might transform': 0,
        'What major events shaped': 0,
        'oldest establishment': 0,
        'What local traditions, festivals, or customs': 0,
        'What surprising businesses or individuals': 0,
        'Iowa agricultural innovation': 0,
        'Every community sits at the edge of change': 0
    };
    
    const exactDuplicates = new Map();
    const templateCount = new Map();
    
    console.log('📊 ANALYZING RESEARCH NOTES PATTERNS:');
    
    townIds.forEach(townId => {
        const town = database.towns[townId];
        
        if (town.researchNotes && Array.isArray(town.researchNotes)) {
            town.researchNotes.forEach(note => {
                // Check for template patterns
                if (note.includes('Missouri\'s crossroads heritage')) duplicatePatterns['Missouri crossroads heritage']++;
                if (note.includes('What emerging trends or developments might transform')) duplicatePatterns['What emerging trends or developments might transform']++;
                if (note.includes('What major events shaped') && note.includes('development?')) duplicatePatterns['What major events shaped']++;
                if (note.includes('oldest establishment')) duplicatePatterns['oldest establishment']++;
                if (note.includes('What local traditions, festivals, or customs')) duplicatePatterns['What local traditions, festivals, or customs']++;
                if (note.includes('What surprising businesses or individuals')) duplicatePatterns['What surprising businesses or individuals']++;
                if (note.includes('Iowa\'s agricultural innovation')) duplicatePatterns['Iowa agricultural innovation']++;
                if (note.includes('Every community sits at the edge of change')) duplicatePatterns['Every community sits at the edge of change']++;
                
                // Track exact duplicates
                if (exactDuplicates.has(note)) {
                    exactDuplicates.set(note, exactDuplicates.get(note) + 1);
                } else {
                    exactDuplicates.set(note, 1);
                }
                
                // Count template usage
                const template = note.split(':')[0] + ':'; // Get the emoji + category part
                if (templateCount.has(template)) {
                    templateCount.set(template, templateCount.get(template) + 1);
                } else {
                    templateCount.set(template, 1);
                }
            });
        }
    });
    
    // Display results
    console.log('\n📋 TEMPLATE PATTERN ANALYSIS:');
    Object.entries(duplicatePatterns).forEach(([pattern, count]) => {
        if (count > 0) {
            console.log(`   ${pattern}: ${count} occurrences`);
        }
    });
    
    console.log('\n🔄 EXACT DUPLICATE RESEARCH NOTES:');
    let exactDuplicateCount = 0;
    exactDuplicates.forEach((count, note) => {
        if (count > 1) {
            exactDuplicateCount++;
            console.log(`   [${count}x] ${note.substring(0, 80)}...`);
        }
    });
    
    console.log('\n📊 TEMPLATE CATEGORIES (most used):');
    const sortedTemplates = Array.from(templateCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    sortedTemplates.forEach(([template, count]) => {
        console.log(`   ${template} ${count} times`);
    });
    
    // Analyze OpenAI insights
    console.log('\n🤖 ANALYZING OPENAI INSIGHTS:');
    let hasInsights = 0;
    let emptyInsights = 0;
    let uniqueInsights = new Set();
    let duplicateInsights = new Map();
    
    townIds.forEach(townId => {
        const town = database.towns[townId];
        
        if (!town.openaiInsights) {
            // Skip
        } else if (town.openaiInsights.length === 0) {
            emptyInsights++;
        } else {
            hasInsights++;
            town.openaiInsights.forEach(insight => {
                if (duplicateInsights.has(insight)) {
                    duplicateInsights.set(insight, duplicateInsights.get(insight) + 1);
                } else {
                    duplicateInsights.set(insight, 1);
                    uniqueInsights.add(insight);
                }
            });
        }
    });
    
    console.log(`   ✅ Towns with AI insights: ${hasInsights}`);
    console.log(`   ⭕ Towns with empty insights: ${emptyInsights}`);
    console.log(`   🎯 Unique AI insights: ${uniqueInsights.size}`);
    
    // Check for duplicate AI insights
    let aiDuplicateCount = 0;
    duplicateInsights.forEach((count, insight) => {
        if (count > 1) {
            aiDuplicateCount++;
        }
    });
    
    console.log(`   🔄 Duplicate AI insights: ${aiDuplicateCount}`);
    
    if (aiDuplicateCount > 0) {
        console.log('\n🔄 DUPLICATE AI INSIGHTS:');
        duplicateInsights.forEach((count, insight) => {
            if (count > 1) {
                console.log(`   [${count}x] ${insight.substring(0, 80)}...`);
            }
        });
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   📋 Total towns: ${townIds.length}`);
    console.log(`   🔄 Exact duplicate research notes: ${exactDuplicateCount}`);
    console.log(`   🤖 Duplicate AI insights: ${aiDuplicateCount}`);
    console.log(`   📝 Template-based research notes detected: High (${duplicatePatterns['What emerging trends or developments might transform']} towns use same template)`);
    
    if (exactDuplicateCount > 50 || aiDuplicateCount > 10) {
        console.log('\n⚠️ RECOMMENDATION: Consider removing or reducing duplicate content for better user experience');
    } else {
        console.log('\n✅ ASSESSMENT: Duplicate levels are manageable, mostly template-based research notes');
    }
    
} catch (error) {
    console.error('❌ Error analyzing database:', error.message);
}
