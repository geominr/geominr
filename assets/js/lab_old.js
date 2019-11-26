//control scale change
//todo: switch to vue or react
const worldDOM = document.querySelector('.nav-link[href="#tab-1-1"]');
const usDOM = document.querySelector('.nav-link[href="#tab-1-2"]');

const svg = d3.select("svg"),
    margin = 10,
    width = +svg.attr("width") - margin,
    height = +svg.attr("height") - margin;

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

const spinner = new Spinner({
    lines: 9,
    length: 9,
    width: 5,
    radius: 14,
    color: '#F36E65',
    speed: 1.9,
    trail: 40,
    top: '25%',
    className: 'spinner',
})

window.onload = () => {
    //init
    initWorld();

    worldDOM.addEventListener('click', () => {
        svg.selectAll("*").remove(); //clear
        initWorld();
    })
    usDOM.addEventListener('click', () => {
        svg.selectAll("*").remove(); //clear
        initUS();
    })

}

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


function initWorld() {
    // Load external data and boot
    spinner.spin(document.getElementById('data-view'));

    Promise.all(
            [
                d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
                d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv")
            ])
        .then(d => ready(null, d[0], d[1]))

    function ready(error, topo, population) {
        spinner.stop();
        const data = new Map();
        population.forEach(d => {
            data.set(d.code, +d.pop);
        });

        const path = d3.geoPath();

        const projection = d3.geoNaturalEarth1()
            .scale(width / 1.5 / Math.PI)
            .center([0, 0])
            .translate([width / 2, height / 2])

        // Data and color scale
        const colorScale = d3.scaleThreshold()
            .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
            .range(d3.schemeBlues[7]);

        const popFormat = d3.format(",")

        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return colorScale(d.total);
            })
            .on("mouseover", e => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(() => {
                        return `<strong>${e.properties.name}</strong>: ${popFormat(e.total)}`;
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
    }
}


function initUS() {
    // Load external data and boot
    spinner.spin(document.getElementById('data-view'));
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
        spinner.stop();
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
}