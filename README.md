tideline
========

This repository contains a self-contained module for [Tidepool](http://tidepool.org/ 'Tidepool')'s timeline-style diabetes data visualization(s).

This module is currently under construction; check back often for updates!

This repository uses [Bower](http://bower.io/ 'Bower') to manage its dependencies. After cloning the repository, you can install all of the necessary dependencies with `bower install`.

The module itself is organized in node.js-style (sub-)modules and can be bundled together using [browserify](http://browserify.org/ 'browserify'). Assuming browserify is installed (run `npm install -g browserify` if not), just run the following: `browserify js/index.js -o js/bundle.js`. Then run `python -m SimpleHTTPServer` or similar to run the visualization locally and view at http://localhost:8000 in your browser.

## Code Philosophy and Organization

The tideline module is designed to be highly modular. To this end, its component parts (thus far, [container.js](https://github.com/tidepool-org/tideline/blob/master/js/container.js 'Tideline: container.js') and [pool.js](https://github.com/tidepool-org/tideline/blob/master/js/pool.js 'Tideline: pool.js')) are organized roughly according to the principles laid out in Mike Bostock's ["Towards Reusable Charts"](http://bost.ocks.org/mike/chart/ 'Mike Bostock: Towards Reusable Charts').

The main unit of each tideline is the container, which creates:

 - an SVG element for visualization (ID `#tidelineSVG`)
	
 - a main group element to contain the sub-units of visualization (ID `#tidelineMain`)
 
 - a group to contain the horizontal axis (classes `x` and `axis`, ID `#tidelineXAxis`)
 
 - a group to contain other horizontal navigation elements (class `x`, ID `#tidelineNav`)
 
The horizontal sections comprising sub-units of visualization plotted against the same x-axis are referred to in this repository as *pools*. Each pool is an SVG group element with an ID formed from the prefix `pool_` plus an integer identifying the pool uniquely. Each pool is embedded within `g#tidelineMain` and may contain one or more of the following:
 
 - a 'fill' group (ID ending in `_fill`) containing elements that form the background for the pool
 
 - a 'data' group (ID ending in `_data`) containing elements representing the data of interest
 
 - a 'random' group (ID ending in `_random`) containing elements representing random data (for development purposes)
