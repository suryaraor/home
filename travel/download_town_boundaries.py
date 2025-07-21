#!/usr/bin/env python3
"""
US Small Town Boundaries Downloader

This script downloads small town boundary data from the US Census Bureau
and saves it in various formats for use in web applications.

Data Sources:
- US Census Bureau Places (incorporated places like cities, towns, villages)
- Includes population data and geographic boundaries
"""

import requests
import json
import time
import os
from urllib.parse import urlencode
import zipfile
import tempfile
import geopandas as gpd
import pandas as pd
from shapely.geometry import shape
import warnings
warnings.filterwarnings('ignore')

class TownBoundariesDownloader:
    def __init__(self):
        self.base_url = "https://www2.census.gov/geo/tiger/TIGER2023/PLACE/"
        self.output_dir = "data"
        self.states = {
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
        }
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        print(f"✅ Created output directory: {self.output_dir}")

    def get_state_fips_codes(self):
        """Get state FIPS codes for downloading"""
        fips_codes = {
            'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06', 'CO': '08',
            'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12', 'GA': '13', 'HI': '15',
            'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19', 'KS': '20', 'KY': '21',
            'LA': '22', 'ME': '23', 'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27',
            'MS': '28', 'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
            'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39',
            'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45', 'SD': '46',
            'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50', 'VA': '51', 'WA': '53',
            'WV': '54', 'WI': '55', 'WY': '56'
        }
        return fips_codes

    def download_state_places(self, state_abbr, fips_code):
        """Download places (towns/cities) for a specific state"""
        filename = f"tl_2023_{fips_code}_place.zip"
        url = f"{self.base_url}{filename}"
        
        print(f"📥 Downloading {state_abbr} places data...")
        
        try:
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            zip_path = os.path.join(self.output_dir, filename)
            with open(zip_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"✅ Downloaded {state_abbr}: {filename}")
            return zip_path
            
        except requests.RequestException as e:
            print(f"❌ Failed to download {state_abbr}: {e}")
            return None

    def extract_and_process_shapefile(self, zip_path, state_abbr):
        """Extract shapefile and convert to GeoJSON"""
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Extract ZIP file
                with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                    zip_ref.extractall(temp_dir)
                
                # Find the shapefile
                shp_file = None
                for file in os.listdir(temp_dir):
                    if file.endswith('.shp'):
                        shp_file = os.path.join(temp_dir, file)
                        break
                
                if not shp_file:
                    print(f"❌ No shapefile found in {zip_path}")
                    return None
                
                # Read shapefile with geopandas
                gdf = gpd.read_file(shp_file)
                
                # Filter for small towns (population < 50000) if population data available
                if 'POP20' in gdf.columns:
                    # Convert population to numeric, handling any non-numeric values
                    gdf['POP20'] = pd.to_numeric(gdf['POP20'], errors='coerce')
                    small_towns = gdf[gdf['POP20'] < 50000]
                else:
                    # If no population data, keep all places
                    small_towns = gdf
                
                # Convert to WGS84 (EPSG:4326) for web use
                if small_towns.crs != 'EPSG:4326':
                    small_towns = small_towns.to_crs('EPSG:4326')
                
                # Save as GeoJSON
                geojson_path = os.path.join(self.output_dir, f"{state_abbr.lower()}_small_towns.geojson")
                small_towns.to_file(geojson_path, driver='GeoJSON')
                
                print(f"✅ Processed {len(small_towns)} places for {state_abbr}")
                return geojson_path, len(small_towns)
                
        except Exception as e:
            print(f"❌ Error processing {state_abbr}: {e}")
            return None, 0

    def create_combined_dataset(self):
        """Combine all state GeoJSON files into a single dataset"""
        print("\n🔄 Creating combined dataset...")
        
        all_features = []
        total_places = 0
        
        for state_abbr in self.states.keys():
            geojson_path = os.path.join(self.output_dir, f"{state_abbr.lower()}_small_towns.geojson")
            if os.path.exists(geojson_path):
                try:
                    with open(geojson_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        features = data.get('features', [])
                        
                        # Add state info to each feature
                        for feature in features:
                            feature['properties']['state_abbr'] = state_abbr
                            feature['properties']['state_name'] = self.states[state_abbr]
                        
                        all_features.extend(features)
                        total_places += len(features)
                        print(f"  ✅ Added {len(features)} places from {state_abbr}")
                        
                except Exception as e:
                    print(f"  ❌ Error reading {state_abbr}: {e}")
        
        # Create combined GeoJSON
        combined_geojson = {
            "type": "FeatureCollection",
            "features": all_features,
            "metadata": {
                "total_places": total_places,
                "created_date": time.strftime("%Y-%m-%d %H:%M:%S"),
                "source": "US Census Bureau TIGER/Line Shapefiles 2023",
                "description": "Small towns and cities (population < 50,000) with boundaries"
            }
        }
        
        # Save combined file
        combined_path = os.path.join(self.output_dir, "us_small_towns_boundaries.geojson")
        with open(combined_path, 'w', encoding='utf-8') as f:
            json.dump(combined_geojson, f, separators=(',', ':'))
        
        print(f"✅ Combined dataset saved: {combined_path}")
        print(f"📊 Total places: {total_places:,}")
        
        return combined_path

    def create_simplified_version(self):
        """Create a simplified version for web use"""
        print("\n🔄 Creating simplified version for web use...")
        
        combined_path = os.path.join(self.output_dir, "us_small_towns_boundaries.geojson")
        if not os.path.exists(combined_path):
            print("❌ Combined dataset not found")
            return
        
        try:
            # Read the combined dataset
            gdf = gpd.read_file(combined_path)
            
            # Simplify geometries to reduce file size
            gdf['geometry'] = gdf['geometry'].simplify(tolerance=0.001, preserve_topology=True)
            
            # Keep only essential columns
            essential_columns = ['NAME', 'state_abbr', 'state_name', 'geometry']
            if 'POP20' in gdf.columns:
                essential_columns.append('POP20')
            if 'ALAND' in gdf.columns:
                essential_columns.append('ALAND')
            
            # Filter to existing columns
            available_columns = [col for col in essential_columns if col in gdf.columns]
            simplified_gdf = gdf[available_columns].copy()
            
            # Save simplified version
            simplified_path = os.path.join(self.output_dir, "us_small_towns_simplified.geojson")
            simplified_gdf.to_file(simplified_path, driver='GeoJSON')
            
            # Get file sizes
            original_size = os.path.getsize(combined_path) / (1024 * 1024)  # MB
            simplified_size = os.path.getsize(simplified_path) / (1024 * 1024)  # MB
            
            print(f"✅ Simplified version saved: {simplified_path}")
            print(f"📊 Original size: {original_size:.1f} MB")
            print(f"📊 Simplified size: {simplified_size:.1f} MB")
            print(f"📊 Reduction: {((original_size - simplified_size) / original_size * 100):.1f}%")
            
        except Exception as e:
            print(f"❌ Error creating simplified version: {e}")

    def create_web_ready_chunks(self):
        """Create smaller chunks for web loading"""
        print("\n🔄 Creating web-ready chunks by state...")
        
        chunks_dir = os.path.join(self.output_dir, "chunks")
        os.makedirs(chunks_dir, exist_ok=True)
        
        combined_path = os.path.join(self.output_dir, "us_small_towns_simplified.geojson")
        if not os.path.exists(combined_path):
            print("❌ Simplified dataset not found")
            return
        
        try:
            with open(combined_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Group by state
            state_features = {}
            for feature in data['features']:
                state = feature['properties']['state_abbr']
                if state not in state_features:
                    state_features[state] = []
                state_features[state].append(feature)
            
            # Save each state as a separate file
            for state, features in state_features.items():
                state_geojson = {
                    "type": "FeatureCollection",
                    "features": features,
                    "metadata": {
                        "state": state,
                        "state_name": self.states.get(state, state),
                        "place_count": len(features),
                        "created_date": time.strftime("%Y-%m-%d %H:%M:%S")
                    }
                }
                
                chunk_path = os.path.join(chunks_dir, f"{state.lower()}_towns.geojson")
                with open(chunk_path, 'w', encoding='utf-8') as f:
                    json.dump(state_geojson, f, separators=(',', ':'))
                
                file_size = os.path.getsize(chunk_path) / 1024  # KB
                print(f"  ✅ {state}: {len(features)} places ({file_size:.1f} KB)")
            
            print(f"✅ Created {len(state_features)} state chunks in {chunks_dir}")
            
        except Exception as e:
            print(f"❌ Error creating chunks: {e}")

    def generate_index_file(self):
        """Generate an index file with metadata"""
        print("\n🔄 Generating index file...")
        
        index_data = {
            "title": "US Small Towns Boundaries Dataset",
            "description": "Geographic boundaries for small towns and cities across the United States",
            "source": "US Census Bureau TIGER/Line Shapefiles 2023",
            "created_date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "files": {
                "complete_dataset": {
                    "filename": "us_small_towns_boundaries.geojson",
                    "description": "Complete dataset with all small towns",
                    "format": "GeoJSON"
                },
                "simplified_dataset": {
                    "filename": "us_small_towns_simplified.geojson",
                    "description": "Simplified version for web use",
                    "format": "GeoJSON"
                },
                "state_chunks": {
                    "directory": "chunks/",
                    "description": "Individual state files for efficient loading",
                    "format": "GeoJSON",
                    "pattern": "{state_code}_towns.geojson"
                }
            },
            "usage": {
                "web_application": "Load individual state chunks as needed",
                "gis_analysis": "Use complete dataset for comprehensive analysis",
                "mobile_apps": "Use simplified dataset for better performance"
            },
            "coordinate_system": "WGS84 (EPSG:4326)",
            "data_filter": "Places with population < 50,000 (where available)"
        }
        
        index_path = os.path.join(self.output_dir, "dataset_index.json")
        with open(index_path, 'w', encoding='utf-8') as f:
            json.dump(index_data, f, indent=2)
        
        print(f"✅ Index file created: {index_path}")

    def run_download(self, sample_states=None):
        """Run the complete download process"""
        print("🚀 Starting US Small Towns Boundaries Download")
        print("=" * 60)
        
        fips_codes = self.get_state_fips_codes()
        states_to_process = sample_states or list(self.states.keys())
        
        print(f"📍 Processing {len(states_to_process)} states...")
        
        successful_downloads = 0
        total_places = 0
        
        for state_abbr in states_to_process:
            if state_abbr in fips_codes:
                fips_code = fips_codes[state_abbr]
                
                # Download state data
                zip_path = self.download_state_places(state_abbr, fips_code)
                if zip_path:
                    # Process shapefile
                    result = self.extract_and_process_shapefile(zip_path, state_abbr)
                    if result and result[0]:
                        successful_downloads += 1
                        total_places += result[1]
                    
                    # Clean up ZIP file
                    try:
                        os.remove(zip_path)
                    except:
                        pass
                
                # Small delay to be respectful to server
                time.sleep(0.5)
        
        print(f"\n📊 Download Summary:")
        print(f"  States processed: {successful_downloads}/{len(states_to_process)}")
        print(f"  Total places: {total_places:,}")
        
        if successful_downloads > 0:
            # Create combined dataset
            self.create_combined_dataset()
            
            # Create simplified version
            self.create_simplified_version()
            
            # Create web-ready chunks
            self.create_web_ready_chunks()
            
            # Generate index
            self.generate_index_file()
            
            print(f"\n✅ Download complete! Files saved in '{self.output_dir}' directory")
        else:
            print("\n❌ No data was successfully downloaded")

def main():
    """Main function with options"""
    print("US Small Towns Boundaries Downloader")
    print("====================================")
    
    downloader = TownBoundariesDownloader()
    
    # Ask user for download scope
    print("\nDownload options:")
    print("1. Sample states (IL, IN, OH, PA, WI, MO) - Quick test")
    print("2. All US states - Complete dataset (large download)")
    print("3. Custom state list")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        sample_states = ['IL', 'IN', 'OH', 'PA', 'WI', 'MO']
        print(f"\n🎯 Downloading sample states: {', '.join(sample_states)}")
        downloader.run_download(sample_states)
    elif choice == "2":
        print("\n⚠️  This will download data for all 50 states + DC (~500MB)")
        confirm = input("Continue? (y/N): ").strip().lower()
        if confirm == 'y':
            downloader.run_download()
        else:
            print("Download cancelled.")
    elif choice == "3":
        states_input = input("Enter state codes separated by commas (e.g., CA,TX,NY): ").strip()
        if states_input:
            custom_states = [s.strip().upper() for s in states_input.split(',')]
            valid_states = [s for s in custom_states if s in downloader.states]
            if valid_states:
                print(f"\n🎯 Downloading custom states: {', '.join(valid_states)}")
                downloader.run_download(valid_states)
            else:
                print("❌ No valid state codes entered.")
        else:
            print("❌ No states specified.")
    else:
        print("❌ Invalid choice.")

if __name__ == "__main__":
    main()
