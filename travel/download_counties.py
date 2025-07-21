#!/usr/bin/env python3
"""
County Boundaries Downloader
Downloads county boundary data from US Census Bureau for Midwest states
"""

import requests
import json
import os
from pathlib import Path

# State FIPS codes for your routes
STATES = {
    'IL': '17',  # Illinois
    'IN': '18',  # Indiana  
    'MO': '29',  # Missouri
    'OH': '39',  # Ohio
    'PA': '42',  # Pennsylvania
    'WI': '55',  # Wisconsin
    'WV': '54'   # West Virginia
}

# US Census Bureau Cartographic Boundary Files
BASE_URL = "https://www2.census.gov/geo/tiger/GENZ2022/shp/"

def download_county_boundaries():
    """Download county boundaries for all required states"""
    
    data_dir = Path("data/counties")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    for state_abbr, fips_code in STATES.items():
        print(f"Processing {state_abbr}...")
        
        # Download shapefile (we'll convert to GeoJSON)
        filename = f"cb_2022_{fips_code}_county_500k.zip"
        url = f"{BASE_URL}{filename}"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            # Save zip file
            zip_path = data_dir / filename
            with open(zip_path, 'wb') as f:
                f.write(response.content)
            
            print(f"Downloaded {state_abbr}: {len(response.content)} bytes")
            
        except requests.RequestException as e:
            print(f"Error downloading {state_abbr}: {e}")

def create_sample_geojson():
    """Create a sample GeoJSON structure for development"""
    
    # Sample county data based on your routes
    sample_counties = {
        "missouri": [
            {"name": "Jackson County", "fips": "29095", "center": [39.0997, -94.5786]},
            {"name": "Clay County", "fips": "29047", "center": [39.2461, -94.4191]},
            {"name": "Ray County", "fips": "29177", "center": [39.4394, -94.2019]},
            {"name": "DeKalb County", "fips": "29063", "center": [39.7394, -94.2413]},
            {"name": "Daviess County", "fips": "29061", "center": [39.9139, -93.9619]},
        ],
        "wisconsin": [
            {"name": "Milwaukee County", "fips": "55079", "center": [43.0389, -87.9065]},
            {"name": "Racine County", "fips": "55101", "center": [42.7261, -87.7829]},
            {"name": "Kenosha County", "fips": "55059", "center": [42.5847, -87.8212]},
        ]
    }
    
    data_dir = Path("data/counties")
    
    for state, counties in sample_counties.items():
        geojson = {
            "type": "FeatureCollection",
            "features": []
        }
        
        for county in counties:
            # Create a simple rectangular boundary around the center point
            lat, lng = county["center"]
            buffer = 0.1  # Degrees (approximately 7 miles)
            
            feature = {
                "type": "Feature",
                "properties": {
                    "NAME": county["name"].replace(" County", ""),
                    "STATEFP": county["fips"][:2],
                    "COUNTYFP": county["fips"][2:],
                    "GEOID": county["fips"],
                    "state_abbr": state[:2].upper()
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [lng - buffer, lat - buffer],
                        [lng + buffer, lat - buffer], 
                        [lng + buffer, lat + buffer],
                        [lng - buffer, lat + buffer],
                        [lng - buffer, lat - buffer]
                    ]]
                }
            }
            
            geojson["features"].append(feature)
        
        # Save sample file
        output_path = data_dir / f"{state}_counties_sample.geojson"
        with open(output_path, 'w') as f:
            json.dump(geojson, f, indent=2)
        
        print(f"Created sample: {output_path}")

if __name__ == "__main__":
    print("Creating sample county boundary data...")
    create_sample_geojson()
    
    print("\nTo download real boundary data:")
    print("1. Install required packages: pip install requests geopandas")
    print("2. Run the download function")
    print("3. Convert shapefiles to GeoJSON using geopandas")
