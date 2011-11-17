$(document).ready(function () {
	var ready = false;
	var dragging = false;
	var pointerStartPosX = 0;
	var pointerEndPosX = 0;
	var pointerDistance = 0;
	
	var monitorStartTime = 0;
	var monitorInt = 10;
	var ticker = 0;
	
	var speedMultiplier = 10;
	
	var totalFrames = 180;
	var currentFrame = 0;
	var frames = [];
	var endFrame = 0;
	var loadedImages = 0;
	
	var spinner;
	
	function addSpinner () {
		spinner = new CanvasLoader("spinner");
		spinner.setShape("spiral");
		spinner.setDiameter(30);
		spinner.setDensity(90);
		spinner.setSpeed(3);
		spinner.setColor("#333333");
		spinner.show();
		$("#spinner").fadeIn("slow");
	};
	
	function loadImage() {
		var li = document.createElement("li");
		var imageName = "img/threesixty_" + (loadedImages + 1) + ".jpg";
		var image = $('<img>').attr('src', imageName).addClass("previous-image").appendTo(li);
		frames.push(image);
		$("#threesixty_images").append(li);
		$(image).load(function() {
			imageLoaded();
		});
	};
	
	function imageLoaded() {
		loadedImages++;
		if (loadedImages == totalFrames) {
			frames[0].removeClass("previous-image").addClass("current-image");;
			$("#spinner").fadeOut("slow", function(){
				spinner.hide();
				showThreesixty();
			});
		} else {
			loadImage();
		}
	};
	
	function showThreesixty () {
		$("#threesixty_images").fadeIn("slow");
		
		ready = true;
		endFrame = -720;
		refresh();
	};
	
	addSpinner();
	loadImage();	
	
	function getPointerEvent(event) {
		return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
	};
	
	$("#threesixty").live("touchstart", function (event) {
		event.preventDefault();
		pointerStartPosX = getPointerEvent(event).pageX;
		dragging = true;
	});
	
	$("#threesixty").live("touchmove", function (event) {
		event.preventDefault();
		trackPointer(event);
	});
	
	$("#threesixty").live("touchend", function (event) {
		event.preventDefault();
		dragging = false;
	});
	
	$("#threesixty").mousedown(function (event) {
		event.preventDefault();
		pointerStartPosX = getPointerEvent(event).pageX;
		dragging = true;
	});
	
	$(document).mouseup(function (event){
		event.preventDefault();
		dragging = false;
	});
	
	$(document).mousemove(function (event){	
		event.preventDefault();
		trackPointer(event);
	});
	
	function getNormalizedCurrentFrame() {
		var c = -Math.ceil(currentFrame % totalFrames);
		if (c < 0) c += (totalFrames - 1);
		return c;
	};
	
	function hidePreviousImage() {
		frames[getNormalizedCurrentFrame()].removeClass("current-image").addClass("previous-image");
	};
	
	function showCurrentImage() {
		frames[getNormalizedCurrentFrame()].removeClass("previous-image").addClass("current-image");
	};
	
	function trackPointer(event) {
		if (ready && dragging) {
			pointerEndPosX = getPointerEvent(event).pageX;
			if(monitorStartTime < new Date().getTime() - monitorInt) {
				pointerDistance = pointerEndPosX - pointerStartPosX;
				endFrame = currentFrame + Math.ceil((totalFrames - 1) * speedMultiplier * (pointerDistance / $("#threesixty").width()));
				
				refresh();
				monitorStartTime = new Date().getTime();
				pointerStartPosX = getPointerEvent(event).pageX;
			}
		}
	};
	
	function refresh () {
		if (ticker === 0) {
			ticker = self.setInterval(function () { render(); }, Math.round(1000 / 60));
		}
	};
	
	function render () {
		if(currentFrame !== endFrame)
		{	
			var inertia = endFrame < currentFrame ? Math.floor((endFrame - currentFrame) * 0.1) : Math.ceil((endFrame - currentFrame) * 0.1);
			hidePreviousImage();
			currentFrame += inertia;
			showCurrentImage();
		} else {
			window.clearInterval(ticker);
			ticker = 0;
		}
	};
});