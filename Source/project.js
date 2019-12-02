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
		.attr('width', 1200)
		.attr('height', 1000)
		.attr('transform', 'translate(5,5)')

	// Group element for the filter
	d3.select('svg')
		.append('rect')
		.attr('height', filter_height)
		.attr('width', 10)
		.attr('id', 'filter')
		.attr('fill', 'gray')
		.attr('transform', 'translate(25, 300)')

	// Threshold line
	d3.select('svg').append('line').attr('id', 'threshold')
		.attr('x1', 0).attr('x2', 30).attr('y1', filter_height).attr('y2', filter_height)
		.attr('fill', 'None').attr('stroke', 'red').attr('stroke-width', 6).attr('opacity', 0.8)
		.attr('transform', 'translate(15, 300)')
		.raise()

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
	d3.select('#lefthand').append('g').attr('id', 'yaxis')
	// group that will contain x axis for right hand plot
	d3.select('#lefthand').append('g').attr('id', 'xaxis')

	// group that will contain y axis for right hand plot
	d3.select('#righthand').append('g').attr('id', 'yaxis')
	// group that will contain x axis for right hand plot
	d3.select('#righthand').append('g').attr('id', 'xaxis')

	// group that will contain y axis for pose plot
	d3.select('#pose').append('g').attr('id', 'yaxis')
	// group that will contain x axis for pose plot
	d3.select('#pose').append('g').attr('id', 'xaxis')

	// plot labels
	d3.select('#pose').append('text').text('OpenPose Visualizer')
		.attr('transform', 'translate('+(width/2)+',-15)').attr('text-anchor', 'middle').attr('fill', '#000').attr('font-size', '20px')

	setup_vis();
}

function setup_vis(){
	setup_buttons();

	setup_plot('pose', POSEKEYPOINT.NECK, 0, 0, pose_data.length);
	setup_plot('lefthand', HANDKEYPOINT.PALM, 0, 0, hand_left_data.length);
	setup_plot('righthand', HANDKEYPOINT.PALM, 0, 0, hand_right_data.length);

	d3.select('#selectButtonPose').on('change', function(d){
		var poseKeypoint = d3.select(this).property('value');
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
		setup_plot('pose', poseKeypoint, threshold, 0, pose_data.length);
	});
	d3.select('#selectButtonLeftHand').on('change', function(d){
		var lefthandKeypoint = d3.select(this).property('value');
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
		setup_plot('lefthand', lefthandKeypoint, threshold, 0, hand_left_data.length);
	});
	d3.select('#selectButtonRightHand').on('change', function(d){
		var righthandKeypoint = d3.select(this).property('value');
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
		setup_plot('righthand', righthandKeypoint, threshold, 0, hand_right_data.length);
	});

	filter_data();

	brush_data();
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

	data = data.slice(start, end + 1);
	//console.log(data);

	// xScale and xAxis
	var xScale = d3.scalePoint()
					.domain(data.map(function(e, index){return start + index;}))
					.range([0, width])
	var step = Math.ceil((end - start) / 15);
	//console.log(step);
	var xAxis = d3.axisBottom(xScale)
					.tickValues(d3.range(start, end, step));

	// yScale and yAxis
	var filtered_data = data.filter(function(d){
		//console.log(3 * keypointType + 1);
		var c1 = d[3 * keypointType + 1];
		var c2 = d[3 * keypointType + 2];
		return c1 >= threshold && c2 >= threshold;
	})

	var max = d3.max(filtered_data, d => d[3 * keypointType]);
	var min = d3.min(filtered_data, d => d[3 * keypointType]);

	//console.log(filtered_data);

	var yScale = d3.scaleLinear()
					.domain([min, max])
					.range([height, 0]);

	var yAxis = d3.axisLeft(yScale);

	var selection = d3.select('#' + plotType)
						.selectAll('.' + plotType + '_plot')
						.data(data);

	selection.exit().remove()

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
				.attr('r', 1)

	selection.filter(function(d){
						var c1 = d[3 * keypointType + 1];
						var c2 = d[3 * keypointType + 2];
						return c1 < threshold || c2 < threshold;
					})
					.attr('opacity', 0)

	selection.filter(function(d){
		var c1 = d[3 * keypointType + 1];
		var c2 = d[3 * keypointType + 2];
		return c1 >= threshold && c2 >= threshold;
	}).attr('opacity', 1);


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

var thresholdScale = d3.scaleLinear()
							.domain([0, filter_height])
							.range([1, 0]);


function filter_data(){
	function update_plots(){
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
		var poseKeypoint = d3.select('#selectButtonPose').property('value');
		var righthandKeypoint = d3.select('#selectButtonRightHand').property('value');
		var lefthandKeypoint = d3.select('#selectButtonLeftHand').property('value');

		setup_plot('pose', poseKeypoint, threshold, 0, pose_data.length);
		setup_plot('lefthand', lefthandKeypoint, threshold, 0, hand_left_data.length);
		setup_plot('righthand', righthandKeypoint, threshold, 0, hand_right_data.length);
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

function brush_data(){
	console.log("Entering brush_data()");
	var threshold = thresholdScale(d3.select('#threshold').attr('y1'));
	var poseKeypoint = d3.select('#selectButtonPose').property('value');
	var righthandKeypoint = d3.select('#selectButtonRightHand').property('value');
	var lefthandKeypoint = d3.select('#selectButtonLeftHand').property('value');
	function zoom_plots(){
		var interval = d3.event.selection;
		var ticks = d3.select('#pose')
						.select('#xaxis')
						.selectAll('.tick')
						.data();
		console.log(width * ticks.length / 16, ticks[0], ticks[1]);

		var xScale = d3.scalePoint()
						.domain(ticks)
						.range([0, width * ticks.length / 16]);

		var start;
		var end;
		for(var i = 0; i < ticks.length - 1; ++i){
			var cur = xScale(ticks[i]);
			var next = xScale(ticks[i + 1]);
			console.log(cur, next);
			if(cur <= interval[0] && next >= interval[0]){
				start = ticks[i + 1];
			}
			if(cur <= interval[1] && next >= interval[1]){
				end = ticks[i];
			}
		}
		console.log(start, end);
		setup_plot('pose', poseKeypoint, threshold, start, end);
		setup_plot('lefthand', lefthandKeypoint, threshold, start, end);
		setup_plot('righthand', righthandKeypoint, threshold, start, end);
	}

	var brush = d3.brushX()
					.extent([[0, 0], [1078, 18]])
					.on('end', zoom_plots);

	d3.select('#pose')
		.select('#xaxis')
		.call(brush);
	}
