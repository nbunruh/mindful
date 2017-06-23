
			var overlay = null;
			if (!Detector.webgl) {
				Detector.addGetWebGLMessage();
			}
			var container;
			var camera, scene, renderer, effect;
			var mesh, lightMesh;
			var ambientLight, pointLight;
			var objects = [], animations = {}, prefabs = {};
			var skipIntro = false;
			var gameModes = {
				WAIT: 0,
				INTRO: 1,
				INSTRUCTIONS1: 2,
				INSTRUCTIONS2: 3,
				PLAYING: 4,
				FINISHED: 5
			}
			var gameMode = skipIntro ? gameModes.PLAYING : gameModes.WAIT;
			var symbols = ["diamond", "cylinder", "cone", "icosahedron", "sphere", "ring", "loop", "pretzel"];
			var symbolPlurals = {
				diamond: "diamonds",
				cylinder: "cylinders",
				cone: "cones",
				icosahedron: "icosahedra",
				sphere: "spheres",
				ring:"rings",
				loop:"loops",
				pretzel: "pretzels"
			};
			var uncoveredSymbols = {};
			var winningSymbolsDisplay = null;
			sceneLoader.load("scene.json", function (data) {
				animations = data.animations;
				prefabs = data.prefabs;
				// Inject different symbols into chests
				var built = sceneLoader.build(data.objects, prefabs);
				var winningIndex = Math.floor(Math.random()*symbols.length);
				var winningSymbol = symbols.splice(winningIndex, 1)[0];
				var losingSymbols = symbols.concat(symbols);	// At most two of each losing symbol
				var randomIndex;
				var selectedSymbols = [];
				while(selectedSymbols.length < 6) {
					randomIndex = Math.floor(Math.random()*losingSymbols.length);
					var losingSymbol = losingSymbols.splice(randomIndex, 1)[0];
					selectedSymbols.push(losingSymbol);
				}
				for(var i=0; i<3; i++) {
					randomIndex = Math.floor(Math.random()*losingSymbols.length);
					selectedSymbols.splice(randomIndex, 0, winningSymbol);
				}
				var chests = [];
				function findChests(objects) {
					objects.forEach(function(obj) {
						if(obj.prefab === "chest") {
							chests.push(obj);
						}
						else if(obj.children) {
							findChests(obj.children);
						}
					});
				}
				findChests(built);
				chests.forEach(function(chest, index) {
					var symbol = selectedSymbols[index];
					chest.children[2].children[0] = sceneLoader.merge({}, data.prefabs[symbol]);
				});
		    	
		    	objects = sceneLoader.inflate(built, prefabs);
		        init();
			});
			function init() {
				container = document.createElement( 'div' );
				container.id = "container";
				document.body.appendChild( container );
				scene = new THREE.Scene();
				// Set up camera, scene, renderer, etc
				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
				camera.position.set(0, 10, 0);
				scene.add(camera);	// winningSymbols object is added to camera, so camera must be added to scene
				renderer = new THREE.WebGLRenderer({ alpha: true, antialias : true });
				renderer.setPixelRatio( window.devicePixelRatio );
				/*renderer.shadowMap.enabled = true;
				renderer.shadowMapSoft = true;
				renderer.shadowMap.type = THREE.PCFSoftShadowMap;*/
				container.appendChild( renderer.domElement );
				controls = new DeviceOrientationController( camera, renderer.domElement );
				controls.connect();
				effect = new THREE.StereoEffect( renderer );
				effect.eyeSeparation = 10;
				effect.setSize( window.innerWidth, window.innerHeight );
				// Add objects
				objects.forEach(function(mesh) {
		    		scene.add(mesh);
		    	});
		    	// Lights
				ambientLight = new THREE.AmbientLight( 0x404040 );
				scene.add( ambientLight );
				pointLight = new THREE.PointLight( 0xFFFFFF );
				pointLight.position.set(-10, 18, -18);
				pointLight.lookAt(scene.position);
				/*pointLight.castShadow = true;
				pointLight.shadow.camera.near = 0.01;
				scene.add(new THREE.CameraHelper( pointLight.shadow.camera ));*/
				scene.add( pointLight );
				// User interface
				setUpUI();
				renderer.setClearColor( 0xffffff, 0);
				render();
				animate();
				window.addEventListener( 'resize', onWindowResize, false );
			}
			function deg2rad(deg) {
				return deg * (Math.PI / 180);
			}
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				effect.setSize( window.innerWidth, window.innerHeight );
			}
			function animate() {
				requestAnimationFrame( animate );
				controls.update();
				render();
			}
			function render() {
				effect.render( scene, camera );
				//renderer.render(scene, camera);	// Disable stereoscopic effect
			}
			function setUpUI() {
				// Interaction button
				var interactionButton = document.createElement('div');
				interactionButton.className = "ui";
				interactionButton.id = "interactionButton";
				document.body.appendChild(interactionButton);
				interactionButton.addEventListener('click', interact);
				// Reticle/pointer
				var reticle = document.createElement("div");
				reticle.className = "reticle";
				ui.add("reticle", reticle);
				// Overlay
				if(!skipIntro) {
					overlay = document.createElement("div");
					overlay.className = "overlay ui";
					document.body.appendChild(overlay);
				}
				// Success message
				var messagePrototype = document.createElement("div");
				messagePrototype.className = "message";
				messagePrototype.style.opacity = 0;
				var messageUiElements = ui.add("message", messagePrototype);
				if(gameMode === gameModes.WAIT) {
					setTimeout(function() {
						ui.setHTML("message", "<br /><strong>Welcome to the VR IWG prototype demo</strong><br /><br /><span style='font-weight: small;'>Press button to continue...</span>");
						ui.fadeIn("message", "1s");
						gameMode = gameModes.INTRO;
					}, 1000);
				}
			}
			function interact() {
				if(gameMode === gameModes.WAIT) {
					return;	// Animation/transition/setTimeout is in-flight, so disable interactions until it finishes and re-enables a game-mode
				}
				if(gameMode === gameModes.INTRO) {
					gameMode = gameModes.WAIT;
					ui.fadeOut("message", "1s");
					setTimeout(function() {
						ui.setHTML("message", "<br />Open all the chests to reveal your symbols.<br /><br />Don't forget to look behind you...");
						ui.fadeIn("message", "1s");
						gameMode = gameModes.INSTRUCTIONS1;
					}, 1500);
					
				}
				else if(gameMode === gameModes.INSTRUCTIONS1) {
					gameMode = gameModes.WAIT;
					ui.fadeOut("message", "1s");
					setTimeout(function() {
						ui.setHTML("message", "<br />The red dot is your pointer<br />&dArr;<br /><br />Press the button to interact with objects...");
						ui.fadeIn("message", "1s");
						gameMode = gameModes.INSTRUCTIONS2;
					}, 1500);
					
				}
				else if(gameMode === gameModes.INSTRUCTIONS2) {
					gameMode = gameModes.PLAYING;
					ui.fadeOut("message", "1s", function(overlay, event) {
						ui.hide("message");
					});
					ui.fadeOut(overlay, "1s", function(overlay, event) {
						overlay.style.display = "none";
					});
				}
				else if(gameMode === gameModes.PLAYING || gameMode === gameModes.FINISHED) {
					// Project ray from camera into scene and find closest object (if any) it intersects with
					var raycaster = new THREE.Raycaster();
					raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
					var intersects = raycaster.intersectObjects(objects, true);
					if(intersects.length > 0) {
						var intersect = intersects[0];
						var object = intersect.object;
						while(object.parent && object.parent.selectable) {	// If child element selected, activate the highest selectable ancestor container
							object = object.parent;
						}
						activate(object);	// Let players in a finished game activate left-over objects if they like, for novelty value
						if(gameMode === gameModes.PLAYING) {
							var symbolWrapper = object.getObjectByName("symbol");
							if(symbolWrapper) {
								var selectedSymbol = symbolWrapper.children[0].name;
								uncoveredSymbols[selectedSymbol] = uncoveredSymbols[selectedSymbol] ? uncoveredSymbols[selectedSymbol]+1 : 1;
								if(uncoveredSymbols[selectedSymbol] === 3) {
									gameMode = gameModes.FINISHED;
									setTimeout(function() {
										finishScreen(selectedSymbol);
									}, 500);
								}
							}
						}
					}
				}
			}
			function activate(obj) {
				if(obj.onActivate) {
					tween.animate(obj, obj.onActivate);
				}
				obj.children.forEach(function(child) {
					activate(child);
				});
				
				tween.start();
			}
			function finishScreen(winningSymbol) {
				if(speechSynthesis && speechSynthesis.speak) {
					//speechSynthesis.speak(new SpeechSynthesisUtterance("Congratulations!  You found three of the "+winningSymbol));
				}
				ui.setHTML("message", "<br />Congratulations!  You found three "+symbolPlurals[winningSymbol]+"!");
				ui.show("message");
				ui.fadeIn("message", "1s");
				var winningSymbolsDisplay = sceneLoader.inflate([prefabs[winningSymbol], prefabs[winningSymbol], prefabs[winningSymbol]], prefabs);
				winningSymbolsDisplay[0].position.set( -1, -1.5, -5);
				winningSymbolsDisplay[1].position.set( 0, -1.5, -5);
				winningSymbolsDisplay[2].position.set( 1, -1.5, -5);
				winningSymbolsDisplay.forEach(function(item) {
					item.scale.set(0.25, 0.25, 0.25);
					camera.add(item);
				});
				setTimeout(function() {
					ui.fadeOut("message", "1s");
					setTimeout(function() {
						ui.setHTML("message", "<br /><br />You've finished the game!<br /><br />Reload the page to play again");
						ui.fadeIn("message", "1s");
					}, 1000);
				}, 3000);
			}