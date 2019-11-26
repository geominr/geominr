import { h } from 'preact'
import { useRef, useEffect, useState } from 'preact/hooks'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { useDimensions } from 'react-recipes'
import { connect } from 'unistore/preact'
import Form from 'react-bootstrap/Form'
import legend from '../helpers/legend'

import './MapView.css'

const MapView = ({ data, scale }) => {
  const [wrapperRef, dimensions] = useDimensions()
  const mapRef = useRef()
  const [selectColumn, setSelectColumn] = useState('')
  const { entries } = data

  useEffect(() => {
    //init d3.js, todo reduce the amount of re-renders
    if (mapRef.current) {
      const map = d3.select(mapRef.current),
        margin = 20,
        width = 600 - margin,
        height = 400 - margin

      //clean up
      map.selectAll('*').remove()

      map.attr('width', width).attr('height', height)

      const projection = d3
        .geoAlbersUsa()
        .scale(width)
        .translate([width / 2, height / 2])
      const path = d3.geoPath(projection)

      function zoomed() {
        g.attr('transform', d3.event.transform)
      }

      //todo switch out of d3 to leaflet or mapbox, due to the need for re-render using svg being slow
      const zoom = d3
        .zoom()
        .scaleExtent([1, 40])
        .translateExtent([
          [0, 0],
          [width, height]
        ])
        .extent([
          [0, 0],
          [width, height]
        ])
        .on('zoom', zoomed)

      const svg = map
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(zoom)

      const g = svg.append('g')

      d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json').then(
        us => {
          const scaleToObject = {
            state: 'states',
            county: 'counties'
          }

          const geoms = topojson.feature(us, us.objects[scaleToObject[scale]])
            .features

          if (selectColumn && Object.keys(entries).includes(selectColumn)) {
            const census_data = new Map(Object.entries(entries[selectColumn]))
            // Data and color scale
            const extent = d3.extent(Array.from(census_data.values()))
            const colorScale = d3
              .scaleQuantile()
              .domain(extent)
              .range(d3.schemeBlues[7])

            g.call(zoom)
              .selectAll('path')
              .data(geoms)
              .enter()
              .append('path')
              .attr('d', path)
              .attr('fill', d => {
                const value = census_data.get(d.id)
                return value ? colorScale(value) : 'rgb(216, 216, 216)'
              })

            // Add legend
            svg
              .append('g')
              .call(zoom)
              .attr('transform', `translate(${width / 2},${margin / 2})`)
              .append(() =>
                legend({
                  color: colorScale,
                  width: 260,
                  tickFormat: '.0f'
                })
              )
          } else {
            // Draw the map without data
            g.selectAll('path')
              .data(geoms)
              .enter()
              .append('path')
              .attr('d', path)
              .attr('fill', 'rgb(216, 216, 216)')
          }
        }
      )

      return map.remove()
    }
  }, [mapRef, scale, selectColumn, entries])

  useEffect(() => {
    //todo - resize svg
  }, [dimensions])

  useEffect(() => {
    if (!selectColumn && entries && Object.keys(entries).length > 0) {
      setSelectColumn(Object.keys(entries)[0])
    }
  }, [entries])

  return (
    <div ref={wrapperRef}>
      <div ref={mapRef} style={{ margin: 20 }}></div>
      <Form style={{ width: '80%', marginLeft: '2em' }}>
        <Form.Group controlId="formSelectColumn">
          <Form.Control
            as="select"
            onChange={e => setSelectColumn(e.target.value)}
            value={selectColumn}
            required
          >
            <option value="">Select column to display on map</option>
            {entries
              ? Object.keys(entries).map(column => (
                  <option value={column}>{column}</option>
                ))
              : null}
          </Form.Control>
        </Form.Group>
      </Form>
    </div>
  )
}

export default connect(['data', 'scale'])(({ data, scale }) => (
  <MapView data={data} scale={scale} />
))
