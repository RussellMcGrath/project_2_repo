#import dependencies

import pandas as pd
from bs4 import BeautifulSoup as bs
#from bs4.element import Comment
#from splinter import Browser
import requests
#import time
#import numpy as np

#datasource url 
url = "https://inciweb.nwcg.gov/feeds/rss/incidents/"

# instanciate landing dataframe
starting_data = pd.DataFrame()

# request xml code from url
xml_data = requests.get(url).content

#parse the xml response
soup = bs(xml_data, "xml")
     
# Find all text in the data
texts = str(soup.findAll(text=True)).replace('\\n','')
    
#Find the tag/child
child = soup.find("item")

# instatiate column lists
title = []
published = []
lat = []
lon = []
link = []
description = []

#loop trough each "item" in the xml response and store the target data
while True:    
    try:
        title.append(" ".join(child.find('title')))
    except:
         title.append(" ")
            
    try:
        published.append(" ".join(child.find('published')))
    except:
        published.append(" ")
        
    try:
        lat.append(" ".join(child.find('geo:lat')))
    except:
        lat.append(" ")
            
    try:
        lon.append(" ".join(child.find('geo:long')))
    except:
        lon.append(" ")
        
    try:
        link.append(" ".join(child.find('link')))
    except:
        link.append(" ")
        
    try:
        description.append(" ".join(child.find('description')))
    except:
        description.append(" ")
        
    try:   
        # Next sibling of child, here: 'item' 
        child = child.find_next_sibling('item')
    except:
        break
    
    #create dataframe
    data = pd.DataFrame({"title":title,
                                    "published":published,
                                    "lat":lat,
                                    "lon":lon,
                                    "link_url":link,
                                    "description": description})
    starting_data = starting_data.append(data, ignore_index = True)

# drop duplicate rows
unique_data = starting_data.drop_duplicates(keep="first",ignore_index="True")
unique_data.head(15)

# go the the link url for each rown and extract additional data (cause, size)

#instatiate landing lists
causes = []
sizes = []

#loop through each row of data
for x in range(len(unique_data)):
    #find the link in the row
    url = starting_data.loc[x,"link_url"]
    #go to the page and grap all the tables
    tables = pd.read_html(url)
    
    #the number of tables the page has will determine which tables we look in for data.
    #if there are more than one tables...
    if len(tables)>1:
        try:
            # find the "cause" in the first table on the page (if it exists)
            cause = tables[0].iloc[2,1]
        except:
            cause = "unknown"
    
        try:
            # find the "size" in the second table on the page (if it exists)
            size = tables[1].loc[(tables[1][0]) == "Size",1].item()            
        except:
            size = "unknown"
    #if there is only one table on the page...
    else:
        try:
            # find the "cause" in the first table on the page (if it exists)
            cause = tables[0].iloc[1,1]
            # no size data is available
            size = "n/a"
        except:
            cause = "unknown"
    
    #add cause and size to their lists
    causes.append(cause)
    sizes.append(size)
    
    #print progress
    print(f"{x+1} of {len(unique_data)}")

# if cause has the word "investigation" in it, set cause to "unknown"
for y in range(len(causes)):
    if "Investigation" in causes[y]:
        causes[y] = "Unknown"

# remove the word "Acres" from the size data
sizes = [s.replace(" Acres","") for s in sizes]
sizes = [s.replace(",","") for s in sizes]

# add causes and sizes to the dataframe
unique_data["cause"] = causes
unique_data["acres"] = sizes

clean_data = unique_data