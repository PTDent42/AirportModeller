var color_BUTTONFILL		= "#999999";
var color_BUTTONLINE		= "#ffffff";


function Button(caption) {
        this.caption = caption || "ButtonText";
        this.x = 0;
        this.y = 0;
        this.nWidth = 40;
        this.nHeight = 40;
        this.sName = this.caption;     
}

Button.prototype =
{
        initialize: function(sName, width, height, bGlyph, sImage)
        {
                this.sName = sName || "bButton";
                this.nWidth = width;
                this.nHeight = height;
                this.bGlyph = bGlyph;
                this.sImage = sImage;
                //console.log(this.sImage);
        },
        draw: function(cContext)
        {
                //First draw the fill and outline
                cContext.fillStyle 		= color_BUTTONFILL;
                cContext.strokeStyle	= color_BUTTONLINE;
                cContext.fillRect(this.x, this.y, this.nWidth, this.nHeight);
                cContext.strokeRect(this.x, this.y, this.nWidth, this.nHeight);
                //console.log (this.nWidth);

                if (this.bGlyph){
                	//console.log(this.sImage);
                	cContext.drawImage(this.sImage, this.x, this.y);
                }
                else {
                	//console.log(this.caption);
                	cContext.fillStyle = color_BLACK;
                	cContext.textAlign = "center";
					cContext.textBaseline = "top";
					cContext.font = "18pt Arial";
					cContext.fillText(this.caption, this.x + this.nWidth/2, this.y + 3);
                }
        }
    }

