// widths and heights for our plots - you should use these in constructing scales
var lines_width = 1000, lines_height = 400;
var left_pad = 100, right_pad = 25, y_pad = 40
var lines_width = lines_width-(left_pad+right_pad), lines_height = lines_height-2*y_pad;

function plot_it()  {
	d3.select('body').append('svg').attr('width', 1000).attr('height', 1000).attr('transform', 'translate(5,5)')
	// group that will contain line plot (id: lines)
	d3.select('svg').append('g').attr('transform', 'translate('+left_pad+','+y_pad+')').attr('id', 'face')

	// group that will contain y axis for our line plot (id: yaxis)
	d3.select('#lines').append('g').attr('id', 'yaxis')
	// group that will contain x axis for both our line plot and heatmap (id: xaxis)
	d3.select('#lines').append('g').attr('id', 'xaxis')

	// plot labels
	d3.select('#lines').append('text').text('Data Visualization Project')
		.attr('transform', 'translate('+(lines_width/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')

	setup_vis();
}

function setup_vis(){
	//console.log(face_data)
	
	var xScale = d3.scalePoint()
					.domain(face_data.map(function(e,index) {return index}))
					.range([0, lines_width])

	var max = d3.max(face_data, d => d[0])
	var min = d3.min(face_data, d => d[0])
	//console.log(max, min)

	var yScale = d3.scaleLinear()
					.domain([min, max])
					.range([lines_height, 0])

	var line = d3.line()
					.x(function(d, index){return xScale(index)})
					.y(function(d){return yScale(d[0])})

	d3.select('#face')
		.selectAll('.face_plot')
		.data(face_data)
		.enter()
		.append('circle')
		.attr('cx', function(d, index){return xScale(index)})
		.attr('cy', function(d){return d == null ? lines_height : ( ((d[1] + d[2]) / 2 < 0.02) ? lines_height : yScale(d[0]))})
		.attr('r', 1)
	

	/*
	var test = face_data.slice(500, 1000)

	var xScale = d3.scalePoint()
					.domain(test.map(function(e,index) {return index}))
					.range([0, lines_width])

	var max = d3.max(test, d => d[0])
	var min = d3.min(test, d => d[0])
	//console.log(max, min)

	var yScale = d3.scaleLinear()
					.domain([min, max])
					.range([lines_height, 0])

	var line = d3.line()
					.x(function(d, index){return xScale(index)})
					.y(function(d){return yScale(d[0])})

	d3.select('#face')
		.selectAll('.face_plot')
		.data(test)
		.enter()
		.append('circle')
		.attr('cx', function(d, index){return xScale(index)})
		.attr('cy', function(d){return d == null ? lines_height : ( ((d[1] + d[2]) / 2 < 0.02) ? lines_height : yScale(d[0]))})
		.attr('r', 1)
	*/
}
