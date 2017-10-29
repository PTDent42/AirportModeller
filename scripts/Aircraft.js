//place to keep the aircraft class and associated functions


function cAircraft(sInput) {
    var aData = sInput.split(" ");
    this.bValid = true;
    this.sType = aData[0];
    this.sDep = aData[1];
    this.sArr = aData[2];
    this.sTime = aData[3];
    this.bDraw = false;
    //get the polar and vector3d coords of Dep and Arr airports
    this.pDep = getAirportCoords(this.sDep);
    this.pArr = getAirportCoords(this.sArr);
    if (!this.pDep || !this.pArr) {
        this.bValid = false;
        return;
    }
    this.tDep = this.pDep.getTriple();
    this.tArr = this.pArr.getTriple();

    //set current & previous position to departure point
    this.tCurrentPosition = this.tDep;
    this.tPreviousPosition = this.tDep;

    //get the distance from the dep-arr
    this.nDirectDistance = this.tDep.distanceFrom(this.tArr);
    this.nGreatCircleDistance = this.pDep.getDistance(this.pArr);
    //aircraft speed
    this.nGroundSpeed = getAircraftSpeed(this.nGreatCircleDistance);
    this.nAdjustedSpeed = (this.nDirectDistance * this.nGroundSpeed)/this.nGreatCircleDistance;

    //Determine arrival and departure times
    if (this.sDep == sScenarioAirport) this.bDep=true
    else this.bDep = false;
    //if bDep = true then the time in this.sTime is departure time
    var nFlightTime = this.nGreatCircleDistance/this.nGroundSpeed;//time in hours
    //console.log("Flight Time = " + nFlightTime);
    var tKeyTime = Number(this.sTime);

    if (this.bDep) {
        this.tDepartureTime = -tKeyTime;
        this.tArrivalTime = tKeyTime + nFlightTime;
    }
    else {
        this.tArrivalTime = -tKeyTime;
        this.tDepartureTime = tKeyTime - nFlightTime;
    }//end it/then/else

    //console.log(this.tDepartureTime + " -->" + this.tArrivalTime);

    //Get the vectorthat will trace the path from Dep->Arr
    this.tVector = this.tArr.subtract(this.tDep);
    this.tVector.normalize();

	}

cAircraft.prototype =
{



    fSetCurrentPosition: function (tThisTime) {

        if (!this.bValid) return;
        //if before departure or after arrival then don't update or draw.
        if ((tThisTime < this.tDepartureTime) || (tThisTime > this.tArrivalTime)) {
            this.bDraw = false;
            return;
        }
        this.bDraw = true;
        //set previous position for drawing purposes
        this.tPreviousPosition = this.tCurrentPosition;
        var tElapsedTime = tThisTime - this.tDepartureTime; //elapsed time in hours since departure
        //calculate where aircraft is on straight line from DEP-ARR (through Earth)
        var tVectoredPosition = this.tDep.add(this.tVector.multiply(tElapsedTime * this.nAdjustedSpeed));
        //get the norm of that vector and extend to earth radius
        tVectoredPosition.normalize();
        this.tCurrentPosition = tVectoredPosition.multiply(EARTH_RADIUS);
    }
    }//end prototype


//***************************************
//HELPER functions

function getAirportCoords(sRqst) {
    for (ctr = 0; ctr < aAirports.length; ctr++) {
        if (sRqst == aAirports[ctr].Name) {
            return new Polar3d(aAirports[ctr].Lat, aAirports[ctr].Long);
        }
    }
    return 0;
}

function getAircraftSpeed(distance) {

    //might make this more sophisticated later but...
    if (distance < 200) return 200
    else if (distance <300) return 250
    else if (distance < 1000) return 360
    else if (distance < 3500) return 420
    else if (distance < 5000) return 460
    else return 500;
}

