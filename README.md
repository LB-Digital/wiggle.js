# wiggle.js
Random moving, configurable snakes that can be placed inside any container you wish, just please ensure they have enough space or I'll have no choice but to contact animal control!

## DEMO
An example of this Particle library can be found at http://dev.lucasbowers.com/wiggle/
<a href="http://dev.lucasbowers.com/wiggle/" target="_blank"><img src="http://dev.lucasbowers.com/wiggle/assets/images/preview.gif" alt="Live demo page" /></a>
(The above image is a GIF. Click it for a full quality example)

## Usage
You will need the `wiggle.js` file downloaded into your project folder, as well as a JSON config file. Import this file into your HTML as follows...
```html
<script src="path/to/wiggle.js"></script>
```

To initialize the particles, you will need to call the main `wiggle()` JS function like so...
```js
wiggle("path/to/wiggle.json", "<id of container>", function(wiggleInstanceID){
  console.log("Wiggle initiliazed with ID #" + wiggleInstanceID);
});
```

## Options
To customise the particles, you must create a JSON configuration file, an example of which can be found in the project files `bParticles.json`.  The following options are set within this file...

Key | Type | Notes
----|------|------
`gridSize`|integer|The width of each background grid cell, and so the length of each section of a snake.
`fps`|integer|30fps is perfectly acceptable in terms of smoothness and CPU stress.
`snakes.amount`|integer|Nmber of snakes wiggling around at once.
`snakes.length`|integer|Number of body sections that make up each snake.
`snakes.width`|integer|Width of the snakes body sections.
`bground`|string|CSS Color String to specify the container background color.
