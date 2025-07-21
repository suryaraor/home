# US Small Town Boundaries Data

This repository contains tools and scripts to download, process, and use geographic boundary data for small towns and cities across the United States.

## 📁 Files Overview

### Core Tools

- **`download_town_boundaries.py`** - Complete Python script to download official US Census TIGER/Line shapefiles
- **`town-boundaries-manager.js`** - JavaScript library for client-side boundary management
- **`boundaries-demo.html`** - Interactive demo showing how to use the boundary data
- **`requirements.txt`** - Python dependencies

### Data Sources

The tools use multiple data sources:

1. **US Census Bureau TIGER/Line Shapefiles** (Primary)
   - Official government data
   - High accuracy and detail
   - Updated annually
   - Includes all incorporated places

2. **OpenStreetMap Data** (Fallback)
   - Community-maintained
   - Good coverage
   - Real-time updates

3. **Generated Boundaries** (Fallback)
   - Circular boundaries based on population
   - Used when other sources are unavailable

## 🚀 Quick Start

### Option 1: Python Downloader (Recommended for Complete Data)

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Downloader**
   ```bash
   python download_town_boundaries.py
   ```

3. **Choose Download Option**
   - Option 1: Sample states (IL, IN, OH, PA, WI, MO) - Quick test
   - Option 2: All US states - Complete dataset (~500MB)
   - Option 3: Custom state list

4. **Output Files**
   ```
   data/
   ├── us_small_towns_boundaries.geojson     # Complete dataset
   ├── us_small_towns_simplified.geojson     # Simplified for web
   ├── chunks/                               # Individual state files
   │   ├── il_towns.geojson
   │   ├── in_towns.geojson
   │   └── ...
   └── dataset_index.json                    # Metadata
   ```

### Option 2: JavaScript Web Manager (For Web Applications)

1. **Include the Script**
   ```html
   <script src="town-boundaries-manager.js"></script>
   ```

2. **Load Boundaries**
   ```javascript
   // Initialize and load boundaries
   townBoundariesManager.loadBoundaries().then(() => {
       console.log('Boundaries loaded!');
       
       // Get boundary for a specific town
       const kansasCityBoundary = townBoundariesManager.getBoundary('kansascity-mo');
       
       // Get all boundaries for Missouri
       const missouriBoundaries = townBoundariesManager.getBoundariesByState('MO');
       
       // Export as GeoJSON
       const geoJson = townBoundariesManager.exportAsGeoJSON();
   });
   ```

3. **View Demo**
   Open `boundaries-demo.html` in your browser to see an interactive demonstration.

## 🛠️ Python Downloader Features

### Data Processing
- Downloads TIGER/Line shapefiles from US Census Bureau
- Filters for small towns (population < 50,000)
- Converts to web-friendly GeoJSON format
- Creates simplified versions for performance
- Generates state-by-state chunks for efficient loading

### Output Formats
- **Complete Dataset**: Full detail, all towns in one file
- **Simplified Dataset**: Reduced detail for web use
- **State Chunks**: Individual files per state
- **Metadata**: Index file with dataset information

### Customization
```python
# Download specific states only
sample_states = ['CA', 'TX', 'NY', 'FL']
downloader.run_download(sample_states)

# Adjust population filter
small_towns = gdf[gdf['POP20'] < 25000]  # Towns under 25,000

# Change simplification tolerance
gdf['geometry'] = gdf['geometry'].simplify(tolerance=0.005)
```

## 🌐 JavaScript Manager Features

### Automatic Data Management
- Fetches boundary data from multiple sources
- Caches data in localStorage for performance
- Generates fallback boundaries when needed
- Handles coordinate system conversions

### API Methods

```javascript
// Load boundaries (with caching)
await townBoundariesManager.loadBoundaries();

// Get specific town boundary
const boundary = townBoundariesManager.getBoundary('townId');

// Get all boundaries for a state
const stateBoundaries = townBoundariesManager.getBoundariesByState('MO');

// Export as GeoJSON
const geoJson = townBoundariesManager.exportAsGeoJSON();

// Get statistics
const stats = townBoundariesManager.getStats();

// Clear cache
townBoundariesManager.clearCache();
```

### Boundary Object Structure
```javascript
{
    id: "kansascity-mo",
    name: "Kansas City",
    state: "MO",
    lat: 39.0997,
    lng: -94.5786,
    population: 508000,
    boundary: {
        type: "Polygon",
        coordinates: [[[lng, lat], ...]]
    },
    center: [lng, lat],
    radius: 15  // km
}
```

## 🗺️ Integration with Your Towns App

To integrate with your existing `towns.html` application:

1. **Add the JavaScript Manager**
   ```html
   <script src="town-boundaries-manager.js"></script>
   ```

2. **Load Boundaries on Page Load**
   ```javascript
   // Add to your initialization code
   townBoundariesManager.loadBoundaries().then(() => {
       console.log('Town boundaries ready!');
       updateMapWithBoundaries();
   });
   ```

3. **Show Boundaries on Check-in**
   ```javascript
   function performCheckin(townId, isAuto = false) {
       // ... existing check-in code ...
       
       // Add boundary visualization
       const boundary = townBoundariesManager.getBoundary(townId);
       if (boundary && boundary.boundary) {
           const boundaryLayer = L.geoJSON(boundary.boundary, {
               style: {
                   color: '#28a745',
                   weight: 2,
                   opacity: 0.8,
                   fillColor: '#28a745',
                   fillOpacity: 0.2
               }
           });
           boundaryLayer.addTo(map);
           
           // Store reference for cleanup
           townBoundaryLayers.set(townId, boundaryLayer);
       }
   }
   ```

4. **Population-Based Boundary Sizing**
   ```javascript
   function getBoundaryRadius(population) {
       if (population >= 500000) return 15; // Major cities
       if (population >= 100000) return 8;  // Large cities
       if (population >= 50000) return 5;   // Medium cities
       if (population >= 25000) return 3;   // Small cities
       if (population >= 10000) return 2;   // Large towns
       if (population >= 5000) return 1.5;  // Medium towns
       return 1; // Small towns
   }
   ```

## 📊 Data Statistics

### Coverage
- **50 US States + District of Columbia**
- **~19,000+ incorporated places**
- **Cities, Towns, Villages, Boroughs**
- **Population data included (where available)**

### File Sizes (Approximate)
- Complete dataset: ~50-100 MB
- Simplified dataset: ~20-40 MB
- Individual state files: ~500KB - 5MB each
- Cache storage: ~10-30 MB per browser

## ⚡ Performance Tips

### For Web Applications
1. **Use State Chunks**: Load only the states you need
2. **Enable Caching**: Let the manager cache data locally
3. **Simplify Boundaries**: Use simplified versions for better performance
4. **Lazy Loading**: Load boundaries only when needed

### For Large Datasets
1. **Filter by Population**: Focus on towns under certain size
2. **Simplify Geometry**: Reduce coordinate precision
3. **Compress Files**: Use gzip compression for transfers
4. **Database Storage**: Import to PostGIS for complex queries

## 🔧 Troubleshooting

### Common Issues

**Python Script Fails**
```bash
# Install missing dependencies
pip install geopandas shapely fiona

# Update conda if using Anaconda
conda update geopandas
```

**Large File Sizes**
```python
# Increase simplification
gdf['geometry'] = gdf['geometry'].simplify(tolerance=0.01)

# Filter by area
gdf = gdf[gdf['ALAND'] < 1000000]  # Square meters
```

**JavaScript Memory Issues**
```javascript
// Clear cache periodically
if (performance.memory.usedJSHeapSize > 100000000) {
    townBoundariesManager.clearCache();
}

// Load states individually
const statesToLoad = ['MO', 'IL'];
for (const state of statesToLoad) {
    await townBoundariesManager.loadStateChunk(state);
}
```

## 📝 License

This project uses public domain data from the US Census Bureau. The tools and scripts are provided under MIT License.

## 🤝 Contributing

1. **Report Issues**: Create GitHub issues for bugs or feature requests
2. **Improve Data Sources**: Add new boundary data sources
3. **Optimize Performance**: Suggest improvements for large datasets
4. **Add Features**: Enhance the JavaScript manager or Python downloader

## 📚 Additional Resources

- [US Census TIGER/Line Shapefiles](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html)
- [GeoJSON Specification](https://geojson.org/)
- [Leaflet.js Documentation](https://leafletjs.com/)
- [GeoPandas Documentation](https://geopandas.org/)

---

**Need Help?** Open an issue or check the demo file for working examples!
