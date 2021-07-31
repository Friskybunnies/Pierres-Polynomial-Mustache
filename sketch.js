let x_vals = [];
let y_vals = [];

let a, b, c, d;

let w, h;
let coefficients;

let learningRate;
let lr_slider;
let optimizer;

let deg_slider;
let poly_deg;

function setup() {
	w = window.innerWidth-20;
	h = window.innerHeight-20;

	learningRate = 0.15;
	poly_deg = 0;

	createCanvas(w, h);

	setOptimizer();

	deg_slider = createSlider(10, 30, 10);
	deg_slider.position(windowWidth/13, windowHeight/9 * 8);
	deg_slider.style('width', '200px');
	lr_slider = createSlider(0, 20, 3);
	lr_slider.position(windowWidth/13 * 10.2, windowHeight/9 * 8);
	lr_slider.style('width', '200px');

	a = tf.variable(tf.scalar(random(-1, 1)));
	b = tf.variable(tf.scalar(random(-1, 1)));
	c = tf.variable(tf.scalar(random(-1, 1)));
	d = tf.variable(tf.scalar(random(-1, 1)));
}

function loss(pred, labels) {
	return pred.sub(labels).square().mean();
}

function setOptimizer() {
	optimizer = tf.train.adam(learningRate)
}

function predict(x) {
	const xs = tf.tensor1d(x);
	let ys = tf.scalar(0);

	coefficients = [a, b, c, d];

	for (let i = 0; i <= poly_deg; i++) {
		ys = ys.add(xs.pow(tf.scalar(i)).mul(coefficients[i]));
	}

	return ys;
}

function mousePressed() {
	if ((mouseX < w && mouseY < h) && (mouseX > 300 || mouseY > 60)) {
		let x = map(mouseX, 0, w, -1, 1);
		let y = map(mouseY, 0, h, 1, -1);
		x_vals.push(x);
		y_vals.push(y);
	}
}

function draw() {
	background(255, 228, 173);

	// polynomial degree gets taken from slider value
	poly_deg = round(deg_slider.value() / 10);

	// learning rate gets taken from slider value
	if (learningRate!=lr_slider.value()/20) {
		learningRate = lr_slider.value() / 20;
		setOptimizer();
	}
	
	// minimize the loss with the optimizer
	tf.tidy(() => {
		if (x_vals.length > 0) {
			const ys = tf.tensor1d(y_vals);
			optimizer.minimize(() => loss(predict(x_vals), ys));
		}
	});

	// draw the dots
	stroke(255, 0, 0);
  	strokeWeight(windowHeight/20);
	for (let i = 0; i < x_vals.length; i++) {
		let px = map(x_vals[i], -1, 1, 0, w);
		let py = map(y_vals[i], -1, 1, h, 0);
		point(px, py);
	}

	// instantiate x-intervals of the curve
	const curveX = [];

	for (let x = -1; x < 1.01; x += 0.025) {
		curveX.push(x);
	}

	// get predictions for y-values of the curve
	const ys = tf.tidy(() => predict(curveX));
	let curveY = ys.dataSync();
	ys.dispose();

	// draw the curve
	beginShape();
	stroke(122, 58, 31);
	noFill();
  	strokeWeight(windowHeight/25);
	for (let i = 0; i < curveX.length; i++) {
		let x = map(curveX[i], -1, 1, 0, w);
		let y = map(curveY[i], -1, 1, h, 0);
		vertex(x, y);
	}
	endShape();

	stroke(0, 0, 200);
	noFill();
	arc(windowWidth/21 * 8, windowHeight/8, min(windowHeight/5, windowHeight/5), min(windowHeight/5, windowHeight/5), 0, HALF_PI + QUARTER_PI);
	arc(windowWidth/21 * 13, windowHeight/8, min(windowHeight/5, windowHeight/5), min(windowHeight/5, windowHeight/5), -100, PI);
	noFill();

	stroke(255, 0, 100);
	arc(windowWidth/2, windowHeight/20 * 20, windowHeight/2, windowHeight/2, -HALF_PI - QUARTER_PI -.5, -QUARTER_PI + .5);
	noFill();

	// render the text
	strokeWeight(1);
	fill(0);
	textSize(windowWidth/80);
	text('polynomial degree: ' + poly_deg, windowWidth/11.5, windowHeight/9 * 7.7);
	text('learning rate: ' + learningRate, windowWidth/13 * 10.4, windowHeight/9 * 7.7);
	let story = 'Oh no! Pierre has a case of adult chicken pox :( Luckily, he has a magical mustache to help him cover his face. As he gets more blemishes, you can help him by making his mustache contort to cover them up. But be careful! While more curves will cover more blemishes, too many will give him a very abnormal mustache!';
	textSize(windowWidth/90);
	fill(200, 0, 202);
	text(story, 20, 20, windowWidth/5.5, windowHeight/2);
}

	