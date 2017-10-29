

//FROM the Process FIR file function
//break all boundary data into array
	aFileData = aFileChunks[0].split("\n");
	//Process first line - name, lat, long, zoom +++++++++++++
	aLineData = aFileData[0].split(",");
	sSectorName = aLineData[0];
	pDefaultMapCentre.Lat = Number(aLineData[1]);
	pDefaultMapCentre.Long = Number(aLineData[2]);
	nDefaultZoom = Number(aLineData[3]);
	aLineData.length = 0;
	aFileData.shift();

	//Now get the Boundary information  ++++++++++++++++++++++++
	aLineData = aFileData[0].split(",");
	if (aLineData.shift() == "C") bBoundaryCircle = true;
	else bBoundaryCircle = false;
	while (aLineData.length > 0) {
		aBoundaryPoints.push(aLineData.shift());
	}
	//Set current = default
	
	pCurrentMapCentre.Lat = pDefaultMapCentre.Lat;
	pCurrentMapCentre.Long = pDefaultMapCentre.Long;
	
	nCurrentZoom = nDefaultZoom;
	//clean up
	aFileData.length = 0;
	aLineData.length = 0;
	aFileChunks.shift();

//---------------------------------------------------------
function fDrawBoundary() {
	var pThisPolar = new Polar3d(0,0);
	//set the drawing style
	ctxMap.lineWidth = 1;
	ctxMap.strokeStyle = color_BOUNDARY;
	ctxMap.fillStyle = color_BOUNDARYFILL;

	if (bBoundaryCircle) {
		pThisPolar.Lat = aBoundaryPoints[0];
		pThisPolar.Long = aBoundaryPoints[1];
		//console.log(pThisPolar);
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		nRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, aBoundaryPoints[2]);
		ctxMap.beginPath();
		ctxMap.arc(DrawPos.x, DrawPos.y, nRadius, 0, 6.283);
		ctxMap.stroke();
		ctxMap.fill();
	}
	else {
		//console.log("boundary not a circle");
		var iBndCnt=aBoundaryPoints.length/2;
		ctxMap.beginPath();
		pThisPolar.Lat = aBoundaryPoints[0];
		pThisPolar.Long = aBoundaryPoints[1];
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		ctxMap.moveTo(DrawPos.x, DrawPos.y);
		for (var i=1; i<iBndCnt ; i++){
			pThisPolar.Lat = aBoundaryPoints[i*2];
			pThisPolar.Long = aBoundaryPoints[i*2+1];
			DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
			ctxMap.lineTo(DrawPos.x, DrawPos.y);
		}
		ctxMap.stroke();
		ctxMap.fill();
	}
}
//---------------------------------------------------------
//.................................................................
function fDrawMap (aData) {
	var aLineData = new Array();
	var DrawPos;
	var pThisPolar = new Polar3d(0,0);
	var nRadius;

	var iNumFix = 0, iNumLine = 0, iNumCircle = 0, iFixType = 1, iVertex = 1, iLineType = 1, iCircleType = 1;
	var nLat, nLong, nRadius;
	var i,j,k;
	//console.log("at draw map");
	//set the drawing parameters
	ctxMap.lineWidth = 1;

	//get the number of each item from the first line of file....
	aLineData = aData[0].split(",");
	iNumFix = Number(aLineData[0]);
	iNumLine = Number(aLineData[1]);
	iNumCircle = Number (aLineData[2]);

	//Now process all the fixes
	for (i=0; i< iNumFix; i++) {
		j=i+1; //j is the offset into the array
		aLineData = aData[j].split(",");
		iFixType = Number(aLineData[0]);
		pThisPolar.Lat = Number(aLineData[1]);
		pThisPolar.Long = Number(aLineData[2]);
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		
		if (iFixType == 1) {
			ctxMap.strokeStyle = color_FIX1;
			ctxMap.beginPath();
			ctxMap.moveTo(DrawPos.x, DrawPos.y - FIXSIZE);
			ctxMap.lineTo(DrawPos.x + FIXSIZE, DrawPos.y);
			ctxMap.lineTo(DrawPos.x, DrawPos.y + FIXSIZE);
			ctxMap.lineTo(DrawPos.x - FIXSIZE, DrawPos.y);
			ctxMap.lineTo(DrawPos.x, DrawPos.y - FIXSIZE);
			ctxMap.stroke();
		}
		else if (iFixType == 2) {
			ctxMap.strokeStyle = color_FIX2;
			ctxMap.beginPath();
			ctxMap.moveTo(DrawPos.x, DrawPos.y - FIXSIZE);
			ctxMap.lineTo(DrawPos.x, DrawPos.y + FIXSIZE);
			ctxMap.moveTo(DrawPos.x -FIXSIZE, DrawPos.y);
			ctxMap.lineTo(DrawPos.x + FIXSIZE, DrawPos.y);
			ctxMap.stroke();
		}
		else console.log("Fix Type not found in drawing area");
	}
	aLineData.length = 0;
	//Now for the lines
	for (i=0; i< iNumLine; i++) {
		j = i + 1 + iNumFix;  //offset into array
		aLineData = aData[j].split(",");
		iLineType = Number(aLineData[0]);
		iVertex = Number (aLineData[1]);
		aLineData.shift();
		aLineData.shift();
		if (iLineType == 1) ctxMap.strokeStyle = color_LINE1;
		else if (iLineType == 2) ctxMap.strokeStyle = color_LINE2;
		else if (iLineType == 3) ctxMap.strokeStyle = color_LINE3;
		else if (iLineType == 4) ctxMap.strokeStyle = color_LINE4;
		else if (iLineType == 5) ctxMap.strokeStyle = color_LINE5;
		else if (iLineType == 6) ctxMap.strokeStyle = color_LINE6;
		else console.log("Line Type Missing");
		pThisPolar.Lat = Number(aLineData[0]);
		pThisPolar.Long = Number(aLineData[1]);
		aLineData.shift();
		aLineData.shift();
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		ctxMap.beginPath();
		ctxMap.moveTo(DrawPos.x, DrawPos.y);
		for (k=1; k< iVertex; k++) {
			pThisPolar.Lat = Number(aLineData[0]);
			pThisPolar.Long = Number(aLineData[1]);
			aLineData.shift();
			aLineData.shift();
			DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
			ctxMap.lineTo(DrawPos.x, DrawPos.y);
		}
		ctxMap.stroke();
		aLineData.length = 0;
	}
	aLineData.length = 0;
	//finally the circles...
	for (i=0; i< iNumCircle; i++) {
		j = i + 1 + iNumFix + iNumLine;  //offset into array
		aLineData = aData[j].split(",");
		iCircleType = Number(aLineData[0]);
		nRadius = fGetPixelDistance(ScrnSize, nCurrentZoom, aLineData[3]);
		pThisPolar.Lat = Number(aLineData[1]);
		pThisPolar.Long = Number(aLineData[2]);
		DrawPos = pThisPolar.getDisplay(ScrnSize, pCurrentMapCentre, nCurrentZoom);
		if (iCircleType == 1) ctxMap.strokeStyle = color_CIRCLE1;
		else if (iCircleType == 2) ctxMap.strokeStyle = color_CIRCLE2;
		else console.log("Circle Type Missing");
		ctxMap.beginPath();
		ctxMap.arc(DrawPos.x, DrawPos.y, nRadius, 0, 6.283);
		ctxMap.stroke();

	}

}