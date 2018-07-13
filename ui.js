/*
 Whats All App
 Enumerate of phonenumbers, profile pics, about texts and online statuses
 19-06-2018
 (c) 2018 - Loran Kloeze - loran@ralon.nl 
 
 https://github.com/LoranKloeze/WhatsAllApp
 
*/



(function() {
    'use strict';
	function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}
	
	
	var saveToZip = function() {
		var zip = new JSZip();
		
		// Loop through the visible boxes
		var boxes = document.getElementsByClassName('indexerClientBox');
		var csv = '';
		var nr_of_numbers = boxes.length;
		var nrOfImgFetchFinished = 0;
		for (var i=0; i < nr_of_numbers; i++) {
			var box = boxes[i];
			var phone = box.getElementsByClassName('indexerPhone')[0].innerText;
			var statusText = box.getElementsByClassName('indexerStatus')[0].innerText;
			var imageUrl = box.getElementsByTagName('img')[0].dataset.fullurl;
			
			if (imageUrl === undefined) {
				continue;
			}
			
			zip.fileURL(phone + '.jpg', imageUrl, null, function(){
				nrOfImgFetchFinished++;
				console.log('Fetching ' + nrOfImgFetchFinished + ' of ' + nr_of_numbers);
				if (nrOfImgFetchFinished == nr_of_numbers) {					
					zip.file('db.csv', csv);
					zip.generateAsync({type:"blob"})
					.then(function(content) {
						saveAs(content, "whats_all_app.zip");
					});
				}
			}, {xhrtype:"blob"})
			csv += phone + ';' + statusText + ';' + imageUrl + '\n';
		
		}		
		
		
		
	}
	
	

	
	var whenStoreIsReady = function () {
		console.log('Starting WhatsAllApp UI')

		// Prevent huge traffic/mem usage
		var maxNrClients = 1500;
		
		// Standard phone numbers for the 2 text boxes in the UI
		var firstNumberStd = 31642101000;
		var lastNumberStd =  31642101100;



		function setupContainerEventListeners() {	
			var btnDownloadZip = document.getElementById('btnDownloadZip');
		
			var btnDeactivateWhatsApp = document.getElementById('btnCloseWhatsAllApp');
			btnDeactivateWhatsApp.addEventListener("click", function( e ) {
				var divContainer = document.getElementById('statusIndexer');
				//divContainer.outerHTML = '';
				divContainer.classList.add('hide');
				var startBtnDiv = document.getElementById('btnOpenWhatsAllApp');
				startBtnDiv.classList.remove('hide');
				
			});
			
			var btnStartIndexer = document.getElementById('btnStartIndexer');
			btnStartIndexer.addEventListener("click", function( e ) {
				
				
				var numbersToGet = []
				
				if (document.getElementById('inpFirstNumber').disabled) {
					// Use custom range
					// like 31625859623,31625359621,31675839629,31655796377,31616196341
					var strNumbers = document.getElementById('inpSepNumbers').value.replace(/\s/g, '').split(',');
					for(var i=0; i<strNumbers.length; i++) {
						numbersToGet.push(parseInt(strNumbers[i],10));
					}
					
				} else {
					// Use from/to range
					var firstNr = document.getElementById('inpFirstNumber').value;
					var lastNr = document.getElementById('inpLastNumber').value;					
					firstNr = parseInt(firstNr, 10);
					lastNr = parseInt(lastNr, 10);
					if (isNaN(firstNr) || isNaN(lastNr) ) {
						console.log('Numbers should be integers');
						return null;
					}
					for(var i=firstNr;i <= lastNr; i++) {
						numbersToGet.push(i);
					}
				}

				var divClientBoxes = document.getElementById('divClientBoxes');
				divClientBoxes.innerHTML = "";

				if (numbersToGet.length > maxNrClients) {
					console.log('Don\'t query more than ' + maxNrClients + ' numbers right now');
					return null;
				}
				var cursorPos = 0;
				
				var clientBoxCreateT = window.setInterval(function(){
					console.log('Next 100...');
					var lastCursorPos = cursorPos + 100;
					for(; cursorPos < lastCursorPos && cursorPos < numbersToGet.length; cursorPos++) {
						var box = createClientBox(numbersToGet[cursorPos], "", "" );
						if (box !== null) {
							divClientBoxes.appendChild(box);
						}						
					}
					if (cursorPos >= numbersToGet.length)
						clearInterval(clientBoxCreateT);
				}, 500);
				
				if (document.getElementById('chkShowRealAccounts').checked) {
					btnDownloadZip.disabled = false;
				} else {
					btnDownloadZip.disabled = true;
				}
				


			});
			
			
			btnDownloadZip.addEventListener("click", function( e ) {
				saveToZip();
			});

		}
		
		// Button to enable the UI
		function addActivateBtn() {
			var body = document.getElementsByTagName('body')[0];
			var startBtnDiv = document.createElement("div");
			startBtnDiv.innerHTML = '<div class="titleText">Whats<br/>All<br/>App</div>';
			startBtnDiv.id = 'btnOpenWhatsAllApp';
			startBtnDiv.addEventListener("click", function( e ) {
				var divContainer = document.getElementById("statusIndexer");
				    if(divContainer){
						divContainer.classList.remove('hide');
				    } else {
						createDOM();
						setupContainerEventListeners();
						this.classList.add('hide');
				    }
			});
			
			var style = "";
			style += "#btnOpenWhatsAllApp { height: 70px; border-radius: 50px; width: 70px; background-color: #43d854;  ";
			style += "position: fixed; top: 15px; left: 15px; z-index: 99999; box-shadow: 0 1px 1px 0 rgba(0,0,0,0.06), 0 2px 5px 0 rgba(0,0,0,0.2);}";
			style += "#btnOpenWhatsAllApp:hover { box-shadow: none; top:16px; cursor: pointer; }";
			style += "#btnOpenWhatsAllApp.hide { display: none; }";
			style += ".hide { display: none; }";
			style += "#btnOpenWhatsAllApp .titleText {text-align: center; font-size: 13px; padding-top: 14px; color: white; }";
			var styleEl = document.createElement("style");
			styleEl.innerHTML = style;
			body.appendChild(startBtnDiv);
			body.appendChild(styleEl);
		}

		// The UI that's added to the current DOM
		function createDOM() {
			var body = document.getElementsByTagName('body')[0];
			var containerDiv = document.createElement("div");
			containerDiv.id = 'statusIndexer';
			
			var closeBtnDiv = document.createElement("div");
			closeBtnDiv.id = 'btnCloseWhatsAllApp';
			closeBtnDiv.innerHTML = '<div class="titleText">Close</div>';

			var inputFirstNumberLabel = document.createElement("label");
			inputFirstNumberLabel.innerHTML = 'First phone number';
			var inputFirstNumber = document.createElement("input");
			inputFirstNumber.type = "text";
			inputFirstNumber.placeholder = "31612345678";
			inputFirstNumber.value = firstNumberStd;
			inputFirstNumber.id = "inpFirstNumber";

			var inputLastNumberLabel = document.createElement("label");
			inputLastNumberLabel.innerHTML = 'Last phone number';
			var inputLastNumber = document.createElement("input");
			inputLastNumber.type = "text";
			inputLastNumber.placeholder = "31612345678";
			inputLastNumber.value = lastNumberStd;
			inputLastNumber.id = "inpLastNumber";
			
			var inputSepNumbersLabel = document.createElement("label");
			inputSepNumbersLabel.innerHTML = 'Or enter comma separated list of numbers';
			var inputSepNumbers = document.createElement("input");
			inputSepNumbers.type = "text";
			inputSepNumbers.placeholder = "31612345678,31612345638,31612342638";
			inputSepNumbers.id = "inpSepNumbers";
			var toggleFirstLastInputs = function(){
				if (this.value !== '') {
					inputFirstNumber.disabled = true;
					inputLastNumber.disabled = true;
				} else {
					inputFirstNumber.disabled = false;
					inputLastNumber.disabled = false;					
				}
			}
			
			inputSepNumbers.addEventListener('keyup', toggleFirstLastInputs);
			inputSepNumbers.addEventListener('change', toggleFirstLastInputs);

			var btnStartIndexer = document.createElement("button");
			btnStartIndexer.id = 'btnStartIndexer';
			btnStartIndexer.innerHTML = 'Start indexer';
			
			var chkShowRealAccounts = document.createElement("input");
			chkShowRealAccounts.type = 'checkbox';
			chkShowRealAccounts.id = 'chkShowRealAccounts';
			chkShowRealAccounts.value = '1';
			var chkShowRealAccountsLabel = document.createElement("label");
			chkShowRealAccountsLabel.appendChild(chkShowRealAccounts);
			chkShowRealAccountsLabel.innerHTML += 'Only show existing accounts';
			
			var btnDownloadZip = document.createElement("button");
			btnDownloadZip.id = 'btnDownloadZip';
			btnDownloadZip.innerHTML = 'Download as ZIP';
			btnDownloadZip.disabled = true;
			
			

			containerDiv.appendChild(closeBtnDiv);
			containerDiv.appendChild(inputFirstNumberLabel);
			containerDiv.appendChild(inputFirstNumber);
			containerDiv.appendChild(inputLastNumberLabel);
			containerDiv.appendChild(inputLastNumber);
			containerDiv.appendChild(inputSepNumbersLabel);
			containerDiv.appendChild(inputSepNumbers);
			containerDiv.appendChild(document.createElement("br"));
			containerDiv.appendChild(btnStartIndexer);
			containerDiv.appendChild(chkShowRealAccountsLabel);
			containerDiv.appendChild(btnDownloadZip);
			containerDiv.appendChild(document.createElement("hr"));
			var clientBoxesDiv = document.createElement("div");
			clientBoxesDiv.id = 'divClientBoxes';
			containerDiv.appendChild(clientBoxesDiv);

			var style = "";
			style += "#statusIndexer {position: absolute; top: 0px; left: 0px; min-height: 50%; overflow: scroll; max-height: 95%; background-color: rgba(230,230,230,1); z-index: 99999999; width: 95vw; padding: 50px; border-bottom: solid 3px #58e870; box-shadow: black 0px 1px 62px 0px;}";
			style += "#statusIndexer label {margin: 0 15px 0 0;}";
			style += "#statusIndexer input {margin: 0 25px 0 0; padding: 5px;}";
			style += "#statusIndexer button {margin: 10px 0; border: solid 1px black; padding: 3px; border-radius: 3px; }";
			style += "#statusIndexer button:hover {background-color: #58e870;}";
			style += "#statusIndexer .indexerClientBox {float: left; width: 120px; text-align: center; margin: 15px; height: 65px;}";
			style += "#statusIndexer img {width: 32px; height: 32px;}";
			style += "#statusIndexer img.isOffline {border-left: solid 5px orange;}";
			style += "#statusIndexer img.isOnline {border-left: solid 5px green;}";
			style += "#statusIndexer .indexerPhone {font-size: 13px; margin: 2px; font-weight: bold;}";
			style += "#statusIndexer .indexerStatus {font-size: 11px; margin: 2px;}";
			style += "#btnCloseWhatsAllApp { height: 50px; border-radius: 25px; width: 50px; background-color: #f44336;  ";
			style += "position: fixed; top: 15px; right: 15px; z-index: 99999; box-shadow: 0 1px 1px 0 rgba(0,0,0,0.06), 0 2px 5px 0 rgba(0,0,0,0.2);}";
			style += "#btnCloseWhatsAllApp:hover { box-shadow: none; top:16px; cursor: pointer; }";
			style += "#btnCloseWhatsAllApp .titleText {text-align: center; font-size: 13px; padding-top: 18px; color: white; }";
			style += "#chkShowRealAccounts {margin: 0 5px 0 15px !important;}";
			style += "#inpSepNumbers { width: 325px; }";
			style += "#inpFirstNumber, #inpLastNumber, #inpSepNumbers {user-select: all !important; }";
			style += "#inpFirstNumber::selection, #inpLastNumber::selection, #inpSepNumbers::selection { background-color: #43d854; }";
			var styleEl = document.createElement("style");
			styleEl.innerHTML = style;
			body.appendChild(styleEl);
			body.appendChild(containerDiv);
			
			document.getElementById('chkShowRealAccounts').checked = true;
		}
		
		
		// Create a floated div per phonenumber and execute WhatsApp API queries
		function createClientBox(phonenumber) {
			var dontShowNonExisting = document.getElementById('chkShowRealAccounts').checked;
			var divBox = document.createElement("div");
			divBox.classList.add('indexerClientBox');
			divBox.id = 'p'+phonenumber;
			var imgSrcNoneFound = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAIAAAC3LO29AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABDRJREFUeNrsmj1IW1EUgGMNWLBGUIigIlVoq4LUQqsuXerP4uLf4qDSLh1aaRehCk6CDl0q2qFDf6yDi1YXF0272EFLoQWLkQoKGgsKKZggjaCkX97Bx0s01qA2Uc4jhHd/c757zj33nEuSgsGg7UI/l2wX/VFCJVRCJVRCJVRCJVRCJVRCJVRCJVRCJVRCJVRCJVTCUyDcGP3gnXJZi1uzX44e8uvN0PaC+9wQbo6Nux8+MiWmuDU7d/SQ1f7Bf67C6T72k453OH52dN6anIioB3vX57c70lKLi6z1JSPvkx0OXuBMLS7cXliUPtI/JTfncm6OdQZqdjzr9LQbo+JAmH2/FbVge9kP2szKpY5OLDa9ogwAvotevTSblnt608vL8p62zze3ALbn8wU869ITVJBKJyeAtM6w6/OVjAzzHjdPAxuQCGquPcJBhVhojI1K8dCBmdWVt2c+ZTU1oE/ASg1D+D3lkhmM4cN5Tx7H35ciBMu/0tMrRdlmmTVVfKMlPjv78BFPekU53yk52fRBb9gh1ojGWBSKojRnU338CZEsv7vLG1r7RYrJjjS+EVRao+GFz5AWMaFpEccZ/j/OQzTGR6jQDCKu9PQhJbuOSmdTQ0yzZdRUMQNbEXPAjcWTEOtK2Xd9qBG7Emd47Xkfx8bXu/fYVGxI0z1ah9BZVEfR9LfSSn9GBTye1f6BK0ZThJJje4IJ+fxZ88jL+ut3M1evn2Qquy0hnx/NLRybqA5DLejuOslUSYn5TwX2sPgYawxwoQg1t0hUwmjJBza5+mIgEH70SeX5ICT/IAo9IvlgyxH3RRzuUhn/3OJ40XmbGeKcAyvFcjjKP+ffQDPITXF5PyLFCKnEur7V1tGBbmKTnN1bc2HGSbwye/MOH3NsKDl+OySVB42TbtGaTp+QsIOAg5wA6TdHx/HmpE6iorX+QYlXSKnoQM+ljmdibxF5fUZ1JWkH8zDWvCVgaaghjo/IkqEiNiLzoJWmWK8IYiYk2uLnJZMALNOIIY2w242IGKQcX2tGPhWIEjcDzxCCMsm2pLLAiPvIxWi1blfv9EcWbjPkpeaY3HpvciaE32vrvNMuZ2O9qAs8IHEhG2PjyIcELDlhd2pRYVZjfbTTnEm23YssR8QNwKGphlVp/K7kXGdFiPaQj8WW9M/8VeoxJKeBxJYjqbOm/Ac9J8rH5FgRq/8UEpqMfN9hTVwo5j1tl0+syb49xk0Yui/BnRA0hgT1+8VuUd2uz29mvexPxI124yTKxxvthTtY9hjWAR4dWCPJNiXDnm9uxW/JnQ0bMqY7m5ijNnRo7Idcfg8RxcyoNN9DO2fKhSowpx3jDsZsBZulYTlkEsmMJMKGh+VjoJi9qUzRmLyLAR9q2BqXKqESKqESKqESKqESKqESKqESKqESKqESKqESKqESKqHtrwADAMxLRItbnk5RAAAAAElFTkSuQmCC";

			var clientImgA = document.createElement("a");
			var clientImg = document.createElement("img");
			var profilePicRoutine = function(nr) {			
				// Cut it out when UI is no longer active
				if (document.getElementById('statusIndexer') == null)
					return;
				
				WLAPStore.ProfilePicThumb.find( nr + '@c.us').then(function(d){
					var imgATag = document.getElementById('p'+nr).getElementsByTagName('a')[0];
					var imgTag = document.getElementById('p'+nr).getElementsByTagName('img')[0];

					if (d.img === null) {
						profilePicRoutine(nr);
					}
					if (d.img === undefined) {
						imgTag.src = imgSrcNoneFound;
						imgATag.href = '';
						if (dontShowNonExisting) {
							divBox.remove();
						} else {
							divBox.style.display = '';							
						}
						
					} else {
						imgTag.src = d.imgFull;
						imgTag.dataset.fullurl = d.imgFull;
						imgATag.href = '#';
						imgATag.addEventListener('click', function(){
							imgTag.src = d.imgFull;
							window.open(d.imgFull, '_blank');
						});
						imgATag.target = '_blank';

					}
				}, function(e){
					// Server is throttling/rate limiting, we try it again
					profilePicRoutine(nr);
				});
			};

			profilePicRoutine(phonenumber);

			clientImgA.appendChild(clientImg);
			var clientPhone = document.createElement("div");
			clientPhone.classList.add('indexerPhone');
			clientPhone.innerHTML = phonenumber;
			var clientStatus = document.createElement("div");
			clientStatus.classList.add('indexerStatus');

			var statusFindRoutine = function(nr) {
				
				// Cut it out when UI is no longer active
				if (document.getElementById('statusIndexer') == null)
					return;
				
				WLAPWAPStore.statusFind( nr + '@c.us').then(function(d){
					document.getElementById('p'+nr).getElementsByClassName('indexerStatus')[0].innerHTML = d.status;
				}, function(e){				
					// Server is throttling/rate limiting, we try it again
					statusFindRoutine(nr);
				});
			};
			statusFindRoutine(phonenumber);


			WLAPStore.Presence.find( phonenumber + '@c.us').then(function(d){
				if (d.isOnline)
					clientImg.classList.add('isOnline');
				else
					clientImg.classList.add('isOffline');

			});

			divBox.appendChild(clientImgA);
			divBox.appendChild(clientPhone);
			divBox.appendChild(clientStatus);
			return divBox;
		}


		// Check online/offline status every 10 sec
		window.setInterval(function() {					
			// Cut it out when UI is no longer active
			if (document.getElementById('statusIndexer') == null)
				return;
			
			for(var i=0; i < WLAPStore.Presence.models.length; i++) {
				var m = WLAPStore.Presence.models[i];
				var id = 'p' + m.id.slice(0, -5);
				var clientBox = document.getElementById(id);
				if (clientBox !== null) {
					var img = clientBox.getElementsByTagName('img')[0];
					img.classList.remove('isOnline');
					if (m.isOnline) {
						console.log(id + ' is online');
						clientBox.parentNode.prepend(clientBox);
						img.classList.remove('isOffline');
						img.classList.add('isOnline');
					} else {
						img.classList.remove('isOnline');
						img.classList.add('isOffline');
					}
				}

			}
		}, 10000);
		
		// Let's setup the UI
		window.setTimeout(function(){
			if (document.getElementsByClassName('qr-wrapper-container').length == 0)
				addActivateBtn();
		}, 500);
	
	}
	
	
	
	var scripts = document.getElementsByTagName('script');
	var regExAppScr = /\/app\..+.js/;
	var regExApp2Scr = /\/app2\..+.js/;
	var appScriptLocation = '';
	var app2ScriptLocation = '';
	window.WLAPStore = {};
	window.WLAPWAPStore = {};
	
	var grepFunctionNames = function() {
		fetch(app2ScriptLocation).then( e => {
			var reader = e.body.getReader();
			var js_src = "";	
			
			return reader.read().then(function readMore({done, value}){
				var td = new TextDecoder("utf-8");
				var str_value = td.decode(value);
				if (done) {
					js_src += str_value;
					var regExDynNameStore = /'"(\w+)"':function\(e,t,a\)\{\"use strict\";e\.exports=\{AllStarredMsgs:/;
					var res = regExDynNameStore.exec(js_src);
					var funcName = res[1];
					webpackJsonp([], { [funcName]: (x, y, z) => window.WLAPStore = z('"'+funcName+'"') }, funcName);
					console.log('Created Store');
					return;
				}		
				
				js_src += str_value;
				return reader.read().then(readMore);
				
			})
			
		}).then( () => {
			fetch(appScriptLocation).then( e => {
				var reader = e.body.getReader();
				var js_src = "";	
				
				return reader.read().then(function readMore({done, value}){
					var td = new TextDecoder("utf-8");
					var str_value = td.decode(value);
					if (done) {
						js_src += str_value;
						var regExDynNameStore = /Wap:n\('"(\w+)"'\)/;
						var res = regExDynNameStore.exec(js_src);
						var funcName = res[1];
						webpackJsonp([], { [funcName]: (x, y, z) => window.WLAPWAPStore = z('"'+funcName+'"') }, funcName);
						console.log('Created Store WAP');
						whenStoreIsReady()
						return;
					}		
					
					js_src += str_value;
					return reader.read().then(readMore);
					
				})	
			})
		})
	}
	
	var grepScriptTags = async function () {
		for (var i=0; i<scripts.length;i++) {
			var src = scripts[i].src;
			if (regExAppScr.exec(src) != null) {
				appScriptLocation = src;
			}
			
			if (regExApp2Scr.exec(src) != null) {
				app2ScriptLocation = src;
			}
		}	
		if (appScriptLocation === '' || app2ScriptLocation == '') {
			console.log('DOM not ready for WhatsAllApp yet');
			await sleep(1000);
			grepScriptTags();
		} else {
			console.log('DOM ready for WhatsAllApp! Let\'s continue...');
			grepFunctionNames();
		}
	} 

	grepScriptTags();
	
	


})();