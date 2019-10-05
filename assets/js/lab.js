//control scale change
//todo: switch to vue or react
const worldDOM = document.querySelector('.nav-link[href="#tab-1-1"]');
const usDOM = document.querySelector('.nav-link[href="#tab-1-2"]');


//census promise
function censusPromise(args) {
    return new Promise(function (resolve, reject) {
        census(args, function (err, json) {
            if (!err) {
                resolve(json);
            } else {
                reject(err);
            }
        });
    });
}

// The svg
const svg = d3.select("svg"),
    margin = 10,
    width = +svg.attr("width") - margin,
    height = +svg.attr("height") - margin;

// Load external data and boot
Promise.all(
        [
            d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json"),
            censusPromise({
                vintage: 2017,
                geoHierarchy: {
                    county: "*"
                },
                sourcePath: ["acs", "acs5"],
                values: ["B19083_001E"]
            })
        ])
    .then(d => ready(null, d[0], d[1]))

function ready(error, us, census_data) {
    const counties = topojson.feature(us, us.objects.counties).features;

    // Map and projection
    const projection = d3.geoAlbersUsa().scale(width).translate([width / 2, height / 2])
    const path = d3.geoPath(projection);

    const data = Object.assign(new Map(census_data.map(({
        B19083_001E,
        county,
        state
    }) => [`${state}${county}`, {
        value: +B19083_001E
    }])), {
        title: "GINI Index"
    })

    // Data and color scale
    const extent = d3.extent(Array.from(data.values()).map(i => i.value));
    const colorScale = d3.scaleQuantile()
        .domain(extent)
        .range(d3.schemeBlues[7]);


    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(counties)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => {
            const entry = data.get(d.id);
            return entry ? colorScale(entry.value) : 'rgb(155,155,155)'
        })
        .on("mouseover", e => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(() => {
                    const entry = data.get(e.id);
                    const value = entry ? entry.value : 'N/A'
                    return `<strong>${e.properties.name}</strong>: ${value}`;
                })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            //todo add tip
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add legend
    svg.append("g")
        .attr("transform", `translate(${width /2},${margin /2 })`)
        .append(() => legend({
            color: colorScale,
            title: data.title,
            width: 260,
            tickFormat: ".2f"
        }));
}