/**
* We wrap all our code in the jQuery "DOM-ready" function to make sure the script runs only
* after all the DOM elements are rendered and ready to take action
*/
$(document).ready(function () {
	// Tells if the app is ready for user interaction
	var ready = false,
			// Tells the app if the user is dragging the pointer
			dragging = false,
			// Stores the pointer starting X position for the pointer tracking
			pointerStartPosX = 0,
			// Stores the pointer ending X position for the pointer tracking
			pointerEndPosX = 0,
			// Stores the distance between the starting and ending pointer X position in each time period we are tracking the pointer
			pointerDistance = 0,

			// The starting time of the pointer tracking period
			monitorStartTime = 0,
			// The pointer tracking time duration
			monitorInt = 10,
			// A setInterval instance used to call the rendering function
			ticker = 0,
			// Sets the speed of the image sliding animation
			speedMultiplier = 10,
			// CanvasLoader instance variable
			spinner,
	
			// Stores the total amount of images we have in the sequence
			totalFrames = 180,
			// The current frame value of the image slider animation
			currentFrame = 0,
			// Stores all the loaded image objects
			frames = [],
			// The value of the end frame which the currentFrame will be tweened to during the sliding animation
			endFrame = 0,
			// We keep track of the loaded images by increasing every time a new image is added to the image slider
			loadedImages = 0,

			// Caching DOM element references
			$document = $(document),
			$container = $('#threesixty'),
			$images = $('#threesixty_images'),

			// Initial spin demo vars
			demoMode = false,
			fakePointer = {
				x: 0,
				speed: 4
			},
			fakePointerTimer = 0;
	
	/**
	* Adds a "spiral" shaped CanvasLoader instance to the #spinner div
	*/
	function addSpinner () {
		spinner = new CanvasLoader("spinner");
		spinner.setShape("spiral");
		spinner.setDiameter(90);
		spinner.setDensity(90);
		spinner.setRange(1);
		spinner.setSpeed(4);
		spinner.setColor("#333333");
		// As its hidden and not rendering by default we have to call its show() method
		spinner.show();
		// We use the jQuery fadeIn method to slowly fade in the preloader
		$("#spinner").fadeIn("slow");
	};
	
	/**
	* Creates a new <li> and loads the next image in the sequence inside it.
	* With jQuery we add the "load" event handler to the image, so when it's successfully loaded, we call the "imageLoaded" function.
	*/
	function loadImage() {
		// Creates a new <li>
		var li = document.createElement("li");
		// Generates the image file name using the incremented "loadedImages" variable
		var imageName = "img/threesixty_" + (loadedImages + 1) + ".jpg";
		/*
			Creates a new <img> and sets its src attribute to point to the file name we generated.
			It also hides the image by applying the "previous-image" CSS class to it.
			The image then is added to the <li>.
		*/
		var image = $('<img>').attr('src', imageName).addClass("previous-image").appendTo(li);
		// We add the newly added image object (returned by jQuery) to the "frames" array.
		frames.push(image);
		// We add the <li> to the <ol>
		$images.append(li);
		/*
			Adds the "load" event handler to the new image.
			When the event triggers it calls the "imageLoaded" function.
		*/
		$(image).load(function() {
			imageLoaded();
		});
	};
	
	/**
	* It handles the image "load" events.
	* Each time this function is called it checks if all the images have been loaded or it has to load the next one.
	* Every time a new image is succesfully loaded, we set the percentage value of the preloader to notify the user about the loading progress.
	* If all the images are loaded, it hides the preloader using the jQuery "fadeOut" method, which on complete stops the preloader rendering
	* and calls the "showThreesixty" method, that displays the image slider.
	*/
	function imageLoaded() {
		// Increments the value of the "loadedImages" variable
		loadedImages++;
		// Updates the preloader percentage text
		$("#spinner span").text(Math.floor(loadedImages / totalFrames * 100) + "%");
		// Checks if the currently loaded image is the last one in the sequence...
		if (loadedImages == totalFrames) {
			// ...if so, it makes the first image in the sequence to be visible by removing the "previous-image" class and applying the "current-image" on it
			frames[0].removeClass("previous-image").addClass("current-image");
			/*
				Displays the image slider by using the jQuery "fadeOut" animation and its complete event handler.
				When the preloader is completely faded, it stops the preloader rendering and calls the "showThreesixty" function to display the images.
			*/
			$("#spinner").fadeOut("slow", function(){
				spinner.hide();
				showThreesixty();
			});
		} else {
			// ...if not, Loads the next image in the sequence
			loadImage();
		}
	};
	
	/**
	* Displays the images with the "swooshy" spinning effect.
	* As the endFrame is set to -720, the slider will take 4 complete spin before it stops.
	* At this point it also sets the application to be ready for the user interaction.
	*/
	function showThreesixty () {
		// Fades in the image slider by using the jQuery "fadeIn" method
		$images.fadeIn("slow");
		// Sets the "ready" variable to true, so the app now reacts to user interaction 
		ready = true;
		// Sets the endFrame to an initial value...
		endFrame = -720;
		// ...so when the animation renders, it will initially take 4 complete spins.
		if(!demoMode) {
			refresh();
		} else {
			fakePointerTimer = window.setInterval(moveFakePointer, 100);
		}
	};

	/*
	* Moves the fake pointer, so that we can have some demo spinning until the user interferes with their pointer
	*/
	function moveFakePointer () {
		fakePointer.x += fakePointer.speed;
		trackPointer();
	};

	/*
	* Stops the fake pointer moving and lets the user control the spinning
	*/
	function quitDemoMode() {
		window.clearInterval(fakePointerTimer);
		demoMode = false;
	};
	
	/*
		We launch the application by...
		Adding the preloader, and...
	*/
	addSpinner();
	// loading the firt image in the sequence.
	loadImage();
	
	/**
	* Renders the image slider frame animations.
	*/
	function render () {
		// The rendering function only runs if the "currentFrame" value hasn't reached the "endFrame" one
		if(currentFrame !== endFrame)
		{	
			/*
				Calculates the 10% of the distance between the "currentFrame" and the "endFrame".
				By adding only 10% we get a nice smooth and eased animation.
				If the distance is a positive number, we have to ceil the value, if its a negative number, we have to floor it to make sure
				that the "currentFrame" value surely reaches the "endFrame" value and the rendering doesn't end up in an infinite loop.
			*/
			var frameEasing = endFrame < currentFrame ? Math.floor((endFrame - currentFrame) * 0.1) : Math.ceil((endFrame - currentFrame) * 0.1);
			// Sets the current image to be hidden
			hidePreviousFrame();
			// Increments / decrements the "currentFrame" value by the 10% of the frame distance
			currentFrame += frameEasing;
			// Sets the current image to be visible
			showCurrentFrame();
		} else {
			// If the rendering can stop, we stop and clear the ticker
			window.clearInterval(ticker);
			ticker = 0;
		}
	};
	
	/**
	* Creates a new setInterval and stores it in the "ticker"
	* By default I set the FPS value to 60 which gives a nice and smooth rendering in newer browsers
	* and relatively fast machines, but obviously it could be too high for an older architecture.
	*/
	function refresh () {
		// If the ticker is not running already...
		if (ticker === 0) {
			// Let's create a new one!
			ticker = self.setInterval(render, Math.round(1000 / 60));
		}
	};
	
	/**
	* Hides the previous frame
	*/
	function hidePreviousFrame() {
		/*
			Replaces the "current-image" class with the "previous-image" one on the image.
			It calls the "getNormalizedCurrentFrame" method to translate the "currentFrame" value to the "totalFrames" range (1-180 by default).
		*/
		frames[getNormalizedCurrentFrame()].removeClass("current-image").addClass("previous-image");
	};
	
	/**
	* Displays the current frame
	*/
	function showCurrentFrame() {
		/*
			Replaces the "current-image" class with the "previous-image" one on the image.
			It calls the "getNormalizedCurrentFrame" method to translate the "currentFrame" value to the "totalFrames" range (1-180 by default).
		*/
		frames[getNormalizedCurrentFrame()].removeClass("previous-image").addClass("current-image");
	};
	
	/**
	* Returns the "currentFrame" value translated to a value inside the range of 0 and "totalFrames"
	*/
	function getNormalizedCurrentFrame() {
		var c = -Math.ceil(currentFrame % totalFrames);
		if (c < 0) c += (totalFrames - 1);
		return c;
	};
	
	/**
	* Returns a simple event regarding the original event is a mouse event or a touch event.
	*/
	function getPointerEvent(event) {
		return event.originalEvent.targetTouches ? event.originalEvent.targetTouches[0] : event;
	};
	
	/**
	* Adds the jQuery "mousedown" event to the image slider wrapper.
	*/
	$container.on("mousedown", function (event) {
		quitDemoMode();

		// Prevents the original event handler behaciour
		event.preventDefault();
		// Stores the pointer x position as the starting position
		pointerStartPosX = getPointerEvent(event).pageX;
		// Tells the pointer tracking function that the user is actually dragging the pointer and it needs to track the pointer changes
		dragging = true;
	});
	
	/**
	* Adds the jQuery "mouseup" event to the document. We use the document because we want to let the user to be able to drag
	* the mouse outside the image slider as well, providing a much bigger "playground".
	*/
	$document.on("mouseup", function (event){
		// Prevents the original event handler behaciour
		event.preventDefault();
		// Tells the pointer tracking function that the user finished dragging the pointer and it doesn't need to track the pointer changes anymore
		dragging = false;
	});
	
	/**
	* Adds the jQuery "mousemove" event handler to the document. By using the document again we give the user a better user experience
	* by providing more playing area for the mouse interaction.
	*/
	$document.on("mousemove", function (event){
		if(demoMode) {
			return;
		}

		// Prevents the original event handler behaciour
		event.preventDefault();
		// Starts tracking the pointer X position changes
		trackPointer(event);
	});
	
	/**
	*
	*/
	$container.on("touchstart", function (event) {
		quitDemoMode();

		// Prevents the original event handler behaciour
		event.preventDefault();
		// Stores the pointer x position as the starting position
		pointerStartPosX = getPointerEvent(event).pageX;
		// Tells the pointer tracking function that the user is actually dragging the pointer and it needs to track the pointer changes
		dragging = true;
	});
	
	/**
	*
	*/
	$container.on("touchmove", function (event) {
		// Prevents the original event handler behaciour
		event.preventDefault();
		// Starts tracking the pointer X position changes
		trackPointer(event);
	});
	
	/**
	*
	*/
	$container.on("touchend", function (event) {
		// Prevents the original event handler behaciour
		event.preventDefault();
		// Tells the pointer tracking function that the user finished dragging the pointer and it doesn't need to track the pointer changes anymore
		dragging = false;
	});
	
	/**
	* Tracks the pointer X position changes and calculates the "endFrame" for the image slider frame animation.
	* This function only runs if the application is ready and the user really is dragging the pointer; this way we can avoid unnecessary calculations and CPU usage.
	*/
	function trackPointer(event) {
		var userDragging = ready && dragging ? true : false;
		var demoDragging = demoMode;

		if(userDragging || demoDragging) {
			
			// Stores the last x position of the pointer
			pointerEndPosX = userDragging ? getPointerEvent(event).pageX : fakePointer.x;

			// Checks if there is enough time past between this and the last time period of tracking
			if(monitorStartTime < new Date().getTime() - monitorInt) {
				// Calculates the distance between the pointer starting and ending position during the last tracking time period
				pointerDistance = pointerEndPosX - pointerStartPosX;
				// Calculates the endFrame using the distance between the pointer X starting and ending positions and the "speedMultiplier" values
				endFrame = currentFrame + Math.ceil((totalFrames - 1) * speedMultiplier * (pointerDistance / $container.width()));
				// Updates the image slider frame animation
				refresh();
				// restarts counting the pointer tracking period
				monitorStartTime = new Date().getTime();
				// Stores the the pointer X position as the starting position (because we started a new tracking period)

				pointerStartPosX = userDragging ? getPointerEvent(event).pageX : fakePointer.x;
			}
		} else {
			return;
		}
	};
});