$(document).ready(function() {
  var canvas = document.getElementById('courtCanvas');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }
  var ctx = canvas.getContext('2d');
  var elements = [];
  var currentTool = 'player';
  var currentColor = '#dc3545';
  var currentTeam = 'teamA';
  var currentNumber = 1;
  var drawing = false;
  var startX = 0;
  var startY = 0;
  var previewElement = null;
  
  // Store current court configuration with responsive sizing
  var currentCourtConfig = {
    courtType: 'full',
    canvasWidth: 1200,
    canvasHeight: 700,
    courtWidth: 1000,
    courtHeight: 600
  };

  // Responsive canvas sizing
  function getResponsiveCanvasSize(courtType) {
    var container = $('.canvas-container');
    var containerWidth = container.width() - 40; // Account for padding
    var containerHeight = container.height() - 40;
    
    // Base dimensions for different court types
    var baseDimensions = {
      full: { width: 1200, height: 700, courtWidth: 1000, courtHeight: 600 },
      half: { width: 800, height: 700, courtWidth: 600, courtHeight: 600 }
    };
    
    var base = baseDimensions[courtType];
    var aspectRatio = base.width / base.height;
    
    // Calculate size that fits in container while maintaining aspect ratio
    var canvasWidth, canvasHeight;
    
    if (containerWidth / containerHeight > aspectRatio) {
      // Container is wider than needed - limit by height
      canvasHeight = Math.min(containerHeight, base.height);
      canvasWidth = canvasHeight * aspectRatio;
    } else {
      // Container is taller than needed - limit by width
      canvasWidth = Math.min(containerWidth, base.width);
      canvasHeight = canvasWidth / aspectRatio;
    }
    
    // Ensure minimum sizes for usability
    var minWidth = 400;
    var minHeight = 300;
    
    if (canvasWidth < minWidth) {
      canvasWidth = minWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }
    
    if (canvasHeight < minHeight) {
      canvasHeight = minHeight;
      canvasWidth = canvasHeight * aspectRatio;
    }
    
    // Calculate court size proportionally
    var scale = canvasWidth / base.width;
    var courtWidth = base.courtWidth * scale;
    var courtHeight = base.courtHeight * scale;
    
    return {
      canvasWidth: Math.round(canvasWidth),
      canvasHeight: Math.round(canvasHeight),
      courtWidth: Math.round(courtWidth),
      courtHeight: Math.round(courtHeight)
    };
  }

  // Get accurate mouse/touch coordinates accounting for canvas scaling
  function getEventCoordinates(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    
    var clientX, clientY;
    
    // Handle both mouse and touch events
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    var x = (clientX - rect.left) * scaleX;
    var y = (clientY - rect.top) * scaleY;
    
    return { x: x, y: y };
  }
  
  // Tool selection - with debugging and highlighting
  $('.tool-tile').click(function() {
    $('.tool-tile').removeClass('active');
    $(this).addClass('active');
    currentTool = $(this).data('tool');
    console.log('Tool selected:', currentTool);
    Shiny.setInputValue('currentTool', currentTool);
    updateCursor();
    
    // Highlight the players section when number tool is selected
    if (currentTool === 'number') {
      $('.players-group').addClass('highlight');
    } else {
      $('.players-group').removeClass('highlight');
    }
  });
  
  // Color selection
  $('.color-tile').click(function() {
    $('.color-tile').removeClass('active');
    $(this).addClass('active');
    currentColor = $(this).data('color');
    if ($(this).data('team')) {
      currentTeam = $(this).data('team');
    }
    Shiny.setInputValue('currentColor', currentColor);
    Shiny.setInputValue('currentTeam', currentTeam);
  });
  
  // Number selection for numbers tool
  $('.number-tile').click(function() {
    $('.number-tile').removeClass('active');
    $(this).addClass('active');
    currentNumber = parseInt($(this).data('number'));
    console.log('Number selected:', currentNumber);
  });
  
  function updateCursor() {
    switch(currentTool) {
      case 'player':
      case 'cross':
      case 'triangle':
      case 'number':
      case 'ball':
        canvas.style.cursor = 'pointer';
        break;
      case 'arrow':
      case 'line':
      case 'dotted-line':
      case 'dotted-arrow':
      case 'curve':
      case 'dotted-curve':
      case 'line-with-stops':
      case 'dotted-line-with-stops':
      case 'squiggly-arrow':
      case 'dotted-squiggly-arrow':
        canvas.style.cursor = 'crosshair';
        break;
      case 'circle':
        canvas.style.cursor = 'crosshair';
        break;
      default:
        canvas.style.cursor = 'crosshair';
    }
  }
  
  // Initialize court with responsive sizing
  Shiny.addCustomMessageHandler('initCourt', function(data) {
    var responsiveSize = getResponsiveCanvasSize(data.courtType);
    
    currentCourtConfig = {
      courtType: data.courtType,
      canvasWidth: responsiveSize.canvasWidth,
      canvasHeight: responsiveSize.canvasHeight,
      courtWidth: responsiveSize.courtWidth,
      courtHeight: responsiveSize.courtHeight
    };
    
    // Set canvas internal dimensions
    canvas.width = responsiveSize.canvasWidth;
    canvas.height = responsiveSize.canvasHeight;
    
    // Set canvas display size via CSS (this allows for responsive behavior)
    canvas.style.width = responsiveSize.canvasWidth + 'px';
    canvas.style.height = responsiveSize.canvasHeight + 'px';
    
    drawCourt(data.courtType, responsiveSize.courtWidth, responsiveSize.courtHeight);
    
    // Re-bind event listeners after canvas is reinitialized
    setupCanvasEvents();
  });

  // Handle window resize
  function handleResize() {
    if (currentCourtConfig.courtType) {
      var responsiveSize = getResponsiveCanvasSize(currentCourtConfig.courtType);
      
      // Store the scale ratio for element repositioning
      var scaleX = responsiveSize.canvasWidth / currentCourtConfig.canvasWidth;
      var scaleY = responsiveSize.canvasHeight / currentCourtConfig.canvasHeight;
      
      // Scale existing elements
      elements.forEach(function(element) {
        if (element.x !== undefined) {
          element.x *= scaleX;
          element.y *= scaleY;
        }
        if (element.startX !== undefined) {
          element.startX *= scaleX;
          element.startY *= scaleY;
          element.endX *= scaleX;
          element.endY *= scaleY;
        }
      });
      
      // Update court configuration
      currentCourtConfig.canvasWidth = responsiveSize.canvasWidth;
      currentCourtConfig.canvasHeight = responsiveSize.canvasHeight;
      currentCourtConfig.courtWidth = responsiveSize.courtWidth;
      currentCourtConfig.courtHeight = responsiveSize.courtHeight;
      
      // Update canvas
      canvas.width = responsiveSize.canvasWidth;
      canvas.height = responsiveSize.canvasHeight;
      canvas.style.width = responsiveSize.canvasWidth + 'px';
      canvas.style.height = responsiveSize.canvasHeight + 'px';
      
      redrawAll();
    }
  }

  // Debounced resize handler
  var resizeTimeout;
  $(window).resize(function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 250);
  });
  
  function redrawAll() {
    drawCourt(currentCourtConfig.courtType, currentCourtConfig.courtWidth, currentCourtConfig.courtHeight);
  }
  
  // Draw basketball court with accurate dimensions
  function drawCourt(courtType, courtWidth, courtHeight) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    var courtX = (canvas.width - courtWidth) / 2;
    var courtY = (canvas.height - courtHeight) / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(courtX, courtY, courtWidth, courtHeight);
    
    ctx.save();
    ctx.translate(courtX, courtY);
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    ctx.strokeRect(0, 0, courtWidth, courtHeight);
    
    if(courtType === 'full') {
      drawFullCourt(courtWidth, courtHeight);
    } else {
      drawHalfCourt(courtWidth, courtHeight);
    }
    
    ctx.restore();
    
    elements.forEach(function(element) {
      drawElement(element);
    });
    
    if(previewElement) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      drawElement(previewElement);
      ctx.restore();
    }
  }
  
  function drawFullCourt(courtWidth, courtHeight) {
    var scaleX = courtWidth / 94;
    var scaleY = courtHeight / 50;
    
    ctx.beginPath();
    ctx.moveTo(courtWidth / 2, 0);
    ctx.lineTo(courtWidth / 2, courtHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(courtWidth / 2, courtHeight / 2, 6 * scaleY, 0, Math.PI * 2);
    ctx.stroke();
    
    drawCourtEnd(5.25 * scaleX, courtHeight / 2, 'left', scaleX, scaleY, courtWidth, courtHeight);
    drawCourtEnd(courtWidth - 5.25 * scaleX, courtHeight / 2, 'right', scaleX, scaleY, courtWidth, courtHeight);
  }

  function drawHalfCourt(courtWidth, courtHeight) {
    var scaleX = courtWidth / 47;
    var scaleY = courtHeight / 50;
    
    ctx.beginPath();
    ctx.arc(0, courtHeight / 2, 6 * scaleY, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    
    drawCourtEnd(courtWidth - 5.25 * scaleX, courtHeight / 2, 'right', scaleX, scaleY, courtWidth, courtHeight);
  }

  function drawCourtEnd(basketX, basketY, side, scaleX, scaleY, courtWidth, courtHeight) {
    var dir = (side === 'left') ? 1 : -1;
    var baselineX = (side === 'left') ? 0 : courtWidth;
    
    ctx.fillStyle = '#f2bc0a';
    ctx.beginPath();
    ctx.arc(basketX, basketY, 0.75 * scaleY, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    var backboardHalf = 3 * scaleY;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(basketX - dir * scaleX, basketY - backboardHalf);
    ctx.lineTo(basketX - dir * scaleX, basketY + backboardHalf);
    ctx.stroke();
    ctx.lineWidth = 2;
    
    var laneWidth = 16 * scaleY;
    var laneLength = 19 * scaleX;
    if (side === 'left') {
        ctx.strokeRect(baselineX, basketY - laneWidth / 2, laneLength, laneWidth);
    } else {
        ctx.strokeRect(baselineX - laneLength, basketY - laneWidth / 2, laneLength, laneWidth);
    }
    
    var ftX = baselineX + dir * laneLength;
    var radius = 6 * scaleY;
    var arcStart = (side === 'left') ? Math.PI / 2 : -Math.PI / 2;
    var arcEnd = (side === 'left') ? -Math.PI / 2 : Math.PI / 2;
    
    ctx.beginPath();
    ctx.arc(ftX, basketY, radius, arcEnd, arcStart);
    ctx.stroke();
    
    ctx.setLineDash([radius * 0.3, radius * 0.3]);
    ctx.beginPath();
    ctx.arc(ftX, basketY, radius, arcStart, arcEnd);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Three-point line
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    
    var threePtRadius = 23.75 * scaleY;
    var cornerFromSideline = 3 * scaleY;
    
    var topCornerY = cornerFromSideline;
    var bottomCornerY = courtHeight - cornerFromSideline;
    
    var yDistanceToCorner = Math.abs(basketY - topCornerY);
    var arcEndAngle = Math.asin(yDistanceToCorner / threePtRadius);
    
    ctx.beginPath();
    if (side === 'left') {
      ctx.arc(basketX, basketY, threePtRadius, -arcEndAngle, arcEndAngle);
    } else {
      ctx.arc(basketX, basketY, threePtRadius, Math.PI - arcEndAngle, Math.PI + arcEndAngle);
    }
    ctx.stroke();
    
    var topArcEndX, topArcEndY, bottomArcEndX, bottomArcEndY;
    if (side === 'left') {
      topArcEndX = basketX + Math.cos(arcEndAngle) * threePtRadius;
      topArcEndY = basketY - Math.sin(arcEndAngle) * threePtRadius;
      bottomArcEndX = basketX + Math.cos(-arcEndAngle) * threePtRadius;
      bottomArcEndY = basketY - Math.sin(-arcEndAngle) * threePtRadius;
    } else {
      topArcEndX = basketX + Math.cos(Math.PI - arcEndAngle) * threePtRadius;
      topArcEndY = basketY - Math.sin(Math.PI - arcEndAngle) * threePtRadius;
      bottomArcEndX = basketX + Math.cos(Math.PI + arcEndAngle) * threePtRadius;
      bottomArcEndY = basketY - Math.sin(Math.PI + arcEndAngle) * threePtRadius;
    }
    
    ctx.beginPath();
    ctx.moveTo(topArcEndX, topArcEndY);
    ctx.lineTo(baselineX, topCornerY);
    ctx.moveTo(bottomArcEndX, bottomArcEndY);
    ctx.lineTo(baselineX, bottomCornerY);
    ctx.stroke();
  }

  // Enhanced canvas event listeners with touch support
  function setupCanvasEvents() {
    console.log('Setting up canvas events, canvas element:', canvas);
    
    // Remove existing listeners first
    canvas.removeEventListener('click', handleCanvasClickWrapper);
    canvas.removeEventListener('mousedown', handleMouseDownWrapper);
    canvas.removeEventListener('mousemove', handleMouseMoveWrapper);
    canvas.removeEventListener('mouseup', handleMouseUpWrapper);
    
    // Remove touch listeners
    canvas.removeEventListener('touchstart', handleTouchStartWrapper);
    canvas.removeEventListener('touchmove', handleTouchMoveWrapper);
    canvas.removeEventListener('touchend', handleTouchEndWrapper);
    
    // Add mouse listeners
    canvas.addEventListener('click', handleCanvasClickWrapper);
    canvas.addEventListener('mousedown', handleMouseDownWrapper);
    canvas.addEventListener('mousemove', handleMouseMoveWrapper);
    canvas.addEventListener('mouseup', handleMouseUpWrapper);
    
    // Add touch listeners for mobile support
    canvas.addEventListener('touchstart', handleTouchStartWrapper);
    canvas.addEventListener('touchmove', handleTouchMoveWrapper);
    canvas.addEventListener('touchend', handleTouchEndWrapper);
    
    // Prevent default touch behaviors that interfere with drawing
    canvas.addEventListener('touchstart', function(e) { e.preventDefault(); });
    canvas.addEventListener('touchmove', function(e) { e.preventDefault(); });
    canvas.addEventListener('touchend', function(e) { e.preventDefault(); });
  }
  
  function handleCanvasClickWrapper(e) {
    console.log('Canvas clicked!');
    var coords = getEventCoordinates(e);
    console.log('Click coordinates:', coords.x, coords.y, 'Current tool:', currentTool);
    handleCanvasClick(coords.x, coords.y);
  }
  
  function handleMouseDownWrapper(e) {
    var coords = getEventCoordinates(e);
    handleMouseDown(coords.x, coords.y);
  }
  
  function handleMouseMoveWrapper(e) {
    var coords = getEventCoordinates(e);
    handleMouseMove(coords.x, coords.y);
  }
  
  function handleMouseUpWrapper(e) {
    var coords = getEventCoordinates(e);
    handleMouseUp(coords.x, coords.y);
  }

  // Touch event handlers
  function handleTouchStartWrapper(e) {
    var coords = getEventCoordinates(e);
    
    // For single-click tools, handle as click
    if(currentTool === 'cross' || currentTool === 'triangle' || currentTool === 'number' || currentTool === 'ball') {
      handleCanvasClick(coords.x, coords.y);
    } else {
      // For drawing tools, handle as mouse down
      handleMouseDown(coords.x, coords.y);
    }
  }
  
  function handleTouchMoveWrapper(e) {
    var coords = getEventCoordinates(e);
    handleMouseMove(coords.x, coords.y);
  }
  
  function handleTouchEndWrapper(e) {
    var coords = getEventCoordinates(e);
    handleMouseUp(coords.x, coords.y);
  }
  
  function handleCanvasClick(x, y) {
    console.log('handleCanvasClick called with:', x, y, 'currentTool:', currentTool);
    
    if(currentTool === 'cross') {
      addCross(x, y);
    } else if(currentTool === 'triangle') {
      addTriangle(x, y);
    } else if(currentTool === 'number') {
      console.log('Adding number', currentNumber, 'at:', x, y);
      addNumber(x, y, currentNumber);
    } else if(currentTool === 'ball') {
      console.log('Adding basketball at:', x, y);
      addBall(x, y);
    }
  }
  
  function handleMouseDown(x, y) {
    if(currentTool === 'arrow' || currentTool === 'line' || currentTool === 'circle' || 
       currentTool === 'dotted-line' || currentTool === 'dotted-arrow' || currentTool === 'curve' ||
       currentTool === 'dotted-curve' || currentTool === 'line-with-stops' || currentTool === 'dotted-line-with-stops' ||
       currentTool === 'squiggly-arrow' || currentTool === 'dotted-squiggly-arrow') {
      drawing = true;
      startX = x;
      startY = y;
    }
  }
  
  function handleMouseMove(x, y) {
    if(drawing) {
      var lineWidth = Math.max(2, Math.min(5, currentCourtConfig.canvasWidth / 400)); // Responsive line width
      
      previewElement = {
        type: currentTool,
        startX: startX,
        startY: startY,
        endX: x,
        endY: y,
        color: currentColor,
        lineWidth: lineWidth,
        isPreview: true
      };
      
      redrawAll();
    }
  }
  
  function handleMouseUp(x, y) {
    if(drawing && (currentTool === 'arrow' || currentTool === 'line' || currentTool === 'circle' ||
                   currentTool === 'dotted-line' || currentTool === 'dotted-arrow' || currentTool === 'curve' ||
                   currentTool === 'dotted-curve' || currentTool === 'line-with-stops' || currentTool === 'dotted-line-with-stops' ||
                   currentTool === 'squiggly-arrow' || currentTool === 'dotted-squiggly-arrow')) {
      addShape(currentTool, startX, startY, x, y);
      drawing = false;
      previewElement = null;
      redrawAll();
    }
  }
  
  function addPlayer(x, y) {
    console.log('addPlayer called with:', x, y, 'currentColor:', currentColor);
    var element = {
      type: 'player',
      x: x,
      y: y,
      team: currentTeam,
      color: currentColor
    };
    elements.push(element);
    console.log('Player element added:', element);
    console.log('Total elements:', elements.length);
    redrawAll();
  }
  
  function addCross(x, y) {
    var element = {
      type: 'cross',
      x: x,
      y: y,
      color: currentColor
    };
    elements.push(element);
    redrawAll();
  }
  
  function addTriangle(x, y) {
    var element = {
      type: 'triangle',
      x: x,
      y: y,
      color: currentColor
    };
    elements.push(element);
    redrawAll();
  }
  
  function addBall(x, y) {
    console.log('addBall called with:', x, y);
    var element = {
      type: 'ball',
      x: x,
      y: y
    };
    elements.push(element);
    console.log('Basketball element added:', element);
    console.log('Total elements:', elements.length);
    redrawAll();
  }
  
  function addNumber(x, y, number) {
    console.log('addNumber called with:', x, y, number, 'currentColor:', currentColor);
    var element = {
      type: 'number',
      x: x,
      y: y,
      number: number,
      color: currentColor
    };
    elements.push(element);
    console.log('Number element added:', element);
    console.log('Total elements:', elements.length);
    redrawAll();
  }
  
  function addShape(type, startX, startY, endX, endY) {
    var lineWidth = Math.max(2, Math.min(5, currentCourtConfig.canvasWidth / 400)); // Responsive line width
    
    var element = {
      type: type,
      startX: startX,
      startY: startY,
      endX: endX,
      endY: endY,
      color: currentColor,
      lineWidth: lineWidth
    };
    elements.push(element);
    redrawAll();
  }
  
  function drawElement(element) {
    ctx.save();
    
    // Calculate responsive sizes
    var scale = currentCourtConfig.canvasWidth / 1200; // Base scale
    var playerRadius = Math.max(12, 18 * scale);
    var fontSize = Math.max(16, 24 * scale);
    var crossSize = Math.max(6, 8 * scale);
    var triangleSize = Math.max(8, 10 * scale);
    
    if(element.type === 'player') {
      // Draw player with colored circle and number
      ctx.fillStyle = element.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      
      // Draw colored background circle
      ctx.beginPath();
      ctx.arc(element.x, element.y, playerRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Draw the number in white
      ctx.fillStyle = '#fff';
      ctx.font = 'bold ' + fontSize + 'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better visibility
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(element.number.toString(), element.x, element.y);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if(element.type === 'cross') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = Math.max(2, 3 * scale);
      ctx.beginPath();
      ctx.moveTo(element.x - crossSize, element.y - crossSize);
      ctx.lineTo(element.x + crossSize, element.y + crossSize);
      ctx.moveTo(element.x + crossSize, element.y - crossSize);
      ctx.lineTo(element.x - crossSize, element.y + crossSize);
      ctx.stroke();
    } else if(element.type === 'triangle') {
      ctx.fillStyle = element.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(element.x, element.y - triangleSize);
      ctx.lineTo(element.x - triangleSize, element.y + triangleSize);
      ctx.lineTo(element.x + triangleSize, element.y + triangleSize);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if(element.type === 'arrow') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([]);
      drawArrow(element.startX, element.startY, element.endX, element.endY);
    } else if(element.type === 'dotted-arrow') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([8 * scale, 6 * scale]);
      drawArrow(element.startX, element.startY, element.endX, element.endY);
      ctx.setLineDash([]);
    } else if(element.type === 'squiggly-arrow') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([]);
      drawSquigglyArrow(element.startX, element.startY, element.endX, element.endY);
    } else if(element.type === 'dotted-squiggly-arrow') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([8 * scale, 6 * scale]);
      drawSquigglyArrow(element.startX, element.startY, element.endX, element.endY);
      ctx.setLineDash([]);
    } else if(element.type === 'line') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(element.startX, element.startY);
      ctx.lineTo(element.endX, element.endY);
      ctx.stroke();
    } else if(element.type === 'dotted-line') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([8 * scale, 6 * scale]);
      ctx.beginPath();
      ctx.moveTo(element.startX, element.startY);
      ctx.lineTo(element.endX, element.endY);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if(element.type === 'curve') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([]);
      drawCurve(element.startX, element.startY, element.endX, element.endY);
    } else if(element.type === 'dotted-curve') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([8 * scale, 6 * scale]);
      drawCurve(element.startX, element.startY, element.endX, element.endY);
      ctx.setLineDash([]);
    } else if(element.type === 'line-with-stops') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([]);
      drawLineWithStop(element.startX, element.startY, element.endX, element.endY);
    } else if(element.type === 'dotted-line-with-stops') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([8 * scale, 6 * scale]);
      drawLineWithStop(element.startX, element.startY, element.endX, element.endY);
      ctx.setLineDash([]);
    } else if(element.type === 'circle') {
      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.lineWidth;
      ctx.setLineDash([]);
      var radius = Math.sqrt(Math.pow(element.endX - element.startX, 2) + Math.pow(element.endY - element.startY, 2));
      ctx.beginPath();
      ctx.arc(element.startX, element.startY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if(element.type === 'number') {
      // Draw number with background circle for visibility
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      
      // Draw white background circle
      ctx.beginPath();
      ctx.arc(element.x, element.y, playerRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Draw the number
      ctx.fillStyle = element.color;
      ctx.font = 'bold ' + fontSize + 'px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(element.number.toString(), element.x, element.y);
    }
    
    ctx.restore();
  }
  
  function drawCurve(startX, startY, endX, endY) {
    var midX = (startX + endX) / 2;
    var midY = (startY + endY) / 2;
    
    var dx = endX - startX;
    var dy = endY - startY;
    var length = Math.sqrt(dx * dx + dy * dy);
    
    var offset = length * 0.3;
    var controlX = midX - (dy / length) * offset;
    var controlY = midY + (dx / length) * offset;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.stroke();
  }
  
  function drawLineWithStop(fromX, fromY, toX, toY) {
    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Calculate line angle and perpendicular angle
    var dx = toX - fromX;
    var dy = toY - fromY;
    var angle = Math.atan2(dy, dx);
    var perpAngle = angle + Math.PI / 2;
    
    // Length of the perpendicular stop line (responsive)
    var scale = currentCourtConfig.canvasWidth / 1200;
    var stopLength = Math.max(16, 22 * scale);
    
    // Draw perpendicular stop only at the END point
    ctx.beginPath();
    ctx.moveTo(toX - Math.cos(perpAngle) * stopLength / 2, toY - Math.sin(perpAngle) * stopLength / 2);
    ctx.lineTo(toX + Math.cos(perpAngle) * stopLength / 2, toY + Math.sin(perpAngle) * stopLength / 2);
    ctx.stroke();
  }
  
  function drawSquigglyArrow(fromX, fromY, toX, toY) {
    // Calculate the line length and direction
    var dx = toX - fromX;
    var dy = toY - fromY;
    var length = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx);
    
    // Create responsive squiggly line
    var scale = currentCourtConfig.canvasWidth / 1200;
    var wavelength = Math.max(20, 25 * scale);
    var amplitude = Math.max(6, 8 * scale);
    var numWaves = Math.max(2, Math.floor(length / wavelength));
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    
    // Draw squiggly line using sine wave
    for(var i = 0; i <= numWaves * 10; i++) {
      var progress = i / (numWaves * 10);
      if(progress > 1) progress = 1;
      
      // Position along the straight line
      var straightX = fromX + dx * progress;
      var straightY = fromY + dy * progress;
      
      // Add perpendicular sine wave offset
      var wavePhase = progress * numWaves * Math.PI * 2;
      var waveOffset = Math.sin(wavePhase) * amplitude;
      
      // Calculate perpendicular direction
      var perpX = -Math.sin(angle) * waveOffset;
      var perpY = Math.cos(angle) * waveOffset;
      
      var finalX = straightX + perpX;
      var finalY = straightY + perpY;
      
      ctx.lineTo(finalX, finalY);
    }
    ctx.stroke();
  }
  
  function drawArrow(fromX, fromY, toX, toY) {
    var scale = currentCourtConfig.canvasWidth / 1200;
    var headlen = Math.max(16, 21 * scale);
    var dx = toX - fromX;
    var dy = toY - fromY;
    var angle = Math.atan2(dy, dx);
    
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI/6), toY - headlen * Math.sin(angle - Math.PI/6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI/6), toY - headlen * Math.sin(angle + Math.PI/6));
    ctx.stroke();
  }
  
  // Message handlers
  Shiny.addCustomMessageHandler('clearCourt', function(data) {
    elements = [];
    redrawAll();
  });
  
  Shiny.addCustomMessageHandler('undoLast', function(data) {
    if(elements.length > 0) {
      elements.pop();
      redrawAll();
    }
  });
  
  Shiny.addCustomMessageHandler('exportCanvas', function(data) {
    var format = data.format;
    var filename = data.filename;
    
    if (format === 'png') {
      var dataURL = canvas.toDataURL('image/png');
      var link = document.createElement('a');
      link.download = filename + '.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      var tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      var tempCtx = tempCanvas.getContext('2d');
      
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      tempCtx.drawImage(canvas, 0, 0);
      
      if (typeof jsPDF !== 'undefined') {
        var imgData = tempCanvas.toDataURL('image/jpeg', 1.0);
        var pdf = new jsPDF({
          orientation: tempCanvas.width > tempCanvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [tempCanvas.width, tempCanvas.height]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, tempCanvas.width, tempCanvas.height);
        pdf.save(filename + '.pdf');
      } else {
        var dataURL = tempCanvas.toDataURL('image/png');
        var link = document.createElement('a');
        link.download = filename + '.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('PDF library not available. Exported as PNG instead.');
      }
    }
  });
  
  // Initialize
  $('.tool-tile[data-tool="number"]').addClass('active');
  $('.color-tile[data-color="#dc3545"]').addClass('active');
  $('.number-tile[data-number="1"]').addClass('active');
  updateCursor();
  
  // Set up canvas events initially with a delay to ensure DOM is ready
  setTimeout(function() {
    setupCanvasEvents();
  }, 100);
});