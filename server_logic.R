# Toolbar Server Module
toolbarServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    # Toolbar logic can be expanded here if needed
    # Currently most toolbar interactions are handled in JavaScript
  })
}

# Canvas Server Module
canvasServer <- function(id, main_input, main_session) {
  moduleServer(id, function(input, output, session) {
    
    # Initialize court when app starts or court type changes
    observe({
      # Let JavaScript handle responsive sizing - just pass the court type
      main_session$sendCustomMessage("initCourt", list(
        courtType = input$courtType,
        # Remove fixed dimensions - let JavaScript calculate responsive sizes
        width = NULL,
        height = NULL,
        courtWidth = NULL,
        courtHeight = NULL
      ))
    })
    
    # Clear court
    observeEvent(input$clearCourt, {
      main_session$sendCustomMessage("clearCourt", list())
    })
    
    # Undo last action
    observeEvent(input$undoLast, {
      main_session$sendCustomMessage("undoLast", list())
    })
    
    # Save diagram as PNG
    observeEvent(input$saveDiagram, {
      showModal(modalDialog(
        title = "Export Diagram",
        textInput(session$ns("exportFilename"), "Filename:", 
                  value = paste0("basketball_play_", Sys.Date())),
        footer = tagList(
          actionButton(session$ns("confirmExport"), "Export as PNG", class = "btn-primary"),
          modalButton("Cancel")
        )
      ))
    })
    
    # Handle export confirmation
    observeEvent(input$confirmExport, {
      main_session$sendCustomMessage("exportCanvas", list(
        format = "png",
        filename = input$exportFilename
      ))
      removeModal()
      showNotification("Diagram exported as PNG!", duration = 3000)
    })
    
    # Update status based on current tool (simplified)
    observeEvent(main_input$currentTool, {
      tool_messages <- list(
        "delete" = "Click on any element to delete it",
        "move" = "Click and drag any element to move it",
        "cross" = "Click on court to place crosses",
        "triangle" = "Click on court to place triangles", 
        "number" = "Click on court to place the selected player number",
        "ball" = "Click on court to place basketball",
        "arrow" = "Click and drag to draw solid arrows",
        "dotted-arrow" = "Click and drag to draw dotted arrows",
        "squiggly-arrow" = "Click and drag to draw squiggly arrows",
        "dotted-squiggly-arrow" = "Click and drag to draw dotted squiggly arrows",
        "line" = "Click and drag to draw solid lines", 
        "dotted-line" = "Click and drag to draw dotted lines",
        "line-with-stops" = "Click and drag to draw lines with stop mark",
        "dotted-line-with-stops" = "Click and drag to draw dotted lines with stop mark",
        "curve" = "Click and drag to draw solid curved lines",
        "dotted-curve" = "Click and drag to draw dotted curved lines",
        "circle" = "Click and drag to draw circles"
      )
      
      message <- if(is.null(tool_messages[[main_input$currentTool]])) {
        "Select a tool or player number"
      } else {
        tool_messages[[main_input$currentTool]]
      }
      
      main_session$sendCustomMessage("updateStatus", list(message = message))
    })
  })
}