import React from 'react';
import {csv} from 'd3-fetch';
import {scaleLinear} from 'd3-scale';
import {interpolateWarm} from 'd3-scale-chromatic';
import {
  XYPlot,
  LineSeriesCanvas
} from 'react-vis';

import {
  cleanData,
  getDataDomain,
  buildVoronoiPoints
} from '../utils';
import {
  layout,
  NUMBER_OF_GAMES,
  MAX_NUMBER_OF_THREE_POINTERS
} from '../constants';
import InteractiveComponents from './interactive-parts';

export default class RootComponent extends React.Component {
  state = {
    loading: true,
    data: [],
    allPoints: null,
    playerYearMap: null,
    playerMap: null
  }

  componentWillMount() {
    csv('data/nyt-rip.csv')
      .then(data => {
        const updatedData = cleanData(data);
        const playerYearMap = updatedData.reduce((acc, row) => {
          const {pname, year, gameData} = row;
          acc[`${pname}-${year}`] = gameData[gameData.length - 1].y;
          return acc;
        }, {});

        const playerMap = updatedData.reduce((acc, row) => {
          acc[`${row.pname}-${row.year}`] = row;
          return acc;
        }, {});
        this.setState({
          data: updatedData,
          loading: false,
          allPoints: buildVoronoiPoints(updatedData),
          playerYearMap,
          playerMap
        });
      });
  }

  render() {
    const {loading, data, allPoints, playerYearMap, playerMap} = this.state;
    if (loading) {
      return <div><h1>LOADING</h1></div>;
    }
    const dataDomain = getDataDomain(data);
    const domainScale = scaleLinear().domain(dataDomain).range([1, 0]);
    const colorScale = val => interpolateWarm(domainScale(val));
    return (
      <div className="relative">
        <div>
          <XYPlot
            xDomain={[0, NUMBER_OF_GAMES]}
            yDomain={[0, MAX_NUMBER_OF_THREE_POINTERS + 1]}
            {...layout}>
            {data.map((player, idx) => (
              <LineSeriesCanvas
                key={idx}
                strokeWidth={1}
                onNearestX={d => this.setState({crossvalue: d})}
                data={player.gameData}
                stroke={colorScale(player.gameData[player.gameData.length - 1].y)}
                />))}
          </XYPlot>
        </div>
        {
          // interactive components
        }
        <InteractiveComponents
          allPoints={allPoints}
          playerYearMap={playerYearMap}
          playerMap={playerMap}
          />
      </div>

    );
  }
}
