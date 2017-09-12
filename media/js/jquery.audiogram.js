/**
 * --------------------------------------------------------------------
 * jQuery-Plugin "audiogram"
 * by Matt Hollis - contact via my name at gmail.com
 *
 * Copyright (c) 2010 Matt Hollis
 * Version: 0.1.1-2010.06.10
 *
 * --------------------------------------------------------------------
 **/
(function($) {
	$.fn.audiogram = function(settings) {

		// Default settings
		var defaults = {
			cvHeight : 600,
			cvWidth : 600,
			xOffset : 40,
			yOffset : 40,
			newGraph : false,
			backgroundColor : '#ffffff',
			editable : false,
			imgPath : 'media/img/audiogram/',
		};

		var selection = {
			ear : 'right',
			transducer : 'air',
			masking : false,
			addPoint : true,
			response : true,
		};

		// Replace defautls with any user passed settings
		var option = $.extend(defaults, settings);

		// Audiogram grid size (offset + 5 to ensure we don't overlap our borders)
		option.audiogramHeight = option.cvHeight - (option.yOffset + 5);

		// Aspect ratio based on UTMG audiogram
		option.audiogramWidth = option.audiogramHeight * 0.92857;

		// Canvas variables
		var
			xLabels = ['0,125', '', '0,25', '', '0,5', '0,75', '1', '1,5', '2', '3', '4', '6', '8', '(Khz)', ''],
    	yLabels = ['-10', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120', '130']
	 	;

		// Audiometric variables
		var
			frequencies = ['t125', 't180', 't250', 't375', 't500', 't750', 't1k', 't1500', 't2k', 't3k', 't4k', 't6k', 't8k', 't12k'],
	  	thresholds  = ['-10', '-5', '0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100', '105', '110', '115', '120']
		;

		// Audiometric data object w/ empty values
		var audiometricData = {
			left : {
				air : {
					t125  : false,
					t180  : false,
					t250  : false,
					t375  : false,
					t500  : false,
					t750  : false,
					t1k   : false,
					t1500 : false,
					t2k   : false,
					t3k   : false,
					t4k   : false,
					t6k   : false,
					t8k   : false,
					t12k  : false,

				},
				bone : {
					t125  : false,
					t180  : false,
					t250  : false,
					t375  : false,
					t500  : false,
					t750  : false,
					t1k   : false,
					t1500 : false,
					t2k   : false,
					t3k   : false,
					t4k   : false,
					t6k   : false,
					t8k   : false,
					t12k  : false,
				},
			},
			right : {
				air : {
					t125  : false,
					t180  : false,
					t250  : false,
					t375  : false,
					t500  : false,
					t750  : false,
					t1k   : false,
					t1500 : false,
					t2k   : false,
					t3k   : false,
					t4k   : false,
					t6k   : false,
					t8k   : false,
					t12k  : false,

				},
				bone : {
					t125  : false,
					t180  : false,
					t250  : false,
					t375  : false,
					t500  : false,
					t750  : false,
					t1k   : false,
					t1500 : false,
					t2k   : false,
					t3k   : false,
					t4k   : false,
					t6k   : false,
					t8k   : false,
					t12k  : false,
				},
			},
			soundfield : {
				unaided : {
					t125  : false,
					t180  : false,
					t250  : false,
					t375  : false,
					t500  : false,
					t750  : false,
					t1k   : false,
					t1500 : false,
					t2k   : false,
					t3k   : false,
					t4k   : false,
					t6k   : false,
					t8k   : false,
					t12k  : false,
				},
				aided : {
					t125  : false,
					t180  : false,
					t250  : false,
					t375  : false,
					t500  : false,
					t750  : false,
					t1k   : false,
					t1500 : false,
					t2k   : false,
					t3k   : false,
					t4k   : false,
					t6k   : false,
					t8k   : false,
					t12k  : false,
				},
				ci : {
					t125  : false,
					t180  : false,
					t250  : false,
					t375  : false,
					t500  : false,
					t750  : false,
					t1k   : false,
					t1500 : false,
					t2k   : false,
					t3k   : false,
					t4k   : false,
					t6k   : false,
					t8k   : false,
					t12k  : false,
				}
			}
		};

		// Patient information
		var
			patient     = $(this).attr('id'),
    	appointment = $(this).attr('data-appointment'),
			audiogram   = $(this).attr('data-audiogram')
		;

		// Images to be used for audiometric data points
		var icon = {
			left : {
				air : {
					unmasked : {
						response   : new Image(),
						noResponse : new Image()
					},
					masked : {
						response   : new Image(),
						noResponse : new Image()
					}
				},
				bone : {
					unmasked : {
						response   : new Image(),
						noResponse : new Image()
					},
					masked : {
						response   : new Image(),
						noResponse : new Image()
					}
				}
			},
			right : {
				air : {
					unmasked : {
						response   : new Image(),
						noResponse : new Image()
					},
					masked : {
						response   : new Image(),
						noResponse : new Image()
					}
				},
				bone : {
					unmasked : {
						response   : new Image(),
						noResponse : new Image()
					},
					masked : {
						response   : new Image(),
						noResponse : new Image()
					}
				}
			},
			soundfield : {
				unaided : {
					response   : new Image(),
					noResponse : new Image()
				},
				aided : {
					response   : new Image(),
					noResponse : new Image()
				},
				ci : {
					response   : new Image(),
					noResponse : new Image()
				}
			}
		};

		/**
		 * Canvas object handles drawing everything except data points
		 **/
		Canvas = function() {
			/** Private properties and methods **/
			var
				firstRun = true,
				ctx,
				previous = {
					x : false,
					y : false,
				},
				current = {
					x : false,
					y : false,
				}
			;

			/**
			 * Creates the canvas and injects it into the DOM after the data source table
			 * Also sets the 2d rendering context
			 **/
			var init = function() {
				// Inject our canvas into the DOM and hide our data table. Note that the table is not
				// being removed from the DOM, merely hidden so that we can still parse its data.
				$('#'+patient).after('<canvas id="audiogram-'+patient+'" class="audiogram"></canvas>').hide();

				// Obtain a reference to the canvas and set some of its properties
				canvas = $('#audiogram-'+patient).get(0);
				canvas.width  = option.cvWidth;
				canvas.height = option.cvHeight;
				// Set 2d rendering context
				ctx = canvas.getContext('2d');

				// Test that initialization went as expected
				if (!ctx) {
					debug.error('Error initializing canvas.');
					return false;
				}
				firstRun = false;
			};

			/**
			 * Sets a border around the entire canvas and puts the gradient in place
			 * (this is the extent of my graphic design skills)
			 **/
			var shadeBackground = function() {
				// Fill the full canvas with a solid background
				ctx.fillStyle = '#ffffff';
				ctx.strokeStyle = '#ffffff';

				ctx.fillRect(0, 0, option.cvWidth, option.cvHeight);
				ctx.strokeRect(0, 0, option.cvWidth, option.cvHeight);

				// Create our gradient for the actual audiogram grid
				var gradient = ctx.createLinearGradient(0, 0, 0, option.audiogramHeight);
				gradient.addColorStop(0.0, '#ffffff');
				gradient.addColorStop(0.2, '#ffffff');
				gradient.addColorStop(1.0, option.backgroundColor);

				// Render a rectangle filled by our gradient
				ctx.fillStyle = gradient;
				ctx.fillRect(option.xOffset, option.yOffset, option.audiogramWidth, option.audiogramHeight - option.yOffset * 2);
			};

			/**
			 * Sets up the audiogram grid lines
			 **/
			var drawGrid = function() {
				var
					verticalLines = 14,
					horizontalLines = 14
				;

				// Line styling
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#000000';

				// Horizontal lines
				var
					xStart = option.xOffset,
					xEnd = option.xOffset + option.audiogramWidth
				;

				for (i = 0; i <= horizontalLines; i++) {
					// Begin line
					ctx.beginPath();

					// Calculate our y-coordinate (parentheses simply to make it easy to read, not necessary per order of operations)
					// Adding 0.5px is necessary to avoid anti-aliasing artifact from the canvas rendering engine
					// See http://developer.mozilla.org/en/Canvas_tutorial/Applying_styles_and_colors
					var y = (i * (option.audiogramHeight / horizontalLines)) + 0.5 + option.yOffset;

					// Line start
					ctx.moveTo(xStart, y);

					// Line end
					ctx.lineTo(xEnd, y);

					// Draw the line
					ctx.stroke();
				}

				// Vertical lines
				var
					yStart = option.yOffset,
					yEnd = option.audiogramHeight + option.yOffset
				;

				for (j = 0; j <= verticalLines; j++) {
					// See comments for horizontal lines if this is unclear; it's exactly the same process.
					ctx.beginPath();

					var x = (j * (option.audiogramWidth / verticalLines)) + 0.5 + option.xOffset;

					ctx.moveTo(x, yStart);
					ctx.lineTo(x, yEnd);
					ctx.stroke();
				}
			};

			/**
			 * Puts labels on the x- and y-axes
			 **/
		 	var drawLabels = function() {
				ctx.font = "bold 12px 'arial'";
				ctx.fillStyle = '#000000';
				var discount = 3;

				// x-axis labels
				for (i = 0; i < xLabels.length; i++) {
					var xStart = (i * (option.audiogramWidth / (xLabels.length - 1))) + option.xOffset - discount;
					ctx.fillText(xLabels[i], xStart, option.yOffset / 1.5);
				}

				// y-axis labels
				for (j = 0; j < yLabels.length; j++) {
					var yStart = (j * (option.audiogramHeight / (yLabels.length - 1))) + option.yOffset + discount;
					ctx.fillText(yLabels[j], option.xOffset / 3, yStart);
				}
			};

			/**
			 * Draws lines connecting data points
			 **/
			var dataLine = function(x, y, ear, transducer) {
				ctx.lineWidth = 1;

				// If first point entered, we don't need a line yet
				if (current.x === false) {
					current.x = x;
					current.y = y
					current.transducer = transducer;
				}
				else {
					// Using $.extend because javascript passes objects by reference making cloning and then modifying difficult
					previous = $.extend({}, current);
					current.x = x;
					current.y = y
					current.transducer = transducer;

					// If this condition is false, we're starting a new data set (e.g. changing ears) and don't want a connecting line
					if (current.x > previous.x && current.transducer == previous.transducer) {
						switch(ear) {
							case 'left' :
								ctx.strokeStyle = '#0000d0';
								break;
							case 'right' :
								ctx.strokeStyle = '#d00000';
								break;
							default :
								ctx.strokeStyle = '#000000';
						}

						// Y-coordinate adjustment for extreme slope (aesthetic change)
						var yDelta = (current.y - previous.y) * 0.1;

						// Line drawing
						ctx.beginPath();
						ctx.moveTo(previous.x + 5, previous.y + yDelta);
						ctx.lineTo(current.x - 10, current.y - yDelta);
						ctx.stroke();
					}
				}
			};

			/** Public properties and methods **/
			return {
				/**
					* Draws the canvas.  Will insert it into the DOM if not there already
					**/
				draw : function() {
					// If called by audiogram.main() set up the canvas first
					if (firstRun) {init();}

					shadeBackground();
					drawGrid();
					drawLabels();
				},
				/**
					* Handels calculating the intended plot point based on actual user-click location
					*
					* @param  float    click event's x-coordinate
					* @param  float    click event's y-coordinate
					* @param  object   image to be drawn
					* @return void
					**/
				plot : function(x, y, ear, transducer, masking, response) {
					if (ear != 'soundfield') {
						var img = icon[ear][transducer][(masking) ? 'masked' : 'unmasked'][(response) ? 'response' : 'noResponse'];
					}
					else {
						var img = icon[ear][transducer][(response) ? 'response' : 'noResponse'];
					}

					// Don't draw anything that would be off the grid
					if (y < (option.audiogramHeight - option.yOffset) && x > option.xOffset - 5) {
						// extra x - 5 because I suck at making images centered in photoshop
						ctx.drawImage(img, x - (img.width / 2) - 3, y - (img.height / 2));
					}

					// We don't want lines connecting bone conduction thresholds (standard professional practice)
					if (transducer != 'bone') {
						dataLine(x, y, ear, transducer);
					}
				},
			};
		}(); // End Canvas

		/**
		 * Data object handles all things related to the graph's data points
		 **/
		Data = function() {
			/** Private properties and methods **/
			var firstRun = true;

			/**
				* Parses through the html table with the audiometric data for our audiogram object
				**/
			var parseTable = function() {
				// Iterate through each table row
				$('#'+patient+' > tbody > tr').each(function() {

					// Store a reference to the row to save on DOM traversal
					var cells = $(this).children();

					// The first cell is the frequency, the rest are our data
					var
						frequency = $(cells.get(0)).text(),
				    rightAir  = $(cells.get(1)).text(),
				    rightBone = $(cells.get(2)).text(),
				    leftAir   = $(cells.get(3)).text(),
				    leftBone  = $(cells.get(4)).text(),
				    sfua      = $(cells.get(5)).text(),
				    sfa       = $(cells.get(6)).text(),
				    sfci      = $(cells.get(7)).text()
				  ;

					// If no data, the cell text will be empty - otherwise, put the number in our data object
					audiometricData.right.air[frequency]          = (rightAir)  ? rightAir  : false;
					audiometricData.right.bone[frequency]         = (rightBone) ? rightBone : false;
					audiometricData.left.air[frequency]           = (leftAir)   ? leftAir   : false;
					audiometricData.left.bone[frequency]          = (leftBone)  ? leftBone  : false;
					audiometricData.soundfield.unaided[frequency] = (sfua)      ? sfua      : false;
					audiometricData.soundfield.aided[frequency]   = (sfa )      ? sfa       : false;
					audiometricData.soundfield.ci[frequency]      = (sfci)      ? sfci      : false;
				});
			};

			/**
				* Gets the intersection nearest to the provided coordinates
				*
				* @param  int    click event's x-coordinate
				* @param  int    click event's y-coordinate
				* @return object
				**/
			var getNearestIntersection = function(x, y) {
				var
					verticalLines = 14,
			    horizontalLines = 28,
			    sizey = option.audiogramHeight / horizontalLines,
			    sizex = option.audiogramWidth / verticalLines,

			    // First we need to find the rectangle where the click happened
			    iX = parseInt(x / sizex),
			    iY = parseInt(y / sizey),

			    // Then we need to find the closest corner
			    quadrantX = parseInt((x % sizex) / (sizex / 2)),
			    quadrantY = parseInt((y % sizey) / (sizey / 2)),

			    x1 = (iX + quadrantX) * sizex,
			    y1 = (iY + quadrantY) * sizey
			  ;

				return {x : ( x1 + 6 ), y : y1};
			};

			/**
			 * Adds threshold data to the audiometricData object based upon grid x,y coordinates
			 *
			 * @param  float    click event's x-coordinate
			 * @param  float    click event's y-coordinate
			 * @return void
			 **/
			var xyToThreshold = function(x, y) {
				var
					verticalLines = 14,
					horizontalLines = 28,
					sizey = option.audiogramHeight / horizontalLines,
					sizex = option.audiogramWidth / verticalLines
				;

				var
					maskTag = (selection.masking)  ? '-m' : '',
			    respTag = (selection.response) ? '' : '-nr'
			  ;

				audiometricData[selection.ear][selection.transducer][frequencies[Math.round((x / sizex) - 1)]] =
			    (selection.addPoint) ?  thresholds[Math.round((y / sizey) - 1)] + respTag + maskTag : false;
			};

			/**
			 * Takes an audiometric data point (frequency x threshold) and returns where on the graph
			 * it should be plotted.
			 *
			 * @param  string   audimetric frequency (x-value)
			 * @param  string   threshold (y-value)
			 * @return object   coordinate object (obj.x, obj.y)
			 **/
			var thresholdToXY = function(frequency, threshold) {
				var
					verticalLines = 14,
					horizontalLines = 28,
					sizey = option.audiogramHeight / horizontalLines,
					sizex = option.audiogramWidth / verticalLines,
					x = (frequencies.indexOf(frequency) + 1)  * sizex,
					y = (thresholds.indexOf(threshold) + 1) * sizey
				;

				return getNearestIntersection(Math.round(x), Math.round(y));
			};

			/**
			 * Plots from our data object (audiometricData) onto the grid
			 **/
			var plotAudiogram = function() {
				// Iterating through each level of our audiometricData object
				try {
					$.each(audiometricData, function(ear) {
						$.each(audiometricData[ear], function(transducer) {
							$.each(audiometricData[ear][transducer], function(frequency, threshold) {

								// Don't plot any non-existant data points
								if (threshold !== false) {

									// Test for no response
									var response = (!threshold.match(/-nr/)) ? true : false;

									// If not sound field, test for masked thresholds
									if (ear != 'soundfield') {

										// Is this a masked threshold?
										var masking = (threshold.match(/\-m/)) ? true : false;

										// Store the int value (removes no response and masking flags)
										threshold = parseInt(threshold.split('-')[0]);
										threshold += 5;
										threshold = threshold.toString();
									}
									else {
										var masking = false;
									}

									// If the threshold is not valid (i.e. not an int) throw an error
									if (parseInt(threshold) == NaN) {
										debug.warn (threshold);
											throw('threshold.invald');
									}
									// Or if the threshold is not a multiple of 5
									else if (!threshold % 5)  {
										debug.warn(ear + ' : ' + transducer + ' : ' + frequency + ' : ' + threshold);
										throw('threshold.notMultiple');
									}
									else {
										var coords = thresholdToXY(frequency, threshold);
										Canvas.plot(coords.x, coords.y, ear, transducer, masking, response);
									}
								}
							});
						});
					});
				}
				catch(err) {
					if (err == 'threshold.invalid') {
						audiometricData[ear][transducer][frequency] = false;
						alert('caught threshold.invald: set to false');
					}
					else if (err == 'threshold.notMultiple') {
						alert('Threshold not a proper multiple of 5');
					}
					else {
						alert('Royce should not be seeing this: ' + err);
					}
				}
			};

			/** Public properties and methods **/
			return {

				/**
				 * Plots data to the audiometricData object
				 *
				 * @param  int  click event's x-coordinate
				 * @param  int  click event's y-coordinate
				 * @return void
				 **/
				plot : function(x, y) {
					// Default value = false if no argument supplied (when called as part of main();)
					x = x || false;
					y = y || false;

					// If run through main(), grab data from the html data table
					if (firstRun && !option.newGraph) {
						firstRun = false;
						parseTable();
					}

					// If we have points, record them
					if (x && y) {
						xyToThreshold(x, y);
					}

					// Draw all the data points
					plotAudiogram();
				},
				/**
				 * Saves data to the database via AJAX call
				 **/
			 	// save : function() {
				// 	// jQuery ajax handler
				// 	$.ajax({
				// 		// set request parameters
				// 		type : "POST",
				// 		data : {
				// 			'patient_id'      : patient,
				// 			'appointment_id'  : appointment,
				// 			'audiogram_id'    : audiogram,
				// 			'audiometricData' : audiometricData
				// 		},
				// 		url : '/matt/test.php',

				// 		// if successful, show message indicating such
				// 		success : function(msg) {
				// 			debug.info(msg);

				// 			$('#container').before('<div id="message"></div>');
				// 			$('#message').addClass('success').html('<p>Data saved.</p>').fadeIn(1500).delay(3500).fadeOut(1000, function() {
				// 				$(this).remove();
				// 			});
				// 		},

				// 		// if error, show what went wrong
				// 		error : function(xhr, textStatus, errorThrown) {
				// 			debug.info(xhr);
				// 			debug.warn(textStatus);
				// 			debug.error(errorThrown);

				// 			$('#container').before('<div id="message"></div>');
				// 			$('#message').addClass('error').html('Error: '+xhr.responseText).fadeIn(1500).delay(3500).fadeOut(1000, function() {
				// 				$(this).remove();
				// 			});
				// 		},
				// 	});
				// },
			};
		}(); // End Data

		/**
		 * Handles event binding
		 **/
		var Events = function() {

			var controls = function() {
				$('#button_ear_specific').click(function() {
					$('section#buttons_soundfield').fadeOut(500, function() {
						$('section#buttons_ear_specific').fadeIn(500);
					});

					if (selection.ear != 'left' && selection.ear != 'right') {
						// Have to click the label and the radio button since jQueryUI seems to treat them seperately
						$('[for=button_left], #button_left').click();

					}

					if (selection.transducer != 'air' && selection.transducer != 'bone') {
						$('[for=button_air], #button_air').click();
					}
					$('[for=button_unmasked], #button_unmasked').click();
				});

				$('#button_soundfield').click(function() {
					$('section#buttons_ear_specific').fadeOut(500, function() {
						$('section#buttons_soundfield').fadeIn(500, function() {
							$('[for=button_unaided], #button_unaided').click()
						});
					});
					selection.ear = 'soundfield';
				});

				$('#button_add').click(function() {
					selection.addPoint = true;
				});

				$('#button_remove').click(function() {
					selection.addPoint = false;
				});

				// $('#button_save').click(function(e) {
				// 	Data.save();
				// });
			};

			var earSpecificButtons = function() {
				$('#button_left').click(function() {
					selection.ear = 'left';
				});

				$('#button_right').click(function() {
					selection.ear = 'right';
				});

				$('#button_air').click(function() {
					selection.transducer = 'air';
				});

				$('#button_bone').click(function() {
					selection.transducer = 'bone';
				});

				$('#button_unmasked').click(function() {
					selection.masking = false;
				});

				$('#button_masked').click(function() {
					selection.masking = true;
				});
			};

			var soundfieldButtons = function() {
				$('#button_unaided').click(function() {
					selection.ear = 'soundfield';
					selection.transducer = 'unaided';
				});

				$('#button_aided').click(function() {
					selection.ear = 'soundfield';
					selection.transducer = 'aided';
				});

				$('#button_ci').click(function() {
					selection.ear = 'soundfield';
					selection.transducer = 'ci';
				});
			};

			return {
				bind : function() {
					// Click event handler
					$(canvas).bind('click', function(e) {

						// (x, y) of mouse cursor at click; compensated to get coordinates relative to canvas's (0, 0)
						var
							x = e.clientX - canvas.offsetLeft - canvas.offsetParent.offsetLeft + window.pageXOffset,
							y = e.clientY - canvas.offsetTop  - canvas.offsetParent.offsetTop + window.pageYOffset
						;

						// If on the audiogram
						if (x <= option.audiogramWidth + option.xOffset
						 && y <= option.audiogramHeight - option.yOffset
						 && x >= option.xOffset
						 && y >= option.yOffset) {

							// Clear the board
							Canvas.draw();

							// Record and draw the data
							Data.plot(x, y);
						}
					});

					controls();
					earSpecificButtons();
					soundfieldButtons();

					$('#button_ear_specific, #button_left, #button_air, #button_add').click();
				}
			};
		}(); // End Events

		/**
		 * Starts the progam and adds event handlers
		 **/
		function main() {
			Canvas.draw();

			// Make sure our image icons are loaded before we try to plot
			function collected(count, fn) {
				var loaded = 0;
				return function() {
					// Trigger condition - once all images are loaded and trigger is reached, run the callback function
					if (++loaded === count) {
						fn();
					}
				}
			};

			// Function called each time one of the icon images is loaded; Data.plot() called once the count arguemnt is reached
			// TODO: change to 23 once no reponse icons are made
			var imgLoaded = collected(12, function() {
				Data.plot();
			});

			// Must bind .load event before declaring source for it to fire reliably
			// Using jQuery here to compensate for the vanilla load event not firing for cached images
			$(icon.left.air.unmasked.response).load(function() {imgLoaded();});
			$(icon.left.air.masked.response).load(function() {imgLoaded();});
			$(icon.right.air.unmasked.response).load(function() {imgLoaded();});
			$(icon.right.air.masked.response).load(function() {imgLoaded();});
			$(icon.left.bone.unmasked.response).load(function() {imgLoaded();});
			$(icon.left.bone.masked.response).load(function() {imgLoaded();});
			$(icon.right.bone.unmasked.response).load(function() {imgLoaded();});
			$(icon.right.bone.masked.response).load(function() {imgLoaded();});
			$(icon.soundfield.unaided.response).load(function() {imgLoaded();});
			$(icon.soundfield.aided.response).load(function() {imgLoaded();});
			$(icon.soundfield.ci.response).load(function() {imgLoaded();});
			/* commented out until icons are made
			$(icon.left.air.unmasked.noResponse).load(function() {imgLoaded();});
			$(icon.left.air.masked.noResponse).load(function() {imgLoaded();});
			$(icon.right.air.unmasked.noResponse).load(function() {imgLoaded();});
			$(icon.right.air.masked.noResponse).load(function() {imgLoaded();});
			$(icon.left.bone.unmasked.noResponse).load(function() {imgLoaded();});
			$(icon.left.bone.masked.noResponse).load(function() {imgLoaded();});
			$(icon.right.bone.unmasked.noResponse).load(function() {imgLoaded();});
			$(icon.right.bone.masked.noResponse).load(function() {imgLoaded();});
			$(icon.soundfield.unaided.noResponse).load(function() {imgLoaded();});
			$(icon.soundfield.aided.noResponse).load(function() {imgLoaded();});
			$(icon.soundfield.ci.noResponse).load(function() {imgLoaded();});
			*/

			// Now assign image sources
			icon.left.air.unmasked.response.src     = option.imgPath + 'left.air.unmasked.response.png';
			icon.left.air.masked.response.src       = option.imgPath + 'left.air.masked.response.png';
			icon.right.air.unmasked.response.src    = option.imgPath + 'right.air.unmasked.response.png';
			icon.right.air.masked.response.src      = option.imgPath + 'right.air.masked.response.png';
			icon.left.bone.unmasked.response.src    = option.imgPath + 'left.bone.unmasked.response.png';
			icon.left.bone.masked.response.src      = option.imgPath + 'left.bone.masked.response.png';
			icon.right.bone.unmasked.response.src   = option.imgPath + 'right.bone.unmasked.response.png';
			icon.right.bone.masked.response.src     = option.imgPath + 'right.bone.masked.response.png';
			icon.soundfield.unaided.response.src    = option.imgPath + 'soundfield.unaided.response.png';
			icon.soundfield.aided.response.src      = option.imgPath + 'soundfield.aided.response.png';
			icon.soundfield.ci.response.src         = option.imgPath + 'soundfield.ci.response.png';
			/* commented out until icons are made
			icon.left.air.unmasked.noResponse.src   = option.imgPath + 'left.air.unmasked.noResponse.png';
			icon.left.air.masked.noResponse.src     = option.imgPath + 'left.air.masked.noResponse.png';
			icon.right.air.unmasked.noResponse.src  = option.imgPath + 'right.air.unmasked.noResponse.png';
			icon.right.air.masked.noResponse.src    = option.imgPath + 'right.air.masked.noResponse.png';
			icon.left.bone.unmasked.noResponse.src  = option.imgPath + 'left.bone.unmasked.noResponse.png';
			icon.left.bone.masked.noResponse.src    = option.imgPath + 'left.bone.masked.noResponse.png';
			icon.right.bone.unmasked.noResponse.src = option.imgPath + 'right.bone.unmasked.noResponse.png';
			icon.right.bone.masked.noResponse.src   = option.imgPath + 'right.bone.masked.noResponse.png';
			icon.soundfield.unaided.noResponse.src  = option.imgPath + 'soundfield.unaided.noResponse.png';
			icon.soundfield.aided.noResponse.src    = option.imgPath + 'soundfield.aided.noResponse.png';
			icon.soundfield.ci.noResponse.src       = option.imgPath + 'soundfield.ci.noResponse.png';
			*/

			// Trigger condition - will run Data.plot() after all images have loaded
			imgLoaded();

			// Are we allowed to edit this audiogram?
			if (option.editable) {
				// Bind all events
				Events.bind();
			}
			else {
				$('section#buttons').hide();
			}
		}

		main();

		return this;
	}
})(jQuery);