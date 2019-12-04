// widths and heights for the plots
var width = 1200, height = 250;
var left_pad = 100, right_pad = 25, y_pad = 40
var width = width-(left_pad+right_pad), height = height-2*y_pad;
var filter_height = 200

var POSEKEYPOINT = {
	NOSE: 0,
	NECK: 1,
	RSHOULDER: 2,
	RELBOW: 3,
	RWRIST: 4,
	LSHOULDER: 5,
	LELBOW: 6,
	LWRIST: 7,
	MIDHIP: 8,
	RHIP: 9,
	RKNEE: 10,
	RANKLE: 11,
	LHIP: 12,
	LKNEE: 13,
	LANKLE: 14,
	REYE: 15,
	LEYE: 16,
	REAR: 17,
	LEAR: 18,
	LBIGTOE: 19,
	LSMALLTOE: 20,
	LHEEL: 21,
	RBIGTOE: 22,
	RSMALLTOE: 23,
	RHEEL: 24,
}

var HANDKEYPOINT = {
	PALM: 0,
	THUMBR: 1,
	THUMBB: 2,
	THUMBM: 3,
	THUMBT: 4,
	INDEXR: 5,
	INDEXB: 6,
	INDEXM: 7,
	INDEXT: 8,
	MIDDLER: 9,
	MIDDLEB: 10,
	MIDDLEM: 11,
	MIDDLET: 12,
	RINGR: 13,
	RINGB: 14,
	RINGM: 15,
	RINGT: 16,
	PINKYR: 17,
	PINKYB: 18,
	PINKYM: 19,
	PINKYT: 20
}

function plot_it()  {
	d3.select('body')
		.append('svg')
		.attr('width', 1300)
		.attr('height', 1000)
		.attr('transform', 'translate(5,5)');

	// Filter bar
	d3.select('svg')
		.append('g')
		.attr('id', 'filter')
		.attr('transform', 'translate(35, 300)');
	d3.select('#filter')
		.append('g')
		.attr('id', 'axis');
	d3.select('#filter')
		.append('g')
		.attr('id', 'legends');

	var scale = d3.scalePoint()
					.domain([0, 0.25, 0.5, 0.75, 1])
					.range([filter_height, 0]);
	var axis = d3.axisLeft(scale);
	d3.select('#filter')
		.select('#axis')
		.call(axis);
	
	var confidences = [0, 0.25, 0.5, 0.75, 1];
	d3.select('#filter')
		.select('#legends')
		.selectAll('#colors')
		.data(confidences)
		.enter()
		.append('rect')
		.attr('height', filter_height / 4)
		.attr('width', 20)
		.attr('x', 0)
		.attr('y', function(d){return scale(d) - filter_height / 4})
		.attr('fill', function(d){return confidenceScale(d)});

	// Threshold line
	d3.select('svg').append('line').attr('id', 'threshold')
		.attr('x1', 0).attr('x2', 30).attr('y1', filter_height).attr('y2', filter_height)
		.attr('fill', 'None').attr('stroke', 'black').attr('stroke-width', 6).attr('opacity', 0.8)
		.attr('transform', 'translate(35, 300)')
		.raise();

	// Group elements for different plots
	d3.select('svg')
		.append('g')
		.attr('transform', 'translate('+left_pad+','+y_pad+')')
		.attr('id', 'pose');

	d3.select('svg')
		.append('g')
		.attr('transform', 'translate('+left_pad+','+(height + 100)+')')
		.attr('id', 'lefthand');

	d3.select('svg')
		.append('g')
		.attr('transform', 'translate('+left_pad+','+ (2 * (height + 100))+')')
		.attr('id', 'righthand');

	// group that will contain y axis for left hand plot
	d3.select('#lefthand').append('g').attr('id', 'yaxis');
	// group that will contain x axis for right hand plot
	d3.select('#lefthand').append('g').attr('id', 'xaxis');
	// group that will contain the scatter plot
	d3.select('#lefthand').append('g').attr('id', 'scatter');

	// group that will contain y axis for right hand plot
	d3.select('#righthand').append('g').attr('id', 'yaxis');
	// group that will contain x axis for right hand plot
	d3.select('#righthand').append('g').attr('id', 'xaxis');
	// group that will contain the scatter plot
	d3.select('#righthand').append('g').attr('id', 'scatter');

	// group that will contain y axis for pose plot
	d3.select('#pose').append('g').attr('id', 'yaxis');
	// group that will contain x axis for pose plot
	d3.select('#pose').append('g').attr('id', 'xaxis');
	// group that will contain the scatter plot
	d3.select('#pose').append('g').attr('id', 'scatter');

	d3.select('#pose')
		.append('text')
		.attr('transform', 'translate(' + width + ',' + height / 2 + ')')
		.text('pose')
		.attr('font-size', '15px')
	d3.select('#lefthand')
		.append('text')
		.attr('transform', 'translate(' + width + ',' + height / 2 + ')')
		.text('lefthand')
		.attr('font-size', '15px')
	d3.select('#righthand')
		.append('text')
		.attr('transform', 'translate(' + width + ',' + height / 2 + ')')
		.text('righthand')
		.attr('font-size', '15px')

	// plot labels
	d3.select('#pose').append('text').text('OpenPose Visualizer')
		.attr('transform', 'translate('+(width/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')

	setup_vis();
}

var start = 0;
var end = 3600;
var thresholdScale = d3.scaleLinear()
						.domain([0, filter_height])
						.range([1, 0]);
var confidenceScale = d3.scaleThreshold()
							.domain([0.25, 0.5, 0.75, 1])
							.range(['#d7191c', '#fdae61', '#984ea3', '#4daf4a', '#2b83ba']);

function setup_vis(){
	setup_buttons();
	
	setup_plots(0, 3600);

	d3.select('#selectButtonPose').on('change', function(d){
		var poseKeypoint = d3.select(this).property('value');
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
		setup_plot('pose', poseKeypoint, threshold, start, end);
	});
	d3.select('#selectButtonLeftHand').on('change', function(d){
		var lefthandKeypoint = d3.select(this).property('value');
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
		setup_plot('lefthand', lefthandKeypoint, threshold, start, end);
	});
	d3.select('#selectButtonRightHand').on('change', function(d){
		var righthandKeypoint = d3.select(this).property('value');
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
		setup_plot('righthand', righthandKeypoint, threshold, start, end);
	});
	d3.select('#reset').on('click', function(d){
		setup_plots(0, 3600);
	})

	filter_data();
	
	var brush = d3.brushX()
					.extent([[0, -height], [1078, 2 * height + 180]])
					.on('end', zoom_plots);

	d3.select('#pose')
		.select('#xaxis')
		.call(brush);

	function zoom_plots(){
		var interval = d3.event.selection;

		if(interval != null){
			var ticks = d3.select('#pose')
							.select('#xaxis')
							.selectAll('.tick')
							.data();
			var xScale = d3.scaleLinear()
							.domain([ticks[0], ticks[ticks.length - 1]])
							.range([0, width]);

			var start = Math.ceil(xScale.invert(interval[0]));
			var end = Math.floor(xScale.invert(interval[1]));
			//console.log(start, end);
			setup_plots(start, end);
		}

		if(interval){
			d3.select('#pose')
				.select('#xaxis')
				.call(brush.move, null);
		}
	}
}

function setup_plots(new_start, new_end){
	start = new_start;
	end = new_end;
	var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
	//console.log(threshold, start, end);
	var poseKeypoint = d3.select('#selectButtonPose').property('value');
	var righthandKeypoint = d3.select('#selectButtonRightHand').property('value');
	var lefthandKeypoint = d3.select('#selectButtonLeftHand').property('value');

	setup_plot('pose', poseKeypoint, threshold, start, end);
	setup_plot('lefthand', lefthandKeypoint, threshold, start, end);
	setup_plot('righthand', righthandKeypoint, threshold, start, end);
}

function setup_plot(plotType, keypointType, threshold, start, end){
	var data;
	if(plotType == 'pose'){
		data = pose_data;
	}
	else if(plotType == 'lefthand'){
		data = hand_left_data;
	}
	else if(plotType == 'righthand'){
		data = hand_right_data;
	}
	else{
		throw 'unknown plotType';
	}
	//console.log(data.length);

	data = data.slice(start, end + 1);
	//console.log(data);

	// xScale and xAxis
	var xScale = d3.scaleLinear()
					.domain([start, end])
					.range([0, width]);
	var xAxis = d3.axisBottom(xScale)
					.ticks(15);

	// yScale and yAxis
	var filtered_data = data.filter(function(d){
		//console.log(3 * keypointType + 1);
		if(d.length > 0){
			var c1 = d[3 * keypointType + 1];
			var c2 = d[3 * keypointType + 2];
			return c1 >= threshold && c2 >= threshold;
		}
		else{
			return false;
		}
	})

	var max = d3.max(filtered_data, d => d[3 * keypointType]);
	var min = d3.min(filtered_data, d => d[3 * keypointType]);

	//console.log(filtered_data);

	var yScale = d3.scaleLinear()
					.domain([min, max])
					.range([height, 0]);

	var yAxis = d3.axisLeft(yScale);

	//console.log(confidenceScale(0.3));

	var selection = d3.select('#' + plotType)
						.select('#scatter')
						.selectAll('.' + plotType + '_plot')
						.data(data);

	selection.exit().remove();

	selection.enter()
				.append('circle')
				.attr('class', plotType + '_plot')
				.merge(selection)
				.attr('cx', function(d, index){return xScale(start + index);})
				.transition()
				.duration(800)
				.attr('cy', function(d, index){
					if(d.length == 0 || d[3 * keypointType + 1] < threshold || d[3 * keypointType + 2] < threshold){
						//console.log('Index: ', index, ' has no data')
						return height;
					}
					else{
						return yScale(d[3 * keypointType]);
					}
				})
				.attr('fill', function(d){
					if(d.length != 0){
						//console.log(confidenceScale((d[3 * keypointType + 1] + d[3 * keypointType + 2]) / 2));
						return confidenceScale((d[3 * keypointType + 1] + d[3 * keypointType + 2]) / 2);
					}
					else{
						return confidenceScale(0);
					}
				})
				.attr('r', 2);

	var garbage = d3.select('#' + plotType)
					.select('#scatter')
					.selectAll('.' + plotType + '_plot')
					.filter(function(d){
						if(d.length > 0){
							//console.log(plotType, d.length);
							var c1 = d[3 * keypointType + 1];
							var c2 = d[3 * keypointType + 2];
							//return c1 < threshold || c2 < threshold;
							return (c1 + c2) / 2 < threshold;
						}else{
							//console.log(plotType, d.length);
							return true;
						}	
					}).style('opacity', 0);
	//console.log(plotType, garbage);

	var good = d3.select('#' + plotType)
					.select('#scatter')
					.selectAll('.' + plotType + '_plot')
					.filter(function(d){
						if(d.length > 0){
							//console.log(plotType, d.length);
							var c1 = d[3 * keypointType + 1];
							var c2 = d[3 * keypointType + 2];
							//return c1 < threshold || c2 < threshold;
							return (c1 + c2) / 2 >= threshold;
						}else{
							//console.log(plotType, d.length);
							return false;
						}	
					}).style('opacity', 1);

	d3.select('#' + plotType)
		.select('#xaxis')
    	.call(xAxis)
    	.attr('transform', 'translate(0,' + height + ')');

    d3.select('#' + plotType)
    	.select('#yaxis')
		.call(yAxis);
}


function setup_buttons(){
	var hand = [];
	for(var key in HANDKEYPOINT){
		hand.push(key);
	}
	d3.select('#selectButtonLeftHand')
		.selectAll('options')
		.data(hand)
		.enter()
		.append('option')
		.text(function(d){return d})
		.attr('value', function(d){return HANDKEYPOINT[d]});

	
	d3.select('#selectButtonRightHand')
		.selectAll('options')
		.data(hand)
		.enter()
		.append('option')
		.text(function(d){return d})
		.attr('value', function(d){return HANDKEYPOINT[d]});


	var pose = [];
	for(var key in POSEKEYPOINT){
		pose.push(key);
	}
	d3.select('#selectButtonPose')
		.selectAll('options')
		.data(pose)
		.enter()
		.append('option')
		.text(function(d){return d})
		.attr('value', function(d){return POSEKEYPOINT[d]});
}

function filter_data(){
	function update_plots(){
		setup_plots(start, end);
	}


	function dragged() {
	    var y = d3.mouse(this)[1];
	    d3.select(this)
	    	.attr('y1', y <= filter_height ? (y >= 0 ? y : 0) : filter_height)
	    	.attr('y2', y <= filter_height ? (y >= 0 ? y : 0) : filter_height);
	}
	
	var drag = d3.drag().on('drag', dragged)
						.on('end', update_plots);

	d3.select('#threshold').call(drag);
}
