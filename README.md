# wine-grocery
Helps Find Wine Grocery Near You

Simple web application to find a grocery store near you that sells wine/beer.  
The application will fetch and display data on the nearby stores, it will also show a dynamic google map with the stores marked on it plus the location entered by the user.  
Lastly, unless specified, only open stores will be shown. The store hours are updated automatically every day with that days opening and closing hours.  

## Instructions on Usage
https://wine-grocery.herokuapp.com/

On the site enter your address (or adress near you).  
Select the number of stores to show around you, these will be selected by proximity to you and sorted from closest to farthest.  
Optionaly: Check 'Show Closed Stores' option to show closed stores around you as well.  

## Development Stack Breakdown
-   HTML, CSS, JavaScript in the front end (simple html page with css styling).
-   Express - Node.js in the back end.
-   MongoDB Atlas for data storage of the Ontario stores licenced to sell wine/beer and associated information.
-   Google Maps Platform used, Geocoding API for converting addresses to geographic coordinates and Maps JavaScript API, an interactive map for the website.
-   cheerio.js used for simple web scraping of opening and closing hours of stores. 
-   Heroku Scheduler is used to run the web scraping code daily.
