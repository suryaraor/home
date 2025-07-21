# County Boundaries Implementation Guide

## Data Sources

### 1. US Census Bureau (Recommended)
- **Source**: https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary-file.html
- **Format**: Shapefile, GeoJSON
- **Coverage**: All US counties
- **Resolution**: Multiple levels (500k, 5m, 20m)
- **Cost**: Free

### 2. Natural Earth Data
- **Source**: https://www.naturalearthdata.com/
- **Format**: Shapefile, GeoJSON
- **Coverage**: Global
- **Resolution**: Multiple scales
- **Cost**: Free

### 3. OpenStreetMap via Overpass API
- **Dynamic**: Real-time data
- **Format**: GeoJSON
- **Customizable**: Query specific states/regions
- **Cost**: Free

## File Size Considerations

### For Your Midwest Routes (MO, IL, IN, OH, PA, WI, WV):
- **High Resolution (20m)**: ~50-100MB total
- **Medium Resolution (5m)**: ~10-20MB total  
- **Low Resolution (500k)**: ~2-5MB total

### Recommended Approach:
1. **Medium Resolution (5m)** for visual clarity
2. **State-by-state files** for faster loading
3. **GeoJSON format** for web compatibility

## Implementation Strategy

### Option 1: Pre-downloaded Static Files
```
data/
  counties/
    missouri_counties.geojson
    illinois_counties.geojson
    indiana_counties.geojson
    ohio_counties.geojson
    pennsylvania_counties.geojson
    wisconsin_counties.geojson
    west_virginia_counties.geojson
```

### Option 2: On-demand Loading
- Load county data as user explores regions
- Smaller initial download
- Progressive enhancement

### Option 3: Simplified Boundaries
- Use simplified county boundaries for web performance
- Balance between accuracy and file size

## Integration Benefits

### Visual Enhancement:
- Green-filled county polygons for visited counties
- Gray outlines for unvisited counties
- Hover effects showing county details
- Click to zoom to county bounds

### Functional Enhancement:
- Accurate point-in-polygon detection
- Better route planning visualization
- County progress tracking with real shapes
- Export visited counties map

## Performance Considerations

### Loading Strategy:
1. Load visible counties first
2. Cache downloaded boundaries
3. Use map bounds to determine which counties to display
4. Implement lazy loading for better performance

### Optimization:
- Simplify geometries for web display
- Use appropriate zoom-level detail
- Implement tile-based loading if needed
