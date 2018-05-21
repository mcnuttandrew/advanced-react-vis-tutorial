import React from 'react';
import {scaleLinear} from 'd3-scale';
import {
  XYPlot,
  LineSeries,
  LabelSeries,
  XAxis,
  Voronoi,
  Hint
} from 'react-vis';
import debounce from 'debounce';

import {
  desiredLabels,
  layout,
  NUMBER_OF_GAMES,
  MAX_NUMBER_OF_THREE_POINTERS
} from '../constants';

export default class InteractiveComponents extends React.Component {
  state = {
    highlightSeries: null,
    highlightTip: null
  }
  componentWillMount() {
    this.debouncedSetState = debounce(newState =>
      this.setState(newState), 40);
  }
  render() {
    const {allPoints, playerYearMap, playerMap} = this.props;
    const {highlightSeries, highlightTip} = this.state;
    const {height, width, margin} = layout;
    const x = scaleLinear()
      .domain([0, NUMBER_OF_GAMES])
      .range([margin.left, width - margin.right]);
    const y = scaleLinear()
      .domain([0, MAX_NUMBER_OF_THREE_POINTERS])
      .range([height - margin.top - margin.bottom, 0]);
    return (
      <div className="absolute full">
        <XYPlot
          onMouseLeave={() =>
            this.setState({highlightSeries: null, highlightTip: null})}
          xDomain={[0, NUMBER_OF_GAMES]}
          yDomain={[0, MAX_NUMBER_OF_THREE_POINTERS + 1]}
          {...layout}>
          <LabelSeries
            labelAnchorX="start"
            data={desiredLabels.map(row => ({
              ...row,
              y: playerYearMap[`${row.pname}-${row.year}`],
              yOffset: -12
            }))}
            style={{fontSize: '10px', fontFamily: 'sans-serif'}}
            getX={d => NUMBER_OF_GAMES}
            getY={d => d.y}
            getLabel={d => `${d.pname.toUpperCase()}, ${d.year}`}/>
          <XAxis
            tickFormat={d => !d ? '1st game' : (!(d % 10) ? `${d}th` : '')}/>
          {highlightSeries && <LineSeries
              animation
              curve=""
              data={highlightSeries}
              color="black"/>}
          {
            highlightTip && <Hint
              value={{y: highlightTip.y, x: NUMBER_OF_GAMES}}
              align={{horizontal: 'right'}}>
              {`${highlightTip.name} ${highlightTip.y}`}
            </Hint>
          }

          <Voronoi
            extent={[
              [0, y(MAX_NUMBER_OF_THREE_POINTERS)],
              [width, height - margin.bottom]
            ]}
            nodes={allPoints}
            polygonStyle={{
              // UNCOMMENT BELOW TO SEE VORNOI
              // stroke: 'rgba(0, 0, 0, .2)'
            }}
            onHover={row => {
              const player = playerMap[`${row.pname}-${row.year}`];
              if (!player) {
                this.setState({
                  highlightSeries: null,
                  highlightTip: null
                });
                return;
              }
              this.debouncedSetState({
                highlightSeries: player.gameData,
                highlightTip: {
                  y: player.gameData[player.gameData.length - 1].y,
                  name: row.pname
                }
              });
            }}
            x={d => x(d.x)}
            y={d => y(d.y)}
            />
        </XYPlot>
      </div>
    );
  }
}
