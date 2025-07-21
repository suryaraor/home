#!/usr/bin/env python3
"""
County Boundaries Downloader for Midwest Route States
Downloads actual county boundary data from US Census Bureau
"""

import requests
import json
import os
import zipfile
import geopandas as gpd
from pathlib import Path

# State FIPS codes for your route states
STATES = {
    'IL': {'fips': '17', 'name': 'illinois'},      # Illinois
    'IN': {'fips': '18', 'name': 'indiana'},       # Indiana  
    'MO': {'fips': '29', 'name': 'missouri'},      # Missouri
    'OH': {'fips': '39', 'name': 'ohio'},          # Ohio
    'PA': {'fips': '42', 'name': 'pennsylvania'},  # Pennsylvania
    'WI': {'fips': '55', 'name': 'wisconsin'},     # Wisconsin
    'WV': {'fips': '54', 'name': 'west_virginia'}  # West Virginia
}

# US Census Bureau TIGER/Line Files URL (2023 data)
BASE_URL = "https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/"

def download_county_data():
    """Download county boundaries for all required states"""
    
    data_dir = Path("data/counties")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    download_commands = []
    urls = []
    
    print("🏛️ County Boundary Download URLs")
    print("=" * 50)
    
    for state_abbr, state_info in STATES.items():
        fips_code = state_info['fips']
        state_name = state_info['name']
        
        # Build the correct URL
        filename = f"tl_2023_{fips_code}_county.zip"
        url = f"{BASE_URL}{filename}"
        
        print(f"{state_abbr:2} ({state_name:12}): {url}")
        
        urls.append(url)
        download_commands.append(f"wget {url}")
        
        # Download the file
        try:
            print(f"   Downloading {state_abbr}...")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            # Save zip file
            zip_path = data_dir / filename
            with open(zip_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"   ✅ Downloaded {state_abbr}: {zip_path.stat().st_size:,} bytes")
            
            # Extract and convert to GeoJSON
            extract_and_convert(zip_path, state_abbr, state_name)
            
        except requests.RequestException as e:
            print(f"   ❌ Error downloading {state_abbr}: {e}")
        except Exception as e:
            print(f"   ❌ Error processing {state_abbr}: {e}")
    
    print("\n" + "=" * 50)
    print("📋 Download Commands (for manual wget):")
    print("=" * 50)
    for cmd in download_commands:
        print(cmd)
    
    print(f"\n📁 Files saved to: {data_dir.absolute()}")

def extract_and_convert(zip_path, state_abbr, state_name):
    """Extract shapefile and convert to GeoJSON"""
    
    extract_dir = zip_path.parent / f"temp_{state_abbr}"
    extract_dir.mkdir(exist_ok=True)
    
    try:
        # Extract ZIP file
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Find the shapefile
        shp_files = list(extract_dir.glob("*.shp"))
        if not shp_files:
            print(f"   ⚠️ No shapefile found for {state_abbr}")
            return
        
        shp_file = shp_files[0]
        
        # Convert to GeoJSON using geopandas
        try:
            gdf = gpd.read_file(shp_file)
            
            # Add state abbreviation to properties
            gdf['state_abbr'] = state_abbr
            
            # Output GeoJSON file
            output_file = zip_path.parent / f"{state_name}_counties.geojson"
            gdf.to_file(output_file, driver='GeoJSON')
            
            print(f"   ✅ Converted to GeoJSON: {output_file.name} ({len(gdf)} counties)")
            
            # Clean up extracted files
            import shutil
            shutil.rmtree(extract_dir)
            
            # Remove zip file to save space
            zip_path.unlink()
            
        except ImportError:
            print(f"   ⚠️ geopandas not available. Keeping shapefile for manual conversion.")
            print(f"   📦 Extracted to: {extract_dir}")
        
    except Exception as e:
        print(f"   ❌ Error extracting {state_abbr}: {e}")

def create_wget_script():
    """Create a wget script for manual download"""
    
    script_content = ["#!/bin/bash", "# County Boundaries Download Script", ""]
    
    for state_abbr, state_info in STATES.items():
        fips_code = state_info['fips']
        filename = f"cb_2022_{fips_code}_county_500k.zip"
        url = f"{BASE_URL}{filename}"
        
        script_content.extend([
            f"# {state_abbr} - {state_info['name'].title()}",
            f"echo 'Downloading {state_abbr}...'",
            f"wget -O data/counties/{filename} {url}",
            ""
        ])
    
    script_path = Path("download_counties.sh")
    with open(script_path, 'w') as f:
        f.write('\n'.join(script_content))
    
    print(f"📜 Wget script created: {script_path}")
    return script_path

def create_urls_list():
    """Create a simple list of URLs for reference"""
    
    urls_content = ["# County Boundary Download URLs", "# US Census Bureau TIGER/Line Files 2022", ""]
    
    for state_abbr, state_info in STATES.items():
        fips_code = state_info['fips']
        filename = f"cb_2022_{fips_code}_county_500k.zip"
        url = f"{BASE_URL}{filename}"
        
        urls_content.append(f"{state_abbr} ({state_info['name']:12}) - FIPS {fips_code}: {url}")
    
    urls_path = Path("county_download_urls.txt")
    with open(urls_path, 'w') as f:
        f.write('\n'.join(urls_content))
    
    print(f"📄 URLs list created: {urls_path}")
    return urls_path

if __name__ == "__main__":
    print("🗺️ County Boundaries Downloader")
    print("=" * 50)
    
    # Create reference files
    create_urls_list()
    create_wget_script()
    
    print("\nStarting downloads...")
    download_county_data()
    
    print("\n🎉 Download complete!")
    print("\nNext steps:")
    print("1. Check data/counties/ folder for GeoJSON files")
    print("2. Update your application to load these files")
    print("3. If geopandas failed, manually convert shapefiles to GeoJSON")
