# LAB 7 - Interactivity + React Vis


In this lab we start getting acquainted with interactivity in react by remaking a simple version of this new york times graphic of about Stephen Curry's '16 3 pointer record (https://www.nytimes.com/interactive/2016/04/16/upshot/stephen-curry-golden-state-warriors-3-pointers.html). Through this work we will continue our tour of react by getting acquainted with a modestly popular visualization library in the react-ecosystem, react-vis. react-vis is a wrapper on most of the d3 functionality, such that the tedious or repetitive parts of creating charts are abstracted away. As we talked about in lecture there is always some degree of tension between d3 and react, they both want to control the DOM. Both are good at different aspects: react tends to be better at engaging and disengaging dom elements, while d3 tends to be a little better at animations.

As you are exploring the project, refrain from looking at advanced-root until the end.

## Getting Started

As always we begin by installing the required dependencies

```sh
npm install

npm run start

# or if yarning

yarn

yarn start
```

The default configuration opens a port on http://localhost:3001/, so simply point a browser to that address and you'll be up and running.

## react-vis

As noted above, the way that we will be visualizing our data is through the lens of react vis. A good first step when interacting with a new library is to go look through the docs to see what it can do, so go forth and browse https://uber.github.io/react-vis/. The core idea is that all composed charts start with an XYPlot component as their root and then are populated with series and chart decorations. A series is a related collection of marks, like lines or dots or rectangles. For instance, to make a quick and dirty scatterplot you'd do:

```javascript
<XYPlot width={400} height={400}>
  <MarkSeries
    getX={d => d.left}
    getX={d => d.other}
    data={[{left: 1, other: 2}, {left: 9, other: 3}, {left: 4, other: 10}]}/>
</XYPlot>
```

react-vis automatically takes care of computing the domain, building scales, and everything else. In the above example we are using accessors (getX and getY) which are only necessary if your data has a format other than [{x: 1, y: 2}, etc]. Now let's get to the actual visualization we are building.

## The visualization

We've already done all the data wrangling for you, so all you have to do here is build a little chart. Start by making an XYPlot, just like above. Inside of the plot you will need to create a map over your data (each row contains key called gameData which is an array of values). The return value for each step of the map function should be a LineSeries (there is only one line per line series). Initially set the stroke to be black for every line series.

Once you've got that working you probably want to get some cool colors. Here is a little code snippet that creates a good color scale

```javascript
const dataDomain = getDataDomain(data);
const domainScale = scaleLinear().domain(dataDomain).range([1, 0]);
const colorScale = val => interpolateWarm(domainScale(val));
```

(If interpolateWarm isn't your thing take a look at d3-scale-chromatic for more options). Do you see why this multiple levels of scaling is necessary? You can use this to set the color to set the color of each line by feeding it player.gameData[player.gameData.length - 1].y. Pretty neat! After all of that your line series should look something like

```javascript
<LineSeries
  key={idx}
  strokeWidth="4"
  data={player.gameData}
  stroke={colorScale(player.gameData[player.gameData.length - 1].y)}
  />);
```
Something fun you can try out is making the LineSeries use different curves. To do this find the name of a curve in the d3-shape docs, and provide that as string to lineseries on a prop like curve="curveStepBefore".


Now we have a bunch of lines on a page, let's add some context. Let's first add an x axis. At the top of the file you can see that we've imported XAxis from react-vis. To add it simply place a <XAxis /> somewhere appropriate. Bam! Instant axis. Lets add in the units to our axis, to do this give the XAxis component a prop called tickFormat which is a function (something like this d => !d ? '1st game' : (!(d % 10) ? `${d}th` : '') would be a good argument).

Next, we will add labels to our lines using the LabelSeries. LabelSeries behaves more like the MarkSeries that we looked at in the beginning, just dump all the data in there and set accessor as appropriate. The one new accessor you should add is getLabel, a reasonable argument for which is getLabel={d => `${d.pname.toUpperCase()}, ${d.year}`}. We want our labels to hang off the right side, so we should set our getX to be something reasonable, like d => 82 (that's about the number of games in a season i think). Contrastingly getY is a little more complex as we want our label to line up with high score a player got, so maybe something like d => d.gameData[d.gameData.length - 1].y . We can add styles to our labels by providing a style prop like style={{fontSize: '10px', fontFamily: 'sans-serif'}}, and can adjust the position of the anchors via labelAnchorX="start". You should have a pretty spiffy graph now!


## The interaction

We want to add a really simple interaction, as we hover over each line is should get turn black. We could definitely do that with css (side bar how would you do that, look in to it! It's very easy), but we want to see how to do it with react. Each series in react takes props that describe how the component should respond to user interaction, in this case we want to use onSeriesMouseOut and onSeriesMouseOver. When the user mouses over each of the lines it should set a variable on state indicating which line we hovering over, let's call it highlightSeries. Go set a variable in the state = { variable called highlightSeries and set it equal to null.

We add out hover functionality by giving the onSeriesMouseOver on LineSeries a function like

```javascript
onSeriesMouseOver={() => this.setState({highlightSeries: `${player.pname}-${player.year}`})}
```
What's that weird thing that we are setting highlightSeries? Well each line is uniquely identified by year and pname so we need to combined them. That type of thing is pretty common. While we're at it, let's set the reverse action
```javascript
onSeriesMouseOut={() => this.setState({highlightSeries: null})}
```
Setting state is really fast, so don't worry too much about turning it on and off quickly.

Next let's actually do something with that, modify your stroke prop to be

```javascript
playerHighlightString === highlightSeries ? 'black' :
  colorScale(player.gameData[player.gameData.length - 1].y)
```

Now try mousing! Kinda cool!? Lets add a little line that follows our mouse around. Add another variable to our state, this one called crossvalue which will again be set to null. We will set this crossvalue using another interaction prop on lineseries call onNearestX, given it a function like

```js
onNearestX={d => this.setState({crossvalue: d})}
```

At the bottom of your chart component put a new Crosshair element, some like

```js
<Crosshair values={[crossvalue]}/>
```

And now try it out, very line!

## But wait there is more

At first glance the NYT visualization is pretty simple, players increase their highscore of the season, some of whom reach previous unseen heights, very orderly. It tells a good story: you can see just how much better Curry is than the rest of the pack in his record setting year. However we can see that there is some intricacy about the way that the hovering works. If you look closely you will see that they have way more data than what we have just built, we use <20 lines while they use a bristly 750. In order to make dynamic interaction like mouse over be a pleasurable user experience we will need to radically change the chart.

Unfortunately the collection of techniques required to execute these changes is a little beyond this lab, but you should check out the reference version (see src/components/advanced-root). Try switching which component the app.js file points to see it in action. The chart uses canvas rendering which is a form of raster drawing provided by the browser, in conjunction with a Voronoi mouse over element. Voronoi take a list of points like a scatterplot and divide up space so that each one of the ones is in it's own cell. You can see the voronoi cells by uncomment the line below where is says UNCOMMENT BELOW TO SEE VORNOI. Voronoi is super powerful and allows for lots of clever interaction techniques.


If you've been wondering what the amount of code for a modest final project looks like: look no farther. If the NYT visualization didn't already exist this would be a perfectly sufficient submission for p2, admittedly with some more styling.
