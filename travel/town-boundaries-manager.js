/**
 * US Small Towns Boundaries Data Manager
 * 
 * This module handles downloading, caching, and using town boundary data
 * for web applications. It provides a lightweight alternative to the
 * Python downloader for client-side use.
 */

class TownBoundariesManager {
    constructor() {
        this.baseUrl = 'data/';
        this.cacheKey = 'usTownBoundaries';
        this.boundaries = new Map();
        this.loaded = false;
        
        // US States for processing
        this.states = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
            'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
            'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
            'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
            'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
            'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
            'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
            'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
            'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
            'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
            'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
        };
    }

    /**
     * Load town boundaries data
     */
    async loadBoundaries() {
        if (this.loaded) return this.boundaries;

        try {
            // Try to load from cache first
            const cached = this.loadFromCache();
            if (cached) {
                this.boundaries = new Map(cached);
                this.loaded = true;
                console.log('✅ Town boundaries loaded from cache');
                return this.boundaries;
            }

            // Download fresh data
            console.log('📥 Downloading town boundaries data...');
            await this.downloadBoundaries();
            this.loaded = true;
            console.log('✅ Town boundaries loaded successfully');
            return this.boundaries;

        } catch (error) {
            console.error('❌ Error loading town boundaries:', error);
            // Return empty map on error
            return new Map();
        }
    }

    /**
     * Download boundaries from multiple sources
     */
    async downloadBoundaries() {
        const sources = [
            {
                name: 'Local US Small Towns',
                url: 'data/us_small_towns_boundaries.geojson',
                type: 'places'
            },
            {
                name: 'Local US Small Towns Simplified',
                url: 'data/us_small_towns_simplified.geojson',
                type: 'backup'
            }
        ];

        for (const source of sources) {
            try {
                const response = await fetch(source.url);
                if (response.ok) {
                    const data = await response.json();
                    this.processBoundaryData(data, source.type);
                    this.saveToCache();
                    return;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to load from ${source.name}:`, error);
                continue;
            }
        }

        // If all sources fail, generate fallback data
        this.generateFallbackBoundaries();
        this.saveToCache();
    }

    /**
     * Process downloaded boundary data
     */
    processBoundaryData(data, type) {
        if (data && data.features) {
            data.features.forEach(feature => {
                if (feature.geometry && feature.properties) {
                    const name = feature.properties.name || feature.properties.NAME;
                    const state = feature.properties.state || feature.properties.STATE;
                    
                    if (name && state) {
                        const id = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${state.toLowerCase()}`;
                        const boundary = this.processGeometry(feature.geometry);
                        
                        if (boundary) {
                            this.boundaries.set(id, {
                                id: id,
                                name: name,
                                state: state,
                                boundary: boundary,
                                center: this.calculateCenter(boundary),
                                radius: this.calculateRadius(boundary)
                            });
                        }
                    }
                }
            });
        }
    }

    /**
     * Generate fallback boundaries for your existing towns
     */
    generateFallbackBoundaries() {
        console.log('🔄 Generating fallback boundaries...');
        
        // Use the towns from your existing data
        const townsList = [
            { name: "Kansas City", state: "MO", lat: 39.0997, lng: -94.5786, population: 508000 },
            { name: "Pittsburgh", state: "PA", lat: 40.4406, lng: -79.9959, population: 300000 },
            { name: "Indianapolis", state: "IN", lat: 39.7684, lng: -86.1581, population: 880000 },
            { name: "Milwaukee", state: "WI", lat: 43.0389, lng: -87.9065, population: 600000 },
            { name: "Columbus", state: "OH", lat: 39.9612, lng: -82.9988, population: 900000 },
            { name: "St. Louis", state: "MO", lat: 38.6270, lng: -90.1994, population: 300000 },
            // Add more towns as needed
        ];

        townsList.forEach(town => {
            const id = `${town.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${town.state.toLowerCase()}`;
            const boundary = this.generateCircularBoundary(town.lat, town.lng, this.getRadiusFromPopulation(town.population));
            
            this.boundaries.set(id, {
                id: id,
                name: town.name,
                state: town.state,
                lat: town.lat,
                lng: town.lng,
                population: town.population,
                boundary: boundary,
                center: [town.lng, town.lat],
                radius: this.getRadiusFromPopulation(town.population)
            });
        });

        console.log(`✅ Generated ${townsList.length} fallback boundaries`);
    }

    /**
     * Generate circular boundary based on population
     */
    generateCircularBoundary(lat, lng, radiusKm) {
        const points = [];
        const numPoints = 20;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i * 2 * Math.PI) / numPoints;
            const deltaLat = (radiusKm / 111.32) * Math.cos(angle);
            const deltaLng = (radiusKm / (111.32 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);
            
            points.push([lng + deltaLng, lat + deltaLat]);
        }
        
        // Close the polygon
        points.push(points[0]);
        
        return {
            type: "Polygon",
            coordinates: [points]
        };
    }

    /**
     * Get radius in km based on population
     */
    getRadiusFromPopulation(population) {
        if (population >= 500000) return 15; // Major cities
        if (population >= 100000) return 8;  // Large cities
        if (population >= 50000) return 5;   // Medium cities
        if (population >= 25000) return 3;   // Small cities
        if (population >= 10000) return 2;   // Large towns
        if (population >= 5000) return 1.5;  // Medium towns
        return 1; // Small towns
    }

    /**
     * Process geometry and convert to consistent format
     */
    processGeometry(geometry) {
        if (!geometry || !geometry.coordinates) return null;
        
        // Ensure we have a valid polygon or multipolygon
        if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
            return geometry;
        }
        
        return null;
    }

    /**
     * Calculate center point of geometry
     */
    calculateCenter(geometry) {
        if (!geometry || !geometry.coordinates) return null;
        
        let allCoords = [];
        
        if (geometry.type === 'Polygon') {
            allCoords = geometry.coordinates[0];
        } else if (geometry.type === 'MultiPolygon') {
            allCoords = geometry.coordinates[0][0];
        }
        
        if (allCoords.length === 0) return null;
        
        const center = allCoords.reduce((acc, coord) => {
            acc[0] += coord[0];
            acc[1] += coord[1];
            return acc;
        }, [0, 0]);
        
        return [center[0] / allCoords.length, center[1] / allCoords.length];
    }

    /**
     * Calculate approximate radius in kilometers
     */
    calculateRadius(geometry) {
        const center = this.calculateCenter(geometry);
        if (!center || !geometry.coordinates) return 1;
        
        let maxDistance = 0;
        let coords = [];
        
        if (geometry.type === 'Polygon') {
            coords = geometry.coordinates[0];
        } else if (geometry.type === 'MultiPolygon') {
            coords = geometry.coordinates[0][0];
        }
        
        coords.forEach(coord => {
            const distance = this.distanceBetweenPoints(center[1], center[0], coord[1], coord[0]);
            maxDistance = Math.max(maxDistance, distance);
        });
        
        return Math.max(0.5, maxDistance); // Minimum 0.5km radius
    }

    /**
     * Calculate distance between two points in kilometers
     */
    distanceBetweenPoints(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Get boundary for a specific town
     */
    getBoundary(townId) {
        return this.boundaries.get(townId);
    }

    /**
     * Get all boundaries for a state
     */
    getBoundariesByState(stateCode) {
        const stateBoundaries = new Map();
        for (const [id, boundary] of this.boundaries) {
            if (boundary.state === stateCode) {
                stateBoundaries.set(id, boundary);
            }
        }
        return stateBoundaries;
    }

    /**
     * Save boundaries to localStorage
     */
    saveToCache() {
        try {
            const data = {
                boundaries: Array.from(this.boundaries.entries()),
                timestamp: Date.now(),
                version: '1.0'
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(data));
            console.log('💾 Boundaries saved to cache');
        } catch (error) {
            console.warn('⚠️ Could not save to cache:', error);
        }
    }

    /**
     * Load boundaries from localStorage
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                const data = JSON.parse(cached);
                const age = Date.now() - data.timestamp;
                const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
                
                if (age < maxAge) {
                    console.log('💾 Loading boundaries from cache');
                    return data.boundaries;
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load from cache:', error);
        }
        return null;
    }

    /**
     * Clear cache
     */
    clearCache() {
        localStorage.removeItem(this.cacheKey);
        this.boundaries.clear();
        this.loaded = false;
        console.log('🗑️ Cache cleared');
    }

    /**
     * Export boundaries as GeoJSON
     */
    exportAsGeoJSON() {
        const features = Array.from(this.boundaries.values()).map(boundary => ({
            type: "Feature",
            properties: {
                id: boundary.id,
                name: boundary.name,
                state: boundary.state,
                population: boundary.population || null,
                radius_km: boundary.radius
            },
            geometry: boundary.boundary
        }));

        return {
            type: "FeatureCollection",
            features: features,
            metadata: {
                total_boundaries: features.length,
                created_date: new Date().toISOString(),
                source: "TownBoundariesManager"
            }
        };
    }

    /**
     * Get statistics about loaded boundaries
     */
    getStats() {
        const stats = {
            total: this.boundaries.size,
            byState: {}
        };

        for (const boundary of this.boundaries.values()) {
            if (!stats.byState[boundary.state]) {
                stats.byState[boundary.state] = 0;
            }
            stats.byState[boundary.state]++;
        }

        return stats;
    }
}

// Create global instance
window.townBoundariesManager = new TownBoundariesManager();

// Example usage:
/*
// Initialize and load boundaries
townBoundariesManager.loadBoundaries().then(() => {
    console.log('Boundaries loaded!');
    
    // Get boundary for a specific town
    const kansasCityBoundary = townBoundariesManager.getBoundary('kansascity-mo');
    
    // Get all boundaries for Missouri
    const missouriBoundaries = townBoundariesManager.getBoundariesByState('MO');
    
    // Export as GeoJSON
    const geoJson = townBoundariesManager.exportAsGeoJSON();
    
    // Get statistics
    const stats = townBoundariesManager.getStats();
    console.log('Boundary stats:', stats);
});
*/
