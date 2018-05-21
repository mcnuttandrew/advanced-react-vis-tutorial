import React from 'react';
import {csv} from 'd3-fetch';
import {scaleLinear} from 'd3-scale';
import {interpolateWarm} from 'd3-scale-chromatic';
import {XYPlot, LineSeries, LabelSeries, XAxis} from 'react-vis';
import {desiredLabels, layout} from '../constants';
import {cleanData, getDataDomain} from '../utils';

// create a object descrbing which players to list along the y-axis
const labelMap = desiredLabels.reduce((acc, row) => {
  acc[`${row.pname}-${row.year}`] = true;
  return acc;
}, {});

export default class RootComponent extends React.Component {
  state = {
    data: null,
    loading: true,
    highlightSeries: null
  }

  componentWillMount() {
    csv('data/nyt-rip.csv')
      .then(data => this.setState({
        data: cleanData(data),
        loading: false
      }));
  }

  render() {
    const {loading, highlightSeries, data} = this.state;
    if (loading) {
      return <div><h1>LOADING</h1></div>;
    }

    const dataDomain = getDataDomain(data);
    const domainScale = scaleLinear()
      .domain(dataDomain).range([1, 0]);
    const colorScale = val => interpolateWarm(domainScale(val));

    return (
      <XYPlot {...layout}>
        {data.map((d, idx) => {
          const id = `${d.pname}-${d.year}`;
          const y = d.gameData[d.gameData.length - 1].y;
          return (
            <LineSeries
              key={idx}
              strokeWidth={1}
              data={d.gameData}
              onSeriesMouseOver={() =>
                  this.setState({highlightSeries: id})}
              onSeriesMouseOut={() =>
                  this.setState({highlightSeries: null})}
              stroke={
                id === highlightSeries ? 'black' : colorScale(y)
              }
              />);
        })}
        <LabelSeries
          data={data
            .filter(row => labelMap[`${row.pname}-${row.year}`])}
          style={{fontSize: '10px', fontFamily: 'sans-serif'}}
          getY={d => d.gameData[d.gameData.length - 1].y}
          getX={d => 82}
          labelAnchorX="start"
          getLabel={d =>
            `${d.pname} - ${d.gameData[d.gameData.length - 1].y}`
          }/>
        <XAxis
          style={{
            ticks: {fontSize: '10px', fontFamily: 'sans-serif'}
          }}
          tickFormat={d =>
            !d ? '1st game' : (!(d % 10) ? `${d}th` : '')}
          />
      </XYPlot>
    );
  }
}
