
var EARTH_RADIUS = 3437;

function DTOR(Degrees) {
	return ((Degrees * Math.PI)/180);
	};

function RTOD(Radians) {
	return (Radians * (180/Math.PI));
	};

function fGetPixelDistance(Scrn, fZoom, nMiles){
    var PPM;
    var ScreenCtrX, ScreenCtrY; 
    ScreenCtrX = Math.round(Scrn.x/2);
    ScreenCtrY = Math.round(Scrn.y/2);    
    PPM = ScreenCtrY/fZoom;  //Pixels Per Mile 
    return (PPM * nMiles);
};

function Vector3d(x, y, z)
{
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
        this.z = z !== undefined ? z : 0;
}
Vector3d.prototype =
{
        add: function(b)
        {
                return new Vector3d(this.x + b.x, this.y + b.y, this.z + b.z);
        },
        subtract: function(b)
        {
                return new Vector3d(this.x - b.x, this.y - b.y, this.z - b.z);
        },
        multiply: function(scalar)
        {
                return new Vector3d(this.x * scalar, this.y * scalar, this.z * scalar);
        },
        scale: function(b)
        {
                return new Vector3d(this.x * b.x, this.y * b.y, this.z * b.z);
        },
        invert: function(b)
        {
                this.x *= -1;
                this.y *= -1;
                this.z *= -1;
                return this;
        },
        length: function()
        {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        lengthSquared: function()
        {
                return this.x * this.x + this.y * this.y + this.z * this.z;
        },
        normalize: function()
        {
                var l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
                this.x /= l;
                this.y /= l;
                this.z /= l;
                return this;
        },
        getNorm: function()
        {
                var l = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
                var out = new Vector3d(0, 0, 0);
                out.x = this.x/l;
                out.y = this.y/l;
                out.z = this.z/l;
                return out;
        },
        dot: function(b)
        {
                return this.x * b.x + this.y * b.y + this.z * b.z;
        },
        cross: function(b)
        {
                return new Vector3d(this.y * b.z - b.y * this.z,
                        b.x * this.z - this.x * b.z,
                        this.x * b.y - b.x * this.y);
        },
        angleFrom: function(b)
        {
                var dot = this.x * b.x + this.y * b.y + this.z * b.z;
                var mod1 = this.x * this.x + this.y * this.y + this.z * this.z;
                var mod2 = b.x * b.x + b.y * b.y + b.z * b.z;
                var mod = Math.sqrt(mod1) * Math.sqrt(mod2);
                if(mod === 0) return null;
                var theta = dot / mod;
                if(theta < -1) return Math.acos(-1);
                if(theta > 1) return Math.acos(1);
                return Math.acos(theta);
        },
        distanceFrom: function(b)
        {
                var dx = b.x - this.x, dy = b.y - this.y, dz = b.z - this.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },
        rotateX:  function(Theta)
        {
        	var tempX, tempZ;
        	tempY = this.y * Math.cos(Theta) - this.z * Math.sin(Theta);
			tempZ = this.y * Math.sin(Theta) + this.z * Math.cos(Theta);
			this.y = tempY;
			this.z = tempZ;
        },
        rotateY: function(Theta) {
        	var tempX,tempZ;
			tempX = this.x*Math.cos(Theta) - this.z*Math.sin(Theta);
			tempZ =  this.x * Math.sin(Theta) + this.z * Math.cos(Theta);
			this.x = tempX;
			this.z = tempZ;
        },
        rotateZ: function(Theta){
        	var tempX,tempY;
			tempX = this.x * Math.cos(Theta) - this.y * Math.sin(Theta);
			tempY = this.x * Math.sin(Theta) + this.y*Math.cos(Theta);
			this.x = tempX;
			this.y = tempY;
        },
        getRotatedX: function(Theta) {
        	return new Vector3d(this.x, this.y * Math.cos(Theta) - this.z * Math.sin(Theta), this.y * Math.sin(Theta) + this.z * Math.cos(Theta));
        },
       getRotatedY: function(Theta) {
			return new Vector3d(this.x*Math.cos(Theta) - this.z*Math.sin(Theta), this.y, this.x * Math.sin(Theta) + this._ * Math.cos(Theta));
		},
		getRotatedZ: function(Theta) {
			return new Vector3d(this.x * Math.cos(Theta) - this.y * Math.sin(Theta), this.x * Math.sin(Theta) + this.y*Math.cos(Theta), this.z);
		},
        getDisplay:  function (Scrn, wMapCentre, fZoom) {
            var PPM;
            var ScreenCtrX, ScreenCtrY;
            var t1;

            ScreenCtrX = Math.round(Scrn.x/2);
            ScreenCtrY = Math.round(Scrn.y/2);
            //SendMessage ("Ctr:  " + wMapCentre.Lat + ", " + wMapCentre.Long);
            PPM = ScreenCtrY/fZoom;  //Pixels Per Mile


            t1 = this.getRotatedZ(DTOR(-wMapCentre.Long));

            t1.rotateY(DTOR(-wMapCentre.Lat));

            return new Vector2d(Math.round(t1.y * PPM) + ScreenCtrX, ScreenCtrY - Math.round(t1.z * PPM));
    }
        
};

function Vector2d(x, y)
{
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
};

function Polar3d(Lat, Long) {
	this.Lat = Lat !== undefined ? Lat : 0;
	this.Long = Long !== undefined ? Long : 0;
}

Polar3d.prototype =
{
        getDistance: function(g) {
            var c1, c2;
			c1 = Math.sin(DTOR(this.Lat)) * Math.sin(DTOR(g.Lat));
			c2 = Math.cos(DTOR(this.Lat)) * Math.cos(DTOR(g.Lat)) * Math.cos(DTOR(g.Long - this.Long));
			return (RTOD(Math.acos(c1 + c2)) * 60);
        },

        getBearing: function(g) {
         	var c1, c2, c3, c4, c5, tempBearing, Xlat, Xlong, Ylat, Ylong, Distance;
			Distance = this.getDistance(g);
			Ylong = g.Long;
			Ylat = g.Lat;
			Xlong = this.Long;
			Xlat = this.Lat;
			c1 = Math.sin(DTOR(Ylat));
			c2 = Math.sin(DTOR(Xlat)) * Math.cos(DTOR(Distance/60));
			c3 = Math.sin(DTOR(Distance/60)) * Math.cos(DTOR(Xlat));
			c4 = Math.abs((c1-c2)/c3);
			c5 = (c1-c2)/c3;
			if (c4 == 1) c4=0.99999;
			tempBearing = RTOD(Math.acos(c4));
			if ((Xlong == Ylong) && (c5 < 0)) tempBearing = 180;
			else if ((Xlong < Ylong) && (c5 > 0)) tempBearing = tempBearing;
			else if ((Xlong < Ylong) && (c5 < 0)) tempBearing = 180 - tempBearing;
			else if ((Xlong > Ylong) && (c5 < 0)) tempBearing = 180 + tempBearing;
			else if ((Xlong > Ylong) && (c5 > 0)) tempBearing = 360 - tempBearing;
			else tempBearing = tempBearing;
			if (tempBearing > 360) tempBearing = tempBearing - 360;
			return (tempBearing);
        },
        
        getTriple:  function () {
			var Phi, Theta;
            //SendMessage ("This:  " + this.Lat + ", " + this.Long);
			Theta = DTOR(this.Long); //note west longitude is negative
			Phi = DTOR(90 - this.Lat);
			return new Vector3d(EARTH_RADIUS * Math.sin(Phi) * Math.cos(Theta), EARTH_RADIUS * Math.sin(Phi) * Math.sin(Theta), EARTH_RADIUS * Math.cos(Phi));
        },

        getDisplay:  function (Scrn, wMapCentre, fZoom) {
        	var mVector;
			var PPM;
			var ScreenCtrX, ScreenCtrY;
			
			ScreenCtrX = Math.round(Scrn.x/2);
			ScreenCtrY = Math.round(Scrn.y/2);
            //SendMessage ("Ctr:  " + wMapCentre.Lat + ", " + wMapCentre.Long);
			PPM = ScreenCtrY/fZoom;  //Pixels Per Mile 
			//rotate the centre of the map so it is in the centre of the view plane
			mVector = this.getTriple();
            
			mVector.rotateZ(DTOR(-wMapCentre.Long));
            
			mVector.rotateY(DTOR(-wMapCentre.Lat));
            
			return new Vector2d(Math.round(mVector.y * PPM) + ScreenCtrX, ScreenCtrY - Math.round(mVector.z * PPM));
        }
        
};


























