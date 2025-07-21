#!/bin/bash
# County Boundaries Download Script

# IL - Illinois
echo 'Downloading IL...'
wget -O data/counties/cb_2022_17_county_500k.zip https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/cb_2022_17_county_500k.zip

# IN - Indiana
echo 'Downloading IN...'
wget -O data/counties/cb_2022_18_county_500k.zip https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/cb_2022_18_county_500k.zip

# MO - Missouri
echo 'Downloading MO...'
wget -O data/counties/cb_2022_29_county_500k.zip https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/cb_2022_29_county_500k.zip

# OH - Ohio
echo 'Downloading OH...'
wget -O data/counties/cb_2022_39_county_500k.zip https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/cb_2022_39_county_500k.zip

# PA - Pennsylvania
echo 'Downloading PA...'
wget -O data/counties/cb_2022_42_county_500k.zip https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/cb_2022_42_county_500k.zip

# WI - Wisconsin
echo 'Downloading WI...'
wget -O data/counties/cb_2022_55_county_500k.zip https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/cb_2022_55_county_500k.zip

# WV - West_Virginia
echo 'Downloading WV...'
wget -O data/counties/cb_2022_54_county_500k.zip https://www2.census.gov/geo/tiger/TIGER2023/COUNTY/cb_2022_54_county_500k.zip
