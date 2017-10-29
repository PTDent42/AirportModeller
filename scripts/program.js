
//File variables
var fAirportFile = "data/AirportFile.txt";
var fBoundaryFile = "data/FIRBnd.txt";
//<<<<<<<<<<<<<<<<<<<<<
// will be sent from previous page
var fDataFile = "data/CYYZ 2017-09-05.txt"

//<<<<<<<<<<<<<<<<<<<<<<
//debug stuff
var nPassage = 0;



//Color Constants
var color_BACGKGROUND 	= "#000000";
var color_GRID 			= "#222222";
var color_MESSAGESCREEN = "#ffffff";
var color_MESSAGE 		= "#000000";
var color_BOUNDARY 		= "#ffff00";
var color_BOUNDARYFILL	= 'rgba(50,50,50, 0.90)';
var color_AIRPORTS		= "#00b0b0";
var color_BLACK			= "#000000";
var color_WHITE			= "#ffffff";
var color_GREY 			= "#bbbbbb";
var color_AIRCRAFTTRACK = 'rgba(255,255,255, 0.33)';

//Interface Constants
var NOACTION 	= 0;
var ZOOMING 	= 1;
var UNZOOMING 	= 2;
var SCROLLLEFT 	= 3;
var SCROLLRIGHT = 4;
var SCROLLUP 	= 5;
var SCROLLDOWN 	= 6;
var MIN_ZOOM 	= 2;
var MAX_ZOOM 	= 10000;
var BUTTONSIZE 	= 32;
var FIXSIZE 	= 2;

//Application Action Constants
var BOUNDARYFILE 	= 11;
var AIRPORTFILE	= 15;
var DATAFILE	= 17;

var sMessage;
//Object arrays
var aButtons 				= new Array();
var aBoundaries				= new Array();
var aAirports				= new Array();
var aAircraft				= new Array();
var aImages					= new Array();
var vNavPanelCoords			= new Array();
var vToolPanelCoords		= new Array();

//Drawing Variables
var cvMap;
var ctxMap;
var nImages;
var nNavButtons			=8;
var bDrawGrid 			= true;
var iImageLoadCounter 	= 0;
var timerMapMovement 	= null;
var nScrollSpeed = 0.25;

//Interface Variables
var iMapAction = NOACTION;
var iAppLoadType = NOACTION;

//Scenario Variables
var bScenarioLoaded = false;
var sScenarioAirport;
var tScenarioEndTime;
var tScenarioStartTime;
var tScenarioCurrentTime;
var sScenarioTitle;


//Radar state variables
var ScrnSize = new Vector2d(960,700);
var pDefaultMapCentre = new Polar3d(50,-100);
var pCurrentMapCentre = new Polar3d(50,-100);
var nCurrentZoom = 6000; 
var nDefaultZoom = 6000;

//files
var sFileData;
var fileRequest;
var bFileLoaded;

//debug variables
var iPeteCtr = 0;

//##################################################################################
	//------------------------------------------------
	//-
	//-     INTERFACE set up functions
	//-
	//------------------------------------------------
window.onload = function()
{
	//get handles and context for all drawing surfaces
	cvMap  	= document.getElementById("canvasMap"); 
	ctxMap 	= cvMap.getContext("2d");
	//set the image source location and image count
	var aTemp = ["images/zoomIn.png", "images/zoomOut.png", "images/Left.png","images/Right.png", "images/Up.png","images/Down.png"]
	nImages = aTemp.length;
	for (var i=0; i< aTemp.length; i++) {
		aImages[i] = new Image();
		aImages[i].onload = function () { onloadCheck();}
		aImages[i].src = aTemp[i];
	}
	//set event listeners flag
	bEventListenersOn = false;
}
//.................................................................
function onloadCheck() {
	//checks to see how many images have been loaded.  
	//When all have been loaded, then can start...
	iImageLoadCounter++;
	if (iImageLoadCounter < nImages) return;
	//set up listeners for events
	document.addEventListener("mousedown", mouseDown, false);
	document.addEventListener("touchstart", mouseDown, false);
	document.addEventListener("mouseup", mouseUp, false);
	document.addEventListener("touchend", mouseUp, false);
	window.addEventListener('resize', fResetWindows, false);
	//Once all loaded, start loading the datafiles
	//for maps and stuff.  Start with loading the fixes...
	fLoadFile(fAirportFile, AIRPORTFILE);
}


//##################################################################################
	//------------------------------------------------
	//-
	//-     Drawing functions
	//-
	//------------------------------------------------

function fResetWindows() {
	var iWinWidth, iWinHeight;
	var i,j;
	var sTxt;
	//This function is used when the app starts or when user resizes window
	//it sets the size and position of all the canvas elements

	//get size of window
	
	iWinWidth = window.innerWidth;
	iWinHeight = window.innerHeight;
	//console.log(iWinWidth, iWinHeight);
	//set screen size drawing variables to correspond
	ScrnSize.x = iWinWidth;
	ScrnSize.y = iWinHeight
	//ensure size of window is not less than 480x480;
	if (iWinWidth < 480)  iWinWidth = 480;
	if (iWinHeight < 480) iWinHeight = 480;

	//set  width of all the various canvas elements
	cvMap.width = iWinWidth;
	//set height
	cvMap.height = iWinHeight;
	drawMapLayer();
	
}
//.................................................................
function mapChange() {
	drawMapLayer();
}
//.................................................................
function drawMapLayer() {
	var i;
	
	//Paint map background
	ctxMap.fillStyle = color_BACGKGROUND;
	ctxMap.fillRect(0,0,ScrnSize.x, ScrnSize.y);
	//Draw the grid if it's selected...
	if (bDrawGrid)fDrawGrid();
	//Draw the sector boundary
	fDrawBoundaries();
	//draw the airports
	fDrawAirports();

	//--------------------
	//This will soon be independent of this
	fDrawSomeAircraft();
}
//.................................................................
function fDrawGrid () {

	//test if drawing is supposed to take place
	if (!bDrawGrid) return;
	//declare variables that will be used locally
	//var DrawPos = new Vector2d(0,0);
	var pThisPolar = new Polar3d(0,0);
	var i,j;
	//set the drawing style
	ctxMap.lineWidth = 1;
	ctxMap.strokeStyle = color_GRID;
	


	for (j=-9; j<10; j++) {
			pThisPolar.Lat = j*10;
			pThisPolar.Long = -180;
			DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
			ctxMap.beginPath();
			ctxMap.moveTo(DrawPos.x, DrawPos.y);
			for (i=-18; i<19; i++) {
				pThisPolar.Lat = j*10;
				pThisPolar.Long = i*10;
				DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
				ctxMap.lineTo(DrawPos.x, DrawPos.y);
				ctxMap.stroke();
			}
		}
	for (i=-18; i<19; i++) {
		pThisPolar.Long = i*10;
		pThisPolar.Lat = -90;
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		ctxMap.beginPath();
		ctxMap.moveTo(DrawPos.x, DrawPos.y);
		for (j=-9; j<10; j++) {
				pThisPolar.Lat = j*10;
				DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
				ctxMap.lineTo(DrawPos.x, DrawPos.y);
				ctxMap.stroke();
				//ctxMap.fill();
			}
		}
}
//.................................................................
function fDrawBoundaries() {
	var pThisPolar = new Polar3d(0,0);
	//set the drawing style
	ctxMap.lineWidth = 1;
	ctxMap.strokeStyle = color_BOUNDARY;
	ctxMap.fillStyle = color_BOUNDARYFILL;
	
	for (i=0; i<aBoundaries.length; i++) {
		ctxMap.beginPath();
		pThisPolar.Lat = aBoundaries[i][0].Lat;
		pThisPolar.Long = aBoundaries[i][0].Long;
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		ctxMap.moveTo(DrawPos.x, DrawPos.y);
		
		for (j=1; j<aBoundaries[i].length; j++) {
			pThisPolar.Lat = aBoundaries[i][j].Lat;
			pThisPolar.Long = aBoundaries[i][j].Long;
			DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
			ctxMap.lineTo(DrawPos.x, DrawPos.y);
		}//end j
		ctxMap.stroke();
		ctxMap.fill();	
	}//end i	
	
}

//.................................................................
function fDrawAirports() {
	var pThisPolar = new Polar3d(0,0);
	for (i=0; i< aAirports.length; i++) {
		pThisPolar.Lat = aAirports[i].Lat;
		pThisPolar.Long = aAirports[i].Long;
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		
		ctxMap.strokeStyle = color_AIRPORTS;
		ctxMap.beginPath();
		ctxMap.moveTo(DrawPos.x, DrawPos.y - FIXSIZE);
		ctxMap.lineTo(DrawPos.x, DrawPos.y + FIXSIZE);
		ctxMap.moveTo(DrawPos.x -FIXSIZE, DrawPos.y);
		ctxMap.lineTo(DrawPos.x + FIXSIZE, DrawPos.y);
		ctxMap.stroke();
		
	}
}
//##################################################################################
//------------------------------------------------
//-
//-    Main Timer, Aircraft Updating and Drawing
//-
//------------------------------------------------
//##################################################################################

function fDrawSomeAircraft() {

	if (!bScenarioLoaded) return;

    for (i=0; i<aAircraft.length; i++) {
        ctxMap.strokeStyle = color_AIRCRAFTTRACK;
        ctxMap.beginPath();
        //Update the position based on the current time
        aAircraft[i].fSetCurrentPosition(tScenarioCurrentTime);
    	if (aAircraft[i].bDraw) {
            DrawPos = aAircraft[i].tPreviousPosition.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.moveTo(DrawPos.x, DrawPos.y);
            DrawPos = aAircraft[i].tCurrentPosition.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
            ctxMap.lineTo(DrawPos.x, DrawPos.y);

        }//end if
        ctxMap.stroke();
	}//end i

	tScenarioCurrentTime += 0.25;
    fSendMessage(tScenarioCurrentTime);

}




	//------------------------------------------------
	//-
	//-     Mapping functions
	//-
	//------------------------------------------------
//.................................................................
function initiateMapMove() {
	//User has clicked a button to adjust/move the map (zoom in, scrol, etc.)
	//the type of movement is contained in the variable iMapAction
	//Set the map movement timer:
	timerMapMovement = setInterval (mapMoveTick, 20);
}
//.................................................................
function endMapMove() {
	//something has happened to trigger end of mapmovement
	//null the map movement timer
	clearInterval(timerMapMovement);
	timerMapMovement = null;
	//set the map action flag
	iMapAction = NOACTION;
}
//.................................................................
function mapMoveTick() {
	//timer has ticked for map movement
	//take action depending upon the type of movement
	switch (iMapAction) {
		case ZOOMING :
			nCurrentZoom *= 0.95;
			if (nCurrentZoom < MIN_ZOOM) nCurrentZoom = MIN_ZOOM;
			break;
		case UNZOOMING :
			nCurrentZoom *=1.05;
			if (nCurrentZoom > MAX_ZOOM) nCurrentZoom = MAX_ZOOM;
			break;
		case SCROLLLEFT:
			pCurrentMapCentre.Long -= nScrollSpeed;
			if (pCurrentMapCentre.Long < -179.9) pCurrentMapCentre.Long = -179.9;
			break;
		case SCROLLRIGHT:
			pCurrentMapCentre.Long += nScrollSpeed;
			if (pCurrentMapCentre.Long > 179.9) pCurrentMapCentre.Long = 179.9;
			break;
		case SCROLLUP:
			pCurrentMapCentre.Lat += nScrollSpeed;
			if (pCurrentMapCentre.Lat > 89.9) pCurrentMapCentre.Lat = 89.9;
			break;
		case SCROLLDOWN:
			pCurrentMapCentre.Lat -= nScrollSpeed;
			if (pCurrentMapCentre.Lat < -89.9) pCurrentMapCentre.Lat = -89.9;
			break;
	}
	mapChange();
}

//##################################################################################
	//------------------------------------------------
	//-
	//-     Event Handler functions
	//-
	//------------------------------------------------

//********************************************************
function mouseDown(event) {
	var xPos, yPos;
	//caputure mouse location on screen
	var sActions = event.target.id;
	//console.log(event.target.id);
	iMapAction = NOACTION;
	
	switch (sActions) {
		case "btnReload":
			fLoadFile(fDataFile, DATAFILE);
			break;
		case "btnStop":
			console.log("btnStop");
			break;
		case "btnPlay":
			fDrawSomeAircraft();
			break;
		case "btnSpd1":
			console.log("btnSpd1");
			break;
		case "btnSpd2":
			console.log("btnSpd2");
			break;
		case "btnSpd3":
			console.log("btnSpd3");
			break;
		case "btnSpd4":
			console.log("btnSpd4");
			break;
		case "btnZoomin":
			iMapAction = ZOOMING;
			break;
		case "btnZoomout":
			iMapAction = UNZOOMING;
			break;
		case "btnUP":
			iMapAction = SCROLLUP;
			break;
		case "btnDOWN":
			iMapAction = SCROLLDOWN;
			break;
		case "btnLEFT":
			iMapAction = SCROLLLEFT;
			break;
		case "btnRIGHT":
			iMapAction = SCROLLRIGHT;
			break;
		case "btnReset":
			pCurrentMapCentre.Lat= pDefaultMapCentre.Lat;
			pCurrentMapCentre.Long = pDefaultMapCentre.Long;
			nCurrentZoom = nDefaultZoom;
			bDrawGrid = true;
			mapChange();
			break;
		case "btnGrid":
			bDrawGrid = !bDrawGrid;
			mapChange();
			break;
	}

if (iMapAction) initiateMapMove();	
}
//.................................................................
function mouseUp(event) {
	//caputure mouse location on screen
	if (iMapAction) endMapMove();
}

//##################################################################################
	//------------------------------------------------
	//-
	//-     File Loading and processing functions
	//-
	//------------------------------------------------
//.................................................................
//generic file loading function.
//tries to open file and sets event listeners for failed or complete
function fLoadFile(url, iFileType){
	iAppLoadType = iFileType; //FIRFILE, AIRPORTFILE, DATAFILE
	//set the flag
	bFileLoaded = false;
	//empty the string
	sFileData = null;
	//get the file and load
	fileRequest = new XMLHttpRequest();
	fileRequest.addEventListener("load", fTransferComplete, false);
	fileRequest.addEventListener("error", fTransferFailed, false);
	fileRequest.open("GET", url, true);
	fileRequest.send();
}
//.................................................................
function fTransferComplete() {
	//remove event listeners
	fileRequest.removeEventListener("load", fTransferComplete, false);
	fileRequest.removeEventListener("error", fTransferFailed, false);
	//the transfer is showing complete....
	bFileLoaded = true;
	//put the response into the string
	sFileData = fileRequest.responseText;
	//put success message in string
	sMessage = ("File Loaded Successfully!");
	//console.log(fileRequest.status);

	//will show "complete" even if no file, so make sure that is covered....
	if (fileRequest.status == 404) {
		bFileLoaded = false;
		sMessage = ("404 - File Not Found");
	}
	//goto the next step...
	fLoadFileComplete(true);
}
//.................................................................
function fTransferFailed() {
	//remove event listeners
	fileRequest.removeEventListener("load", fTransferComplete, false);
	fileRequest.removeEventListener("error", fTransferFailed, false);
	//set flag
	bFileLoaded = false;
	sMessage = ("Error Loading File");
	fLoadFileComplete(false);
}
//.................................................................
function fLoadFileComplete(sFlag) {
	//a File has been loaded (or not)
	if (!sFlag) console.log("File Load Unsuccessful");
	
	//The flag state will indicate which kind of file (ini, map, aircraft, etc.)
	if (iAppLoadType == BOUNDARYFILE) fProcessBoundaryFile();
	else if (iAppLoadType == AIRPORTFILE) fProcessAirportFile();
	else if (iAppLoadType == DATAFILE) fProcessScenarioFile();
}
//.................................................................
function fProcessAirportFile() {
	var aData;
	var aLineData;
	var nLat, nLong;
	var sName;
	var oAirport;
	//reset the flag
	iAppStatus = NOACTION;
	//check it loaded!
	if (!bFileLoaded) console.log ("AirportFile failed to load!");
	aData = sFileData.split("\n");
	//process the file...
	while (aData.length > 0){
		if (aData[0].substr(0,1) == ";" || aData[0].substr(0,1) == " "){
			//console.log(aFixData[0]);
			aFixData.shift();
			continue;
			}
		aData[0] = aData[0].replace(/ {1,}/g," ");  //eliminate double spaces if any exist
		aLineData = aData[0].split(" ");  //break line into array
		sName = aLineData[0];
		nLat = Number(aLineData[1]) + Number(aLineData[2])/60 + Number(aLineData[3])/3600;
		nLong = Number(aLineData[4]) + Number(aLineData[5])/60 + Number(aLineData[6])/3600;
		nLong *= -1;
		oAirport = new Object();
		oAirport.Name = sName;
		//console.log(sName);
		oAirport.Lat = nLat;
		oAirport.Long = nLong;
		aAirports.push(oAirport);
		aData.shift();
	}
	//Now aircraft and fixes are loaded = go to screen that selects the 
	//maps and scenarios
	fLoadFile(fBoundaryFile, BOUNDARYFILE)
}
//.................................................................
function fProcessBoundaryFile() {
	var aLines, aPoints;
	var nLat, nLong;
	var oBoundaryPoint;
	//reset the flag
	iAppStatus = NOACTION;
	//check it loaded!
	if (!bFileLoaded) console.log ("FIR file failed to load!");
	
	//break data into chunks
	aLines = sFileData.split("\n");
	//first get the number of boundaries (should be 8)
	numBoundaries = Number(aLines.shift());
	//console.log("#=" + numBoundaries);
	for (i=0; i<numBoundaries; i++) {
		//First retrieve the number of boundary points that follow...
		numBoundaryPoints = Number(aLines.shift());
		aBdyPoints = new Array();
		for (j=0; j< numBoundaryPoints; j++) {
			myLine = aLines.shift();
			aPoints = myLine.split(" ");
			nLat = Number(aPoints[0]);
			nLong = Number(aPoints[1]);
			nLong *= -1;
			pThisPolar = new Polar3d(nLat,nLong);
			aBdyPoints.push(pThisPolar);
			}//end j
		aBoundaries.push(aBdyPoints);
		}// end i
	fResetWindows();
}//end function fProcessBoundaryFile()
//.................................................................
function fProcessScenarioFile() {
	var aLines, aChunks, aData;
	var sData;
	var tempAircraft;
	//reset the flag
	iAppStatus = NOACTION;
	//check it loaded!
	if (!bFileLoaded) console.log ("Datafile failed to load!");
	//clear out any old aircraft from the file
	while (aAircraft.length > 0) aAircraft.shift();

	//pull the header information from the filename

	//filename will look like: "data/CYYZ 2017-09-05.txt"
	//first remove the folder - i.e. "data/" and the extenstion ".txt"
	sData = fDataFile.substr(5, fDataFile.length - 9);
	//assign this to the sScenarioTitle for display
	sScenarioTitle = sData;
	fSendMessage(sScenarioTitle);
	//now break into two pieces of data
	aChunks = sData.split(" ");
	//get the scenario main airport
	sScenarioAirport = aChunks[0];
	//Break down the time
	aData = aChunks[1].split("-");
	var year = aData[0];
	var month = aData[1];
	var day = aData[2];


	//the following just here to remind how to show the time easily....
	//tScenarioCurrentTime.setTime(tScenarioEndTime - (26*60*60*1000));

	//break data into chunks
	aLines = sFileData.split("\n");
	//now cycle through each line and create aircraft!
	while (aLines.length > 0) {
		sTemp = aLines.shift();
		if (sTemp.length > 1) {
			sACString = sTemp;
			aAircraft.push(new cAircraft(sACString));
		}//end if
	}//end while

	//Now cycle through entire aircraft file and determine the earliest and latest times
	var nEarliestTime = 0;
	var nLatestTime = 0;
	for (var i=0; i<aAircraft.length; i++) {
		if (aAircraft[i].tDepartureTime < nEarliestTime) nEarliestTime = aAircraft[i].tDepartureTime;
        if (aAircraft[i].tArrivalTime > nLatestTime) nLatestTime = aAircraft[i].tArrivalTime;
	}


	//Now reset all the time so it starts at 0
    for (var i=0; i<aAircraft.length; i++) {
    	aAircraft[i].tDepartureTime -= nEarliestTime;
    	aAircraft[i].tArrivalTime -= nEarliestTime;

    	console.log(aAircraft[i].tDepartureTime + " -> " + aAircraft[i].tArrivalTime);
    }

    tScenarioStartTime = 0;
    tScenarioCurrentTime = 0;
    tScenarioEndTime = nLatestTime - nEarliestTime;

    console.log("Scenario Ends at:  " + tScenarioEndTime);


    bScenarioLoaded = true;
}

//##################################################################################
	//------------------------------------------------
	//-
	//-     Miscellaneous functions
	//-
	//------------------------------------------------	
//********************************************************

function fSendMessage(mText) {
	//blank the message screen area
	ctxMap.fillStyle= color_MESSAGESCREEN;
	ctxMap.fillRect(150,0,ScrnSize.x - 215, 25);
	//write the message
	var yPos = 5;
	var xPos = 155;
	ctxMap.font = "normal 11pt Arial";
	ctxMap.fillStyle = color_MESSAGE;
	ctxMap.textAlign = "left";
	ctxMap.textBaseline = "top";
	ctxMap.fillText("Message:  " + mText, xPos, yPos);
}
//********************************************************













