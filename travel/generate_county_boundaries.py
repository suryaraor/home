#!/usr/bin/env python3
"""
Alternative County Boundaries Generator
Since the Census files are not accessible, we'll create simplified county boundaries
"""

import json
import os
from pathlib import Path

# County data for your route states
COUNTIES_DATA = {
    'IL': {
        'name': 'Illinois',
        'fips': '17',
        'counties': [
            {'name': 'Cook', 'fips': '031', 'lat': 41.8, 'lng': -87.7},
            {'name': 'DuPage', 'fips': '043', 'lat': 41.8, 'lng': -88.1},
            {'name': 'Kane', 'fips': '089', 'lat': 41.9, 'lng': -88.4},
            {'name': 'Lake', 'fips': '097', 'lat': 42.3, 'lng': -87.9},
            {'name': 'Will', 'fips': '197', 'lat': 41.5, 'lng': -87.9},
            {'name': 'McHenry', 'fips': '111', 'lat': 42.3, 'lng': -88.4},
            {'name': 'Kendall', 'fips': '093', 'lat': 41.6, 'lng': -88.4},
            {'name': 'DeKalb', 'fips': '037', 'lat': 41.9, 'lng': -88.8},
            {'name': 'LaSalle', 'fips': '099', 'lat': 41.3, 'lng': -89.0},
            {'name': 'Lee', 'fips': '103', 'lat': 41.8, 'lng': -89.4},
        ]
    },
    'IN': {
        'name': 'Indiana',
        'fips': '18',
        'counties': [
            {'name': 'Lake', 'fips': '089', 'lat': 41.5, 'lng': -87.3},
            {'name': 'Porter', 'fips': '127', 'lat': 41.5, 'lng': -87.1},
            {'name': 'LaPorte', 'fips': '091', 'lat': 41.6, 'lng': -86.7},
            {'name': 'St. Joseph', 'fips': '141', 'lat': 41.7, 'lng': -86.2},
            {'name': 'Elkhart', 'fips': '039', 'lat': 41.7, 'lng': -85.9},
            {'name': 'Marion', 'fips': '097', 'lat': 39.8, 'lng': -86.1},
            {'name': 'Hamilton', 'fips': '057', 'lat': 40.1, 'lng': -86.0},
            {'name': 'Allen', 'fips': '003', 'lat': 41.1, 'lng': -85.1},
            {'name': 'Vanderburgh', 'fips': '163', 'lat': 38.0, 'lng': -87.6},
            {'name': 'Tippecanoe', 'fips': '157', 'lat': 40.4, 'lng': -87.0},
        ]
    },
    'MO': {
        'name': 'Missouri',
        'fips': '29',
        'counties': [
            {'name': 'St. Louis', 'fips': '189', 'lat': 38.6, 'lng': -90.5},
            {'name': 'Jackson', 'fips': '095', 'lat': 39.0, 'lng': -94.4},
            {'name': 'St. Charles', 'fips': '183', 'lat': 38.8, 'lng': -90.6},
            {'name': 'Jefferson', 'fips': '099', 'lat': 38.4, 'lng': -90.4},
            {'name': 'Clay', 'fips': '047', 'lat': 39.3, 'lng': -94.4},
            {'name': 'Boone', 'fips': '019', 'lat': 38.9, 'lng': -92.3},
            {'name': 'Greene', 'fips': '077', 'lat': 37.2, 'lng': -93.3},
            {'name': 'Platte', 'fips': '165', 'lat': 39.4, 'lng': -94.7},
            {'name': 'Cass', 'fips': '037', 'lat': 38.7, 'lng': -94.4},
            {'name': 'Buchanan', 'fips': '021', 'lat': 39.7, 'lng': -94.8},
        ]
    },
    'OH': {
        'name': 'Ohio',
        'fips': '39',
        'counties': [
            {'name': 'Cuyahoga', 'fips': '035', 'lat': 41.4, 'lng': -81.7},
            {'name': 'Hamilton', 'fips': '061', 'lat': 39.2, 'lng': -84.6},
            {'name': 'Franklin', 'fips': '049', 'lat': 39.9, 'lng': -83.0},
            {'name': 'Montgomery', 'fips': '113', 'lat': 39.8, 'lng': -84.2},
            {'name': 'Summit', 'fips': '153', 'lat': 41.1, 'lng': -81.5},
            {'name': 'Lucas', 'fips': '095', 'lat': 41.7, 'lng': -83.6},
            {'name': 'Stark', 'fips': '151', 'lat': 40.8, 'lng': -81.4},
            {'name': 'Butler', 'fips': '017', 'lat': 39.5, 'lng': -84.5},
            {'name': 'Lorain', 'fips': '093', 'lat': 41.4, 'lng': -82.2},
            {'name': 'Mahoning', 'fips': '099', 'lat': 41.0, 'lng': -80.8},
        ]
    },
    'PA': {
        'name': 'Pennsylvania',
        'fips': '42',
        'counties': [
            {'name': 'Philadelphia', 'fips': '101', 'lat': 40.0, 'lng': -75.1},
            {'name': 'Allegheny', 'fips': '003', 'lat': 40.5, 'lng': -80.0},
            {'name': 'Montgomery', 'fips': '091', 'lat': 40.2, 'lng': -75.4},
            {'name': 'Bucks', 'fips': '017', 'lat': 40.3, 'lng': -75.1},
            {'name': 'Chester', 'fips': '029', 'lat': 40.0, 'lng': -75.7},
            {'name': 'Delaware', 'fips': '045', 'lat': 39.9, 'lng': -75.4},
            {'name': 'Lancaster', 'fips': '071', 'lat': 40.0, 'lng': -76.3},
            {'name': 'York', 'fips': '133', 'lat': 40.0, 'lng': -76.7},
            {'name': 'Berks', 'fips': '011', 'lat': 40.4, 'lng': -75.9},
            {'name': 'Westmoreland', 'fips': '129', 'lat': 40.3, 'lng': -79.5},
        ]
    },
    'WI': {
        'name': 'Wisconsin',
        'fips': '55',
        'counties': [
            {'name': 'Milwaukee', 'fips': '079', 'lat': 43.0, 'lng': -88.0},
            {'name': 'Dane', 'fips': '025', 'lat': 43.1, 'lng': -89.4},
            {'name': 'Waukesha', 'fips': '133', 'lat': 43.0, 'lng': -88.3},
            {'name': 'Brown', 'fips': '009', 'lat': 44.5, 'lng': -88.0},
            {'name': 'Racine', 'fips': '101', 'lat': 42.7, 'lng': -87.8},
            {'name': 'Outagamie', 'fips': '087', 'lat': 44.4, 'lng': -88.4},
            {'name': 'Kenosha', 'fips': '059', 'lat': 42.6, 'lng': -87.8},
            {'name': 'Rock', 'fips': '105', 'lat': 42.7, 'lng': -89.0},
            {'name': 'Winnebago', 'fips': '139', 'lat': 44.0, 'lng': -88.5},
            {'name': 'Washington', 'fips': '131', 'lat': 43.4, 'lng': -88.2},
        ]
    },
    'WV': {
        'name': 'West Virginia',
        'fips': '54',
        'counties': [
            {'name': 'Kanawha', 'fips': '039', 'lat': 38.4, 'lng': -81.3},
            {'name': 'Berkeley', 'fips': '003', 'lat': 39.5, 'lng': -77.9},
            {'name': 'Jefferson', 'fips': '037', 'lat': 39.3, 'lng': -77.8},
            {'name': 'Wood', 'fips': '107', 'lat': 39.3, 'lng': -81.4},
            {'name': 'Cabell', 'fips': '011', 'lat': 38.4, 'lng': -82.3},
            {'name': 'Putnam', 'fips': '079', 'lat': 38.5, 'lng': -81.9},
            {'name': 'Raleigh', 'fips': '081', 'lat': 37.8, 'lng': -81.2},
            {'name': 'Jefferson', 'fips': '037', 'lat': 39.3, 'lng': -77.8},
            {'name': 'Monongalia', 'fips': '061', 'lat': 39.6, 'lng': -79.9},
            {'name': 'Ohio', 'fips': '069', 'lat': 40.1, 'lng': -80.7},
        ]
    }
}

def create_rectangular_boundary(lat, lng, size=0.2):
    """Create a rectangular boundary around a center point"""
    return [
        [lng - size, lat - size],
        [lng + size, lat - size], 
        [lng + size, lat + size],
        [lng - size, lat + size],
        [lng - size, lat - size]
    ]

def generate_county_geojson():
    """Generate GeoJSON files for all state counties"""
    
    data_dir = Path("data/counties")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    print("🗺️ Generating County Boundary GeoJSON Files")
    print("=" * 50)
    
    for state_abbr, state_data in COUNTIES_DATA.items():
        print(f"Creating {state_abbr} - {state_data['name']}...")
        
        features = []
        for county in state_data['counties']:
            # Create county feature
            feature = {
                "type": "Feature",
                "properties": {
                    "STATEFP": state_data['fips'],
                    "COUNTYFP": county['fips'],
                    "GEOID": f"{state_data['fips']}{county['fips']}",
                    "NAME": county['name'],
                    "NAMELSAD": f"{county['name']} County",
                    "state_abbr": state_abbr,
                    "state_name": state_data['name']
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [create_rectangular_boundary(
                        county['lat'], county['lng'], 0.15
                    )]
                }
            }
            features.append(feature)
        
        # Create GeoJSON structure
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        # Save to file
        filename = f"{state_data['name'].lower().replace(' ', '_')}_counties.geojson"
        filepath = data_dir / filename
        
        with open(filepath, 'w') as f:
            json.dump(geojson, f, indent=2)
        
        print(f"   ✅ Created: {filename} ({len(features)} counties)")
    
    print(f"\n📁 Files saved to: {data_dir.absolute()}")
    print("\n🎉 County boundary generation complete!")
    
    # Show usage instructions
    print("\n📖 Usage Instructions:")
    print("1. These GeoJSON files contain simplified rectangular county boundaries")
    print("2. Each county is represented as a rectangular polygon around its center")
    print("3. Properties include FIPS codes, names, and state information")
    print("4. Files are ready to load in your travel application")
    print("5. For production, consider using real Census Bureau boundary data")

def create_download_summary():
    """Create a summary of what was generated"""
    
    summary = {
        "generated_files": [],
        "total_counties": 0,
        "states_included": []
    }
    
    for state_abbr, state_data in COUNTIES_DATA.items():
        summary["generated_files"].append(f"{state_data['name'].lower().replace(' ', '_')}_counties.geojson")
        summary["total_counties"] += len(state_data['counties'])
        summary["states_included"].append(f"{state_abbr} ({state_data['name']})")
    
    # Save summary
    with open("data/counties/generation_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\n📊 Summary:")
    print(f"   Generated: {len(summary['generated_files'])} files")
    print(f"   Total counties: {summary['total_counties']}")
    print(f"   States: {', '.join(summary['states_included'])}")

if __name__ == "__main__":
    generate_county_geojson()
    create_download_summary()
