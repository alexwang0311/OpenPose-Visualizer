// widths and heights for the plots
var width = 1200, height = 250;
var left_pad = 100, right_pad = 25, y_pad = 40
var width = width-(left_pad+right_pad), height = height-2*y_pad;
var filter_height = 200

var FaceKeypoint = {

}

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
		.attr('id', 'pose')

	d3.select('svg')
		.append('g')
		.attr('transform', 'translate('+left_pad+','+(height + 100)+')')
		.attr('id', 'righthand')

	d3.select('svg')
		.append('g')
		.attr('transform', 'translate('+left_pad+','+ (2 * (height + 100))+')')
		.attr('id', 'lefthand')

	d3.select('svg')
		.append('g')
		.attr('transform', 'translate('+left_pad+','+ (3 * (height + 100)) +')')
		.attr('id', 'face')

	// group that will contain y axis for face plot
	d3.select('#face').append('g').attr('id', 'yaxis')
	// group that will contain x axis for face plot
	d3.select('#face').append('g').attr('id', 'xaxis')

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

	d3.select('#selectButtonLeftHand').on('change', function(d){
		var lefthandKeypoint = d3.select(this).property('value')
		console.log(lefthandKeypoint)
		setup_lefthand(lefthandKeypoint)
	})

	d3.select('#selectButtonRightHand').on('change', function(d){
		var righthandKeypoint = d3.select(this).property('value')
		console.log(righthandKeypoint)
		setup_righthand(righthandKeypoint)
	})

	d3.select('#selectButtonPose').on('change', function(d){
		var poseKeypoint = d3.select(this).property('value')
		console.log(poseKeypoint)
		setup_pose(poseKeypoint)
	})

	filter_data()
}

function setup_face(faceKeypoint){
	// xScale
	var xScale = d3.scalePoint()
					.domain(face_data.map(function(e, index){return index}))
					.range([0, width])

	var step = 100
	var xAxis = d3.axisBottom(xScale)
					.tickValues(d3.range(0, face_data.length, step))

	// yScale and yAxis for face plot
	var max = d3.max(face_data, d => d[3 * faceKeypoint])
	var min = d3.min(face_data, d => d[3 * faceKeypoint])

	var face_yScale = d3.scaleLinear()
					.domain([min, max])
					.range([height, 0])

	var face_yAxis = d3.axisLeft(face_yScale)

	// Create the face plot
	d3.select('#face')
		.selectAll('.face_plot')
		.data(face_data)
		.enter()
		.append('circle')
		.attr('cx', function(d, index){return xScale(index)})
		.attr('cy', function(d, index){
			if(d.length == 0){
				//console.log('Index: ', index, ' has no data')
				return height
			}
			else{
				return face_yScale(d[3 * faceKeypoint])
			}
		})
		.attr('r', 1)

	d3.select('#face').select('#xaxis')
		.call(xAxis)
		.attr('transform', 'translate(0,' + height + ')')

	d3.select('#face').select('#yaxis')
		.call(face_yAxis)
}

function setup_pose(poseKeypoint){
	var xScale = d3.scalePoint()
					.domain(face_data.map(function(e, index){return index}))
					.range([0, width])

	var step = 100
	var xAxis = d3.axisBottom(xScale)
					.tickValues(d3.range(0, face_data.length, step))

	// yScale and yAxis for pose plot
	var max = d3.max(pose_data, d => d[3 * poseKeypoint])
	var min = d3.min(pose_data, d => d[3 * poseKeypoint])

	var pose_yScale = d3.scaleLinear()
					.domain([min, max])
					.range([height, 0])

	var pose_yAxis = d3.axisLeft(pose_yScale)

	var poseSelection = d3.select('#pose')
							.selectAll('.pose_plot')
							.data(pose_data)

	poseSelection.exit().remove()

	poseSelection.enter()
					.append('circle')
					.attr('class', 'pose_plot')
					.merge(poseSelection)
					.attr('cx', function(d, index){return xScale(index)})
					.transition()
					.duration(800)
					.attr('cy', function(d, index){
						if(d.length == 0){
							//console.log('Index: ', index, ' has no data')
							return height
						}
						else{
							return pose_yScale(d[3 * poseKeypoint])
						}
					})
					.attr('r', 1)

	d3.select('#pose').select('#xaxis')
    	.call(xAxis)
    	.attr('transform', 'translate(0,' + height + ')')

    d3.select('#pose').select('#yaxis')
		.call(pose_yAxis)

}

function setup_righthand(righthandKeypoint){
	var xScale = d3.scalePoint()
					.domain(face_data.map(function(e, index){return index}))
					.range([0, width])

	var step = 100
	var xAxis = d3.axisBottom(xScale)
					.tickValues(d3.range(0, face_data.length, step))

	// yScale and yAxis for right hand plot
	var max = d3.max(hand_right_data, d => d[3 * righthandKeypoint])
	var min = d3.min(hand_right_data, d => d[3 * righthandKeypoint])

	var hand_right_yScale = d3.scaleLinear()
					.domain([min, max])
					.range([height, 0])

	var hand_right_yAxis = d3.axisLeft(hand_right_yScale)

	var righthandSelection = d3.select('#righthand')
								.selectAll('.right_hand_plot')
								.data(hand_right_data)

	righthandSelection.exit().remove()

	righthandSelection.enter()
						.append('circle')
						.attr('class', 'right_hand_plot')
						.merge(righthandSelection)
						.attr('cx', function(d, index){return xScale(index)})
						.transition()
						.duration(800)
						.attr('cy', function(d, index){
							if(d.length == 0){
								//console.log('Index: ', index, ' has no data')
								return height
							}
							else{
								return hand_right_yScale(d[3 * righthandKeypoint])
							}
						})
						.attr('r', 1)

	d3.select('#righthand').select('#xaxis')
    	.call(xAxis)
    	.attr('transform', 'translate(0,' + height + ')')

    d3.select('#righthand').select('#yaxis')
		.call(hand_right_yAxis)
}

function setup_lefthand(lefthandKeypoint){
	var xScale = d3.scalePoint()
					.domain(face_data.map(function(e, index){return index}))
					.range([0, width])

	var step = 100
	var xAxis = d3.axisBottom(xScale)
					.tickValues(d3.range(0, face_data.length, step))

	var max = d3.max(hand_left_data, d => d[3 * lefthandKeypoint])
	var min = d3.min(hand_left_data, d => d[3 * lefthandKeypoint])

	var hand_left_yScale = d3.scaleLinear()
							.domain([min, max])
							.range([height, 0])

	var hand_left_yAxis = d3.axisLeft(hand_left_yScale)

	var lefthandSelection = d3.select('#lefthand')
								.selectAll('.left_hand_plot')
								.data(hand_left_data)

	lefthandSelection.exit()
					.remove()

	lefthandSelection.enter()
						.append('circle')
						.attr('class', 'left_hand_plot')
						.merge(lefthandSelection)
						.attr('cx', function(d, index){return xScale(index)})
						.transition()
						.duration(800)
						.attr('cy', function(d, index){
							if(d.length == 0){
								//console.log('Index: ', index, ' has no data')
								return height
							}
							else{
								return hand_left_yScale(d[3 * lefthandKeypoint])
							}
						})
						.attr('r', 1)

    d3.select('#lefthand').select('#xaxis')
    	.call(xAxis)
    	.attr('transform', 'translate(0,' + height + ')')

    d3.select('#lefthand').select('#yaxis')
		.call(hand_left_yAxis)
}

function setup_buttons(){
	var hand = [];
	for(var key in HANDKEYPOINT){
		hand.push(key)
	}
	d3.select('#selectButtonLeftHand')
		.selectAll('options')
		.data(hand)
		.enter()
		.append('option')
		.text(function(d){return d})
		.attr('value', function(d){return HANDKEYPOINT[d]})

	
	d3.select('#selectButtonRightHand')
		.selectAll('options')
		.data(hand)
		.enter()
		.append('option')
		.text(function(d){return d})
		.attr('value', function(d){return HANDKEYPOINT[d]})


	var pose = []
	for(var key in POSEKEYPOINT){
		pose.push(key)
	}
	d3.select('#selectButtonPose')
		.selectAll('options')
		.data(pose)
		.enter()
		.append('option')
		.text(function(d){return d})
		.attr('value', function(d){return POSEKEYPOINT[d]})
}

function filter_data(){
	var thresholdScale = d3.scaleLinear()
							.domain([0, filter_height])
							.range([1, 0])

	function check(){
		var threshold = thresholdScale(d3.select('#threshold').attr('y1'))
		var pose_plot = d3.selectAll('.pose_plot')
		var left_hand_plot = d3.selectAll('.left_hand_plot')
		var right_hand_plot = d3.selectAll('.right_hand_plot')
		var poseKeypoint = d3.select('#selectButtonPose').property('value')
		var lefthandKeypoint = d3.select('#selectButtonLeftHand').property('value')
		var righthandKeypoint = d3.select('#selectButtonRightHand').property('value')
		pose_plot.attr('opacity', 1)
		left_hand_plot.attr('opacity', 1)
		right_hand_plot.attr('opacity', 1)

		pose_plot.filter(function(d){
			var c1 = d3.select(this).data()[0][3 * poseKeypoint + 1]
			var c2 = d3.select(this).data()[0][3 * poseKeypoint + 2]
			//console.log(c1, c2)
			return c1 < threshold || c2 < threshold
		}).attr('opacity', 0)

		left_hand_plot.filter(function(d){
			var c1 = d3.select(this).data()[0][3 * lefthandKeypoint + 1]
			var c2 = d3.select(this).data()[0][3 * lefthandKeypoint + 2]
			//console.log(c1, c2)
			return c1 < threshold || c2 < threshold
		}).attr('opacity', 0)

		right_hand_plot.filter(function(d){
			var c1 = d3.select(this).data()[0][3 * righthandKeypoint + 1]
			var c2 = d3.select(this).data()[0][3 * righthandKeypoint + 2]
			//console.log(c1, c2)
			return c1 < threshold || c2 < threshold
		}).attr('opacity', 0)
	}

	function dragged() {
	    var y = d3.mouse(this)[1]
	    d3.select(this)
	    	.attr('y1', y <= filter_height ? (y >= 0 ? y : 0) : filter_height)
	    	.attr('y2', y <= filter_height ? (y >= 0 ? y : 0) : filter_height)

	    check()
	}
	
	var drag = d3.drag().on('drag', dragged)

	d3.select('#threshold').call(drag)
}
