function fitToContainer(t,n){try{n.width=t.offsetWidth,n.height=t.offsetHeight}catch(t){console.log(t)}}function setContext(n){var t=null;try{(t=n.getContext("2d")).lineWidth=lineWidth,t.strokeStyle=strokeStyle,t.fillStyle=fillStyle,t.font=font}catch(t){console.error(" canvas context not set ",n),console.error(t)}return t}var mainCanvas=document.getElementById("main-canvas"),canvas=document.getElementById("temp-canvas"),context=setContext(mainCanvas),tempContext=setContext(canvas),parentBox=document.getElementById("drawBox");console.log("Main Canvas : ",mainCanvas,context),console.log("Temp Canvas : ",canvas,tempContext),fitToContainer(parentBox,mainCanvas),fitToContainer(parentBox,canvas),document.getElementById("trashBtn")?document.getElementById("trashBtn").onclick=function(){tempContext.clearRect(0,0,canvas.width,canvas.height),console.log(" cleared temp canvas",canvas),context.clearRect(0,0,mainCanvas.width,mainCanvas.height),console.log(" cleared main canvas ",mainCanvas),window.location.reload()}:console.error("trash button not found"),document.getElementById("saveBtn")?document.getElementById("saveBtn").onclick=function(){parent.postMessage({modalpopup:{filetype:"blobcanvas"},sender:selfId},"*")}:console.error("save button not found");var is={isLine:!1,isArc:!1,isDragLastPath:!1,isDragAllPaths:!1,isRectangle:!1,isQuadraticCurve:!1,isBezierCurve:!1,isPencil:!1,isEraser:!1,isText:!1,set:function(t){var n=this;n.isLine=n.isArc=n.isDragLastPath=n.isDragAllPaths=n.isRectangle=n.isQuadraticCurve=n.isBezierCurve=is.isPencil=is.isEraser=is.isText=!1,n["is"+t]=!0}};function addEvent(t,n,e){return t.addEventListener?(t.addEventListener(n,e,!1),!0):t.attachEvent?t.attachEvent("on"+n,e):(t["on"+n]=e,this)}function find(t){return document.getElementById(t)}var points=[],textarea=find("code-text"),lineWidth=2,strokeStyle="#6c96c8",fillStyle="transparent",globalAlpha=1,globalCompositeOperation="source-over",lineCap="butt",font="15px Verdana",lineJoin="miter",common={updateTextArea:function(){var t=common,n=t.toFixed,e=t.getPoint,o=find("is-absolute-points").checked,i=find("is-shorten-code").checked;o&&i&&t.absoluteShortened(),o&&!i&&t.absoluteNOTShortened(n),!o&&i&&t.relativeShortened(n,e),o||i||t.relativeNOTShortened(n,e)},toFixed:function(t){return Number(t).toFixed(1)},getPoint:function(t,n,e){return t=n<t?e+" + "+(t-n):t<n?e+" - "+(n-t):e},absoluteShortened:function(){for(var t,n="",e=points.length,o=0;o<e;o++)t=points[o],n+=this.shortenHelper(t[0],t[1],t[2]);n=n.substr(0,n.length-2),textarea.value="var points = ["+n+"], length = points.length, point, p, i = 0;\n\n"+this.forLoop,this.prevProps=null},absoluteNOTShortened:function(t){var n,e,o,i=[];for(n=0;n<points.length;n++)e=(o=points[n])[1],"pencil"===o[0]&&(i[n]=["context.beginPath();\ncontext.moveTo("+e[0]+", "+e[1]+");\ncontext.lineTo("+e[2]+", "+e[3]+");\n"+this.strokeOrFill(o[2])]),"eraser"===o[0]&&(i[n]=["context.beginPath();\ncontext.moveTo("+e[0]+", "+e[1]+");\ncontext.lineTo("+e[2]+", "+e[3]+");\n"+this.strokeOrFill(o[2])]),"line"===o[0]&&(i[n]=["context.beginPath();\ncontext.moveTo("+e[0]+", "+e[1]+");\ncontext.lineTo("+e[2]+", "+e[3]+");\n"+this.strokeOrFill(o[2])]),"text"===o[0]&&(i[n]=["context.fillText("+e[0]+", "+e[1]+", "+e[2]+");\n"+this.strokeOrFill(o[2])]),"arc"===o[0]&&(i[n]=["context.beginPath(); \ncontext.arc("+t(e[0])+","+t(e[1])+","+t(e[2])+","+t(e[3])+", 0,"+e[4]+"); \n"+this.strokeOrFill(o[2])]),"rect"===o[0]&&(i[n]=[this.strokeOrFill(o[2])+"\ncontext.strokeRect("+e[0]+", "+e[1]+","+e[2]+","+e[3]+");\ncontext.fillRect("+e[0]+", "+e[1]+","+e[2]+","+e[3]+");"]),"quadratic"===o[0]&&(i[n]=["context.beginPath();\ncontext.moveTo("+e[0]+", "+e[1]+");\ncontext.quadraticCurveTo("+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+");\n"+this.strokeOrFill(o[2])]),"bezier"===o[0]&&(i[n]=["context.beginPath();\ncontext.moveTo("+e[0]+", "+e[1]+");\ncontext.bezierCurveTo("+e[2]+", "+e[3]+", "+e[4]+", "+e[5]+", "+e[6]+", "+e[7]+");\n"+this.strokeOrFill(o[2])]);textarea.value=i.join("\n\n")+this.strokeFillText,this.prevProps=null},relativeShortened:function(t,n){for(var e,o,i=0,r=points.length,l="",a=0,s=0;i<r;i++)e=(o=points[i])[1],0===i&&(a=e[0],s=e[1]),"text"===o[0]&&(a=e[1],s=e[2]),"pencil"===o[0]&&(l+=this.shortenHelper(o[0],[n(e[0],a,"x"),n(e[1],s,"y"),n(e[2],a,"x"),n(e[3],s,"y")],o[2])),"eraser"===o[0]&&(l+=this.shortenHelper(o[0],[n(e[0],a,"x"),n(e[1],s,"y"),n(e[2],a,"x"),n(e[3],s,"y")],o[2])),"line"===o[0]&&(l+=this.shortenHelper(o[0],[n(e[0],a,"x"),n(e[1],s,"y"),n(e[2],a,"x"),n(e[3],s,"y")],o[2])),"text"===o[0]&&(l+=this.shortenHelper(o[0],[e[0],n(e[1],a,"x"),n(e[2],s,"y")],o[2])),"arc"===o[0]&&(l+=this.shortenHelper(o[0],[n(e[0],a,"x"),n(e[1],s,"y"),e[2],e[3],e[4]],o[2])),"rect"===o[0]&&(l+=this.shortenHelper(o[0],[n(e[0],a,"x"),n(e[1],s,"y"),n(e[2],a,"x"),n(e[3],s,"y")],o[2])),"quadratic"===o[0]&&(l+=this.shortenHelper(o[0],[n(e[0],a,"x"),n(e[1],s,"y"),n(e[2],a,"x"),n(e[3],s,"y"),n(e[4],a,"x"),n(e[5],s,"y")],o[2])),"bezier"===o[0]&&(l+=this.shortenHelper(o[0],[n(e[0],a,"x"),n(e[1],s,"y"),n(e[2],a,"x"),n(e[3],s,"y"),n(e[4],a,"x"),n(e[5],s,"y"),n(e[6],a,"x"),n(e[7],s,"y")],o[2]));l=l.substr(0,l.length-2),textarea.value="var x = "+a+", y = "+s+", points = ["+l+"], length = points.length, point, p, i = 0;\n\n"+this.forLoop,this.prevProps=null},relativeNOTShortened:function(t,n){var e,o,i,r=points.length,l="",a=0,s=0;for(e=0;e<r;e++)o=(i=points[e])[1],0===e&&(a=o[0],s=o[1],"text"===i[0]&&(a=o[1],s=o[2]),l="var x = "+a+", y = "+s+";\n\n"),"arc"===i[0]&&(l+="context.beginPath();\ncontext.arc("+n(o[0],a,"x")+", "+n(o[1],s,"y")+", "+o[2]+", "+o[3]+", 0, "+o[4]+");\n"+this.strokeOrFill(i[2])),"pencil"===i[0]&&(l+="context.beginPath();\ncontext.moveTo("+n(o[0],a,"x")+", "+n(o[1],s,"y")+");\ncontext.lineTo("+n(o[2],a,"x")+", "+n(o[3],s,"y")+");\n"+this.strokeOrFill(i[2])),"eraser"===i[0]&&(l+="context.beginPath();\ncontext.moveTo("+n(o[0],a,"x")+", "+n(o[1],s,"y")+");\ncontext.lineTo("+n(o[2],a,"x")+", "+n(o[3],s,"y")+");\n"+this.strokeOrFill(i[2])),"line"===i[0]&&(l+="context.beginPath();\ncontext.moveTo("+n(o[0],a,"x")+", "+n(o[1],s,"y")+");\ncontext.lineTo("+n(o[2],a,"x")+", "+n(o[3],s,"y")+");\n"+this.strokeOrFill(i[2])),"text"===i[0]&&(l+="context.fillText("+o[0]+", "+n(o[1],a,"x")+", "+n(o[2],s,"y")+");\n"+this.strokeOrFill(i[2])),"rect"===i[0]&&(l+=this.strokeOrFill(i[2])+"\ncontext.strokeRect("+n(o[0],a,"x")+", "+n(o[1],s,"y")+", "+n(o[2],a,"x")+", "+n(o[3],s,"y")+");\ncontext.fillRect("+n(o[0],a,"x")+", "+n(o[1],s,"y")+", "+n(o[2],a,"x")+", "+n(o[3],s,"y")+");"),"quadratic"===i[0]&&(l+="context.beginPath();\ncontext.moveTo("+n(o[0],a,"x")+", "+n(o[1],s,"y")+");\ncontext.quadraticCurveTo("+n(o[2],a,"x")+", "+n(o[3],s,"y")+", "+n(o[4],a,"x")+", "+n(o[5],s,"y")+");\n"+this.strokeOrFill(i[2])),"bezier"===i[0]&&(l+="context.beginPath();\ncontext.moveTo("+n(o[0],a,"x")+", "+n(o[1],s,"y")+");\ncontext.bezierCurveTo("+n(o[2],a,"x")+", "+n(o[3],s,"y")+", "+n(o[4],a,"x")+", "+n(o[5],s,"y")+", "+n(o[6],a,"x")+", "+n(o[7],s,"y")+");\n"+this.strokeOrFill(i[2])),e!==r-1&&(l+="\n\n");textarea.value=l+this.strokeFillText,this.prevProps=null},forLoop:'for(i; i < length; i++) {\n\t p = points[i];\n\t point = p[1];\n\t context.beginPath();\n\n\t if(p[2]) { \n\t\t context.lineWidth = p[2][0];\n\t\t context.strokeStyle = p[2][1];\n\t\t context.fillStyle = p[2][2];\n\t\t context.globalAlpha = p[2][3];\n\t\t context.globalCompositeOperation = p[2][4];\n\t\t context.lineCap = p[2][5];\n\t\t context.lineJoin = p[2][6];\n\t\t context.font = p[2][7];\n\t }\n\n\t if(p[0] === "line") { \n\t\t context.moveTo(point[0], point[1]);\n\t\t context.lineTo(point[2], point[3]);\n\t }\n\n\t if(p[0] === "pencil") { \n\t\t context.moveTo(point[0], point[1]);\n\t\t context.lineTo(point[2], point[3]);\n\t }\n\n\t if(p[0] === "text") { \n\t\t context.fillText(point[0], point[1], point[2]);\n\t }\n\n\t if(p[0] === "eraser") { \n\t\t context.moveTo(point[0], point[1]);\n\t\t context.lineTo(point[2], point[3]);\n\t }\n\n\t if(p[0] === "arc") context.arc(point[0], point[1], point[2], point[3], 0, point[4]); \n\n\t if(p[0] === "rect") {\n\t\t context.strokeRect(point[0], point[1], point[2], point[3]);\n\t\t context.fillRect(point[0], point[1], point[2], point[3]);\n\t }\n\n\t if(p[0] === "quadratic") {\n\t\t context.moveTo(point[0], point[1]);\n\t\t context.quadraticCurveTo(point[2], point[3], point[4], point[5]);\n\t }\n\n\t if(p[0] === "bezier") {\n\t\t context.moveTo(point[0], point[1]);\n\t\t context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);\n\t }\n\n\t context.stroke();\n\t context.fill();\n}',strokeFillText:"\n\nfunction strokeOrFill(lineWidth, strokeStyle, fillStyle, globalAlpha, globalCompositeOperation, lineCap, lineJoin, font) { \n\t if(lineWidth) { \n\t\t context.globalAlpha = globalAlpha;\n\t\t context.globalCompositeOperation = globalCompositeOperation;\n\t\t context.lineCap = lineCap;\n\t\t context.lineJoin = lineJoin;\n\t\t context.lineWidth = lineWidth;\n\t\t context.strokeStyle = strokeStyle;\n\t\t context.fillStyle = fillStyle;\n\t\t context.font = font;\n\t } \n\n\t context.stroke();\n\t context.fill();\n}",strokeOrFill:function(t){return this.prevProps&&this.prevProps===t.join(",")?"strokeOrFill();":(this.prevProps=t.join(","),'strokeOrFill("'+t.join('", "')+'");')},prevProps:null,shortenHelper:function(t,n,e){var o='["'+t+'", ['+n.join(", ")+"]";return this.prevProps&&this.prevProps===e.join(",")||(this.prevProps=e.join(","),o+=', ["'+e.join('", "')+'"]'),o+"], "}};function endLastPath(){var t=is;t.isArc?arcHandler.end():t.isQuadraticCurve?quadraticHandler.end():t.isBezierCurve&&bezierHandler.end(),drawHelper.redraw()}var isControlKeyPressed,copiedStuff=[];function copy(){endLastPath(),dragHelper.global.startingIndex=0,find("copy-last").checked?(copiedStuff=points[points.length-1],setSelection(find("drag-last-path"),"DragLastPath")):(copiedStuff=points,setSelection(find("drag-all-paths"),"DragAllPaths"))}function paste(){endLastPath(),dragHelper.global.startingIndex=0,find("copy-last").checked?(points[points.length]=copiedStuff,dragHelper.global={prevX:0,prevY:0,startingIndex:points.length-1},dragHelper.dragAllPaths(0,0),setSelection(find("drag-last-path"),"DragLastPath")):(dragHelper.global.startingIndex=points.length,points=points.concat(copiedStuff),setSelection(find("drag-all-paths"),"DragAllPaths"))}
function make_base(e,t){base_image=new Image,base_image.onload=function(){alert(" make base decorator pencil ",e),t.drawImage(base_image,40,40)},base_image.src=e}!function(){var e={},t=/([^&=]+)=?([^&]*)/g;function n(e){return decodeURIComponent(e.replace(/\+/g," "))}for(var l,i=window.location.search;l=t.exec(i.substring(1));)e[n(l[1])]=n(l[2]);window.params=e}();var tools={line:!0,pencil:!0,dragSingle:!0,dragMultiple:!0,eraser:!0,rectangle:!0,arc:!0,bezier:!0,quadratic:!0,text:!0};function setSelection(e,t){endLastPath(),hideContainers(),is.set(t);var n=document.getElementsByClassName("selected-shape")[0];n&&(n.className=n.className.replace(/selected-shape/g,"")),e.className+=" selected-shape"}function hideContainers(){var e=find("additional-container"),t=find("colors-container"),n=find("line-width-container");e.style.display=t.style.display=n.style.display="none"}params.tools&&(tools=JSON.parse(params.tools)),function(){var e,t,n,l,i,a,o,s,d,c,r={},f=find("lineCap-select"),p=find("lineJoin-select");function y(e){var t=find(e).getContext("2d");return t.lineWidth=2,t.strokeStyle="#6c96c8",t}function m(e,t){"Pencil"===t&&(lineCap=lineJoin="round"),params.selectedIcon?(params.selectedIcon=params.selectedIcon.split("")[0].toUpperCase()+params.selectedIcon.replace(params.selectedIcon.split("").shift(1),""),params.selectedIcon===t&&is.set(params.selectedIcon)):is.set("Pencil"),addEvent(e.canvas,"click",function(){dragHelper.global.startingIndex=0,setSelection(this,t),"drag-last-path"===this.id?(find("copy-last").checked=!0,find("copy-all").checked=!1):"drag-all-paths"===this.id&&(find("copy-all").checked=!0,find("copy-last").checked=!1),"pencil-icon"===this.id||"eraser-icon"===this.id?(r.lineCap=lineCap,r.lineJoin=lineJoin,lineCap=lineJoin="round"):r.lineCap&&r.lineJoin&&(lineCap=r.lineCap,lineJoin=r.lineJoin),"eraser-icon"===this.id?(r.strokeStyle=strokeStyle,r.fillStyle=fillStyle,r.lineWidth=lineWidth,strokeStyle="White",fillStyle="White",lineWidth=10):r.strokeStyle&&r.fillStyle&&void 0!==r.lineWidth&&(strokeStyle=r.strokeStyle,fillStyle=r.fillStyle,lineWidth=r.lineWidth)})}find("tool-box").style.height="100%",!0===tools.dragSingle?function(){var e,t,n=y("drag-last-path"),l=10,i="line",a=[[i,l,6,15,33],[i,l,6,28,25],[i,27,25,19,26],[i,19,26,15,33],[i,26,28,26,37],[i,22,33,30,33]],o=a.length;for(t=0;t<o;t++)"line"===(e=a[t])[0]&&(n.beginPath(),n.moveTo(e[1],e[2]),n.lineTo(e[3],e[4]),n.closePath(),n.stroke());n.fillStyle="Gray",n.font="9px Verdana",n.fillText("Last",18,12),m(n,"DragLastPath")}():document.getElementById("drag-last-path").style.display="none",!0===tools.dragMultiple?function(){var e,t,n=y("drag-all-paths"),l=10,i="line",a=[[i,l,6,15,33],[i,l,6,28,25],[i,27,25,19,26],[i,19,26,15,33],[i,26,28,26,37],[i,22,33,30,33]],o=a.length;for(t=0;t<o;t++)"line"===(e=a[t])[0]&&(n.beginPath(),n.moveTo(e[1],e[2]),n.lineTo(e[3],e[4]),n.closePath(),n.stroke());n.fillStyle="Gray",n.font="10px Verdana",n.fillText("All",20,12),m(n,"DragAllPaths")}():document.getElementById("drag-all-paths").style.display="none",!0===tools.line?((e=y("line")).moveTo(0,0),e.lineTo(40,40),e.stroke(),e.fillStyle="Gray",e.font="9px Verdana",e.fillText("Line",16,12),m(e,"Line")):document.getElementById("line").style.display="none",!0===tools.pencil?(t=document.getElementById("pencil-icon").getContext("2d"),(n=new Image).src="drawboardicons/pencil.png",n.onload=function(){t.drawImage(n,0,0,35,35)},m(t,"Pencil")):document.getElementById("pencil-icon").style.display="none",!0===tools.eraser?(l=document.getElementById("eraser-icon").getContext("2d"),(i=new Image).src="drawboardicons/eraser.png",i.onload=function(){l.drawImage(i,0,0,35,35)},m(l,"Eraser")):document.getElementById("eraser-icon").style.display="none",!0===tools.text?((a=y("text-icon")).font="22px Verdana",a.strokeText("T",15,30),m(a,"Text")):document.getElementById("text-icon").style.display="none",!0===tools.arc?((o=y("arc")).arc(20,20,16.3,2*Math.PI,0,1),o.stroke(),o.fillStyle="Gray",o.font="9px Verdana",o.fillText("Arc",10,24),m(o,"Arc")):document.getElementById("arc").style.display="none",!0===tools.rectangle?((s=y("rectangle")).strokeRect(5,5,30,30),s.fillStyle="Gray",s.font="9px Verdana",s.fillText("Rect",8,24),m(s,"Rectangle")):document.getElementById("rectangle").style.display="none",!0===tools.quadratic?((d=y("quadratic-curve")).moveTo(0,0),d.quadraticCurveTo(50,10,30,40),d.stroke(),d.fillStyle="Gray",d.font="9px Verdana",d.fillText("quad..",2,24),m(d,"QuadraticCurve")):document.getElementById("quadratic-curve").style.display="none",!0===tools.bezier?((c=y("bezier-curve")).moveTo(0,4),c.bezierCurveTo(86,20,-45,28,48,38),c.stroke(),c.fillStyle="Gray",c.font="9px Verdana",c.fillText("Bezier",10,8),m(c,"BezierCurve")):document.getElementById("bezier-curve").style.display="none",function(){var e=document.getElementById("line-width").getContext("2d"),t=new Image;t.src="drawboardicons/linesize.png",t.onload=function(){e.drawImage(t,0,0,35,35)};var n=find("line-width-container"),l=find("line-width-text"),i=find("line-width-done"),a=(document.getElementsByTagName("h1")[0],e.canvas);addEvent(a,"click",function(){hideContainers(),n.style.display="block",n.style.top=a.offsetTop+1+"px",n.style.left=a.offsetLeft+a.clientWidth+"px",l.focus()}),addEvent(i,"click",function(){n.style.display="none",lineWidth=l.value})}(),function(){var e=document.getElementById("colors").getContext("2d"),t=new Image;t.src="drawboardicons/color.png",t.onload=function(){e.drawImage(t,0,0,35,35)};var n=find("colors-container"),l=find("stroke-style"),i=find("fill-style"),a=find("colors-done"),o=(document.getElementsByTagName("h1")[0],e.canvas);addEvent(o,"click",function(){hideContainers(),n.style.display="block",n.style.top=o.offsetTop+1+"px",n.style.left=o.offsetLeft+o.clientWidth+"px",l.focus()}),addEvent(a,"click",function(){n.style.display="none",strokeStyle=l.value,fillStyle=i.value})}(),function(){var e=y("additional");e.fillStyle="#6c96c8",e.font="35px Verdana",e.fillText("»",10,27),e.fillStyle="Gray",e.font="9px Verdana",e.fillText("Extras!",2,38);var t=find("additional-container"),n=find("additional-close"),l=(document.getElementsByTagName("h1")[0],e.canvas),i=find("globalAlpha-select"),a=find("globalCompositeOperation-select");addEvent(l,"click",function(){hideContainers(),t.style.display="block",t.style.top=l.offsetTop+1+"px",t.style.left=l.offsetLeft+l.clientWidth+"px"}),addEvent(n,"click",function(){t.style.display="none",globalAlpha=i.value,globalCompositeOperation=a.value,lineCap=f.value,lineJoin=p.value})}();var g=find("design-preview"),u=find("code-preview");function h(){x.parentNode.style.display="none",k.style.display="none",hideContainers(),endLastPath()}function v(){x.parentNode.style.display="block",k.style.display="block",x.focus(),common.updateTextArea(),x.style.width=innerWidth-k.clientWidth-30+"px",x.style.height=innerHeight-40+"px",x.style.marginLeft=k.clientWidth+"px",k.style.height=innerHeight+"px",hideContainers(),endLastPath()}window.selectBtn=function(e,t){u.className=g.className="",e==g?g.className="preview-selected":u.className="preview-selected",!t&&window.connection&&1<=connection.numberOfConnectedUsers?connection.send({btnSelected:e.id}):e==g?h():v()},addEvent(g,"click",function(){selectBtn(g),h()}),addEvent(u,"click",function(){selectBtn(u),v()});var x=find("code-text"),k=find("options-container");var I=find("is-absolute-points"),b=find("is-shorten-code");addEvent(b,"change",common.updateTextArea),addEvent(I,"change",common.updateTextArea)}();
var drawHelper={redraw:function(t){tempContext.clearRect(0,0,innerWidth,innerHeight),context.clearRect(0,0,innerWidth,innerHeight);var e,i,n=points.length;for(e=0;e<n;e++)this[(i=points[e])[0]](context,i[1],i[2]);t||syncPoints()},getOptions:function(){return[lineWidth,strokeStyle,fillStyle,globalAlpha,globalCompositeOperation,lineCap,lineJoin,font]},handleOptions:function(t,e,i){e=e||this.getOptions(),t.globalAlpha=e[3],t.globalCompositeOperation=e[4],t.lineCap=e[5],t.lineJoin=e[6],t.lineWidth=e[0],t.strokeStyle=e[1],t.fillStyle=e[2],i||(t.stroke(),t.fill())},line:function(t,e,i){t.beginPath(),t.moveTo(e[0],e[1]),t.lineTo(e[2],e[3]),this.handleOptions(t,i)},text:function(t,e,i){var n=fillStyle;t.fillStyle="transparent"===fillStyle||"White"===fillStyle?"Black":fillStyle,t.font="15px Verdana",t.fillText(e[0].substr(1,e[0].length-2),e[1],e[2]),fillStyle=n,this.handleOptions(t,i)},arc:function(t,e,i){t.beginPath(),t.arc(e[0],e[1],e[2],e[3],0,e[4]),this.handleOptions(t,i)},rect:function(t,e,i){this.handleOptions(t,i,!0),t.strokeRect(e[0],e[1],e[2],e[3]),t.fillRect(e[0],e[1],e[2],e[3])},quadratic:function(t,e,i){t.beginPath(),t.moveTo(e[0],e[1]),t.quadraticCurveTo(e[2],e[3],e[4],e[5]),this.handleOptions(t,i)},bezier:function(t,e,i){t.beginPath(),t.moveTo(e[0],e[1]),t.bezierCurveTo(e[2],e[3],e[4],e[5],e[6],e[7]),this.handleOptions(t,i)}};
var dragHelper={global:{prevX:0,prevY:0,ismousedown:!1,pointsToMove:"all",startingIndex:0},mousedown:function(t){isControlKeyPressed&&(copy(),paste(),isControlKeyPressed=!1);var n=dragHelper,o=n.global,e=t.pageX-canvas.offsetLeft,i=t.pageY-canvas.offsetTop;if(o.prevX=e,o.prevY=i,o.pointsToMove="all",points.length){var s=points[points.length-1],a=s[1];"line"===s[0]&&(n.isPointInPath(e,i,a[0],a[1])&&(o.pointsToMove="head"),n.isPointInPath(e,i,a[2],a[3])&&(o.pointsToMove="tail")),"rect"===s[0]&&n.isPointInPath(e,i,a[0]+a[2],a[1]+a[3])&&(o.pointsToMove="stretch"),"quadratic"===s[0]&&(n.isPointInPath(e,i,a[0],a[1])&&(o.pointsToMove="starting-points"),n.isPointInPath(e,i,a[2],a[3])&&(o.pointsToMove="control-points"),n.isPointInPath(e,i,a[4],a[5])&&(o.pointsToMove="ending-points")),"bezier"===s[0]&&(n.isPointInPath(e,i,a[0],a[1])&&(o.pointsToMove="starting-points"),n.isPointInPath(e,i,a[2],a[3])&&(o.pointsToMove="1st-control-points"),n.isPointInPath(e,i,a[4],a[5])&&(o.pointsToMove="2nd-control-points"),n.isPointInPath(e,i,a[6],a[7])&&(o.pointsToMove="ending-points"))}o.ismousedown=!0},mouseup:function(){var t=this.global;is.isDragLastPath&&(tempContext.clearRect(0,0,innerWidth,innerHeight),context.clearRect(0,0,innerWidth,innerHeight),this.end()),t.ismousedown=!1},mousemove:function(t){var n=t.pageX-canvas.offsetLeft,o=t.pageY-canvas.offsetTop,e=this.global;drawHelper.redraw(),e.ismousedown&&this.dragShape(n,o),is.isDragLastPath&&this.init()},init:function(){if(points.length){var t=points[points.length-1],n=t[1];this.global.ismousedown?tempContext.fillStyle="rgba(255,85 ,154,.9)":tempContext.fillStyle="rgba(255,85 ,154,.4)","quadratic"===t[0]&&(tempContext.beginPath(),tempContext.arc(n[0],n[1],10,2*Math.PI,0,!1),tempContext.arc(n[2],n[3],10,2*Math.PI,0,!1),tempContext.arc(n[4],n[5],10,2*Math.PI,0,!1),tempContext.fill()),"bezier"===t[0]&&(tempContext.beginPath(),tempContext.arc(n[0],n[1],10,2*Math.PI,0,!1),tempContext.arc(n[2],n[3],10,2*Math.PI,0,!1),tempContext.arc(n[4],n[5],10,2*Math.PI,0,!1),tempContext.arc(n[6],n[7],10,2*Math.PI,0,!1),tempContext.fill()),"line"===t[0]&&(tempContext.beginPath(),tempContext.arc(n[0],n[1],10,2*Math.PI,0,!1),tempContext.arc(n[2],n[3],10,2*Math.PI,0,!1),tempContext.fill()),"text"===t[0]&&(tempContext.font="15px Verdana",tempContext.fillText(n[0],n[1],n[2])),"rect"===t[0]&&(tempContext.beginPath(),tempContext.arc(n[0]+n[2],n[1]+n[3],10,2*Math.PI,0,!1),tempContext.fill())}},isPointInPath:function(t,n,o,e){return o-10<t&&t<o+10&&e-10<n&&n<e+10},getPoint:function(t,n,o){return t=n<t?o+(t-n):o-(n-t)},dragShape:function(t,n){if(this.global.ismousedown){tempContext.clearRect(0,0,innerWidth,innerHeight),is.isDragLastPath&&this.dragLastPath(t,n),is.isDragAllPaths&&this.dragAllPaths(t,n);var o=this.global;o.prevX=t,o.prevY=n}},end:function(){if(points.length){tempContext.clearRect(0,0,innerWidth,innerHeight);var t=points[points.length-1];drawHelper[t[0]](context,t[1],t[2])}},dragAllPaths:function(t,n){for(var o,e,i=this.global,s=i.prevX,a=i.prevY,p=points.length,r=this.getPoint,l=i.startingIndex;l<p;l++)e=(o=points[l])[1],"line"===o[0]&&(points[l]=[o[0],[r(t,s,e[0]),r(n,a,e[1]),r(t,s,e[2]),r(n,a,e[3])],o[2]]),"text"===o[0]&&(points[l]=[o[0],[e[0],r(t,s,e[1]),r(n,a,e[2])],o[2]]),"arc"===o[0]&&(points[l]=[o[0],[r(t,s,e[0]),r(n,a,e[1]),e[2],e[3],e[4]],o[2]]),"rect"===o[0]&&(points[l]=[o[0],[r(t,s,e[0]),r(n,a,e[1]),e[2],e[3]],o[2]]),"quadratic"===o[0]&&(points[l]=[o[0],[r(t,s,e[0]),r(n,a,e[1]),r(t,s,e[2]),r(n,a,e[3]),r(t,s,e[4]),r(n,a,e[5])],o[2]]),"bezier"===o[0]&&(points[l]=[o[0],[r(t,s,e[0]),r(n,a,e[1]),r(t,s,e[2]),r(n,a,e[3]),r(t,s,e[4]),r(n,a,e[5]),r(t,s,e[6]),r(n,a,e[7])],o[2]])},dragLastPath:function(t,n){var o=this.global,e=o.prevX,i=o.prevY,s=points[points.length-1],a=s[1],p=this.getPoint,r="all"===o.pointsToMove;"line"===s[0]&&(("head"===o.pointsToMove||r)&&(a[0]=p(t,e,a[0]),a[1]=p(n,i,a[1])),("tail"===o.pointsToMove||r)&&(a[2]=p(t,e,a[2]),a[3]=p(n,i,a[3])),points[points.length-1]=[s[0],a,s[2]]),"text"===s[0]&&(("head"===o.pointsToMove||r)&&(a[1]=p(t,e,a[1]),a[2]=p(n,i,a[2])),points[points.length-1]=[s[0],a,s[2]]),"arc"===s[0]&&(a[0]=p(t,e,a[0]),a[1]=p(n,i,a[1]),points[points.length-1]=[s[0],a,s[2]]),"rect"===s[0]&&(r&&(a[0]=p(t,e,a[0]),a[1]=p(n,i,a[1])),"stretch"===o.pointsToMove&&(a[2]=p(t,e,a[2]),a[3]=p(n,i,a[3])),points[points.length-1]=[s[0],a,s[2]]),"quadratic"===s[0]&&(("starting-points"===o.pointsToMove||r)&&(a[0]=p(t,e,a[0]),a[1]=p(n,i,a[1])),("control-points"===o.pointsToMove||r)&&(a[2]=p(t,e,a[2]),a[3]=p(n,i,a[3])),("ending-points"===o.pointsToMove||r)&&(a[4]=p(t,e,a[4]),a[5]=p(n,i,a[5])),points[points.length-1]=[s[0],a,s[2]]),"bezier"===s[0]&&(("starting-points"===o.pointsToMove||r)&&(a[0]=p(t,e,a[0]),a[1]=p(n,i,a[1])),("1st-control-points"===o.pointsToMove||r)&&(a[2]=p(t,e,a[2]),a[3]=p(n,i,a[3])),("2nd-control-points"===o.pointsToMove||r)&&(a[4]=p(t,e,a[4]),a[5]=p(n,i,a[5])),("ending-points"===o.pointsToMove||r)&&(a[6]=p(t,e,a[6]),a[7]=p(n,i,a[7])),points[points.length-1]=[s[0],a,s[2]])}};
var pencilHandler={ismousedown:!1,prevX:0,prevY:0,mousedown:function(e){var p=e.pageX-canvas.offsetLeft,n=e.pageY-canvas.offsetTop,o=this;o.prevX=p,o.prevY=n,o.ismousedown=!0,tempContext.lineCap="round",drawHelper.line(tempContext,[o.prevX,o.prevY,p,n]),points[points.length]=["line",[o.prevX,o.prevY,p,n],drawHelper.getOptions()],o.prevX=p,o.prevY=n},mouseup:function(e){this.ismousedown=!1},mousemove:function(e){var p=e.pageX-canvas.offsetLeft,n=e.pageY-canvas.offsetTop,o=this;o.ismousedown&&(tempContext.lineCap="round",drawHelper.line(tempContext,[o.prevX,o.prevY,p,n]),points[points.length]=["line",[o.prevX,o.prevY,p,n],drawHelper.getOptions()],o.prevX=p,o.prevY=n)}};
var eraserHandler={ismousedown:!1,prevX:0,prevY:0,mousedown:function(e){var p=e.pageX-canvas.offsetLeft,n=e.pageY-canvas.offsetTop,o=this;o.prevX=p,o.prevY=n,o.ismousedown=!0,tempContext.lineCap="round",drawHelper.line(tempContext,[o.prevX,o.prevY,p,n]),points[points.length]=["line",[o.prevX,o.prevY,p,n],drawHelper.getOptions()],o.prevX=p,o.prevY=n},mouseup:function(e){this.ismousedown=!1},mousemove:function(e){var p=e.pageX-canvas.offsetLeft,n=e.pageY-canvas.offsetTop,o=this;o.ismousedown&&(tempContext.lineCap="round",drawHelper.line(tempContext,[o.prevX,o.prevY,p,n]),points[points.length]=["line",[o.prevX,o.prevY,p,n],drawHelper.getOptions()],o.prevX=p,o.prevY=n)}};
var lineHandler={ismousedown:!1,prevX:0,prevY:0,mousedown:function(e){var n=e.pageX-canvas.offsetLeft,o=e.pageY-canvas.offsetTop,s=this;s.prevX=n,s.prevY=o,s.ismousedown=!0},mouseup:function(e){var n=e.pageX-canvas.offsetLeft,o=e.pageY-canvas.offsetTop,s=this;s.ismousedown&&(points[points.length]=["line",[s.prevX,s.prevY,n,o],drawHelper.getOptions()],s.ismousedown=!1)},mousemove:function(e){var n=e.pageX-canvas.offsetLeft,o=e.pageY-canvas.offsetTop,s=this;s.ismousedown&&(tempContext.clearRect(0,0,innerWidth,innerHeight),drawHelper.line(tempContext,[s.prevX,s.prevY,n,o]))}};
var rectHandler={ismousedown:!1,prevX:0,prevY:0,mousedown:function(e){var o=e.pageX-canvas.offsetLeft,t=e.pageY-canvas.offsetTop,s=this;s.prevX=o,s.prevY=t,s.ismousedown=!0},mouseup:function(e){var o=e.pageX-canvas.offsetLeft,t=e.pageY-canvas.offsetTop,s=this;s.ismousedown&&(points[points.length]=["rect",[s.prevX,s.prevY,o-s.prevX,t-s.prevY],drawHelper.getOptions()],s.ismousedown=!1)},mousemove:function(e){var o=e.pageX-canvas.offsetLeft,t=e.pageY-canvas.offsetTop,s=this;s.ismousedown&&(tempContext.clearRect(0,0,innerWidth,innerHeight),drawHelper.rect(tempContext,[s.prevX,s.prevY,o-s.prevX,t-s.prevY]))}};
var keyCode,selfId=parent.selfuserid,isTouch="createTouch"in document;function onkeydown(e){keyCode=e.keyCode,isControlKeyPressed||17!==keyCode||(isControlKeyPressed=!0)}function onkeyup(e){keyCode=e.keyCode,isControlKeyPressed&&90===keyCode&&points.length&&(points.length=points.length-1,drawHelper.redraw()),isControlKeyPressed&&65===keyCode&&(dragHelper.global.startingIndex=0,endLastPath(),setSelection(find("drag-all-paths"),"DragAllPaths")),isControlKeyPressed&&67===keyCode&&points.length&&copy(),isControlKeyPressed&&86===keyCode&&copiedStuff.length&&paste(),17===keyCode&&(isControlKeyPressed=!1)}addEvent(canvas,isTouch?"touchstart":"mousedown",function(e){isTouch&&(e=e.pageX?e:e.touches.length?e.touches[0]:{pageX:0,pageY:0});var s=is;if(console.log(" canvas coordinates x ->",e.pageX,"||",canvas.offsetLeft),console.log(" canvas coordinates y ->",e.pageY," ||",canvas.offsetTop),s.isLine)lineHandler.mousedown(e);else if(s.isArc)arcHandler.mousedown(e);else if(s.isRectangle)rectHandler.mousedown(e);else if(s.isQuadraticCurve)quadraticHandler.mousedown(e);else if(s.isBezierCurve)bezierHandler.mousedown(e);else if(s.isDragLastPath||s.isDragAllPaths)dragHelper.mousedown(e);else if(is.isPencil)pencilHandler.mousedown(e);else if(is.isEraser)eraserHandler.mousedown(e);else{if(!is.isText)return void console.log(" none of the event matched ");textHandler.mousedown(e)}drawHelper.redraw()}),addEvent(canvas,isTouch?"touchend":"mouseup",function(e){isTouch&&(e=e.pageX?e:e.touches.length?e.touches[0]:{pageX:0,pageY:0});var s=is;s.isLine?lineHandler.mouseup(e):s.isArc?arcHandler.mouseup(e):s.isRectangle?rectHandler.mouseup(e):s.isQuadraticCurve?quadraticHandler.mouseup(e):s.isBezierCurve?bezierHandler.mouseup(e):s.isDragLastPath||s.isDragAllPaths?dragHelper.mouseup(e):is.isPencil?pencilHandler.mouseup(e):is.isEraser?eraserHandler.mouseup(e):is.isText&&textHandler.mouseup(e),drawHelper.redraw()}),addEvent(canvas,isTouch?"touchmove":"mousemove",function(e){isTouch&&(e=e.pageX?e:e.touches.length?e.touches[0]:{pageX:0,pageY:0});var s=is;s.isLine?lineHandler.mousemove(e):s.isArc?arcHandler.mousemove(e):s.isRectangle?rectHandler.mousemove(e):s.isQuadraticCurve?quadraticHandler.mousemove(e):s.isBezierCurve?bezierHandler.mousemove(e):s.isDragLastPath||s.isDragAllPaths?dragHelper.mousemove(e):is.isPencil?pencilHandler.mousemove(e):is.isEraser?eraserHandler.mousemove(e):is.isText&&textHandler.mousemove(e)}),addEvent(document,"keydown",onkeydown),addEvent(document,"keyup",onkeyup);var lastPoint=[];function syncPoints(){lastPoint.length||(lastPoint=points.join("")),points.join("")!=lastPoint&&(syncData(points||[]),lastPoint=points.join(""))}function syncData(e){parent.postMessage({canvasDesignerSyncData:e,sender:selfId},"*")}window.addEventListener("message",function(e){console.log(" window message",e),e.data&&e.data.canvasDesignerSyncData&&(e.data.sender&&e.data.sender==selfId||(points=e.data.canvasDesignerSyncData,lastPoint.length||(lastPoint=points.join("")),drawHelper.redraw(!0)))},!1);