# Toolbar UI Module
toolbarUI <- function(id) {
  ns <- NS(id)
  
  div(class = "toolbar",
      
      div(class = "tool-group",
          h4("Pick Color"),
          div(
            div(class = "color-tile", `data-color` = "#dc3545", `data-team` = "teamA", 
                style = "background-color: #dc3545;", title = "Red"),
            div(class = "color-tile", `data-color` = "#007bff", `data-team` = "teamB", 
                style = "background-color: #007bff;", title = "Blue"),
            div(class = "color-tile", `data-color` = "#28a745", `data-team` = "teamC", 
                style = "background-color: #28a745;", title = "Green"),
            div(class = "color-tile", `data-color` = "#ffc107", `data-team` = "teamD", 
                style = "background-color: #ffc107;", title = "Yellow"),
            div(class = "color-tile", `data-color` = "#6f42c1", `data-team` = "teamE", 
                style = "background-color: #6f42c1;", title = "Purple"),
            div(class = "color-tile", `data-color` = "#fd7e14", `data-team` = "teamF", 
                style = "background-color: #fd7e14;", title = "Orange")
          ),
      ),
      
      div(class = "tool-group",
          h4("Basic Tools"),
          div(
            div(class = "tool-tile", `data-tool` = "cross", title = "Add Cross", "✕"),
            div(class = "tool-tile", `data-tool` = "triangle", title = "Add Triangle", "▲"),
            div(class = "tool-tile", `data-tool` = "ball", title = "Place Basketball", "🏀"),
            div(class = "tool-tile", `data-tool` = "circle", title = "Draw Circle", "O")
          ),
      ),

      div(class = "tool-group",
          h4("Place Players"),
          div(style = "margin-top: 10px;",
              div(
                div(class = "number-tile", `data-number` = "1", title = "Place Player 1", "1"),
                div(class = "number-tile", `data-number` = "2", title = "Place Player 2", "2"),
                div(class = "number-tile", `data-number` = "3", title = "Place Player 3", "3"),
                div(class = "number-tile", `data-number` = "4", title = "Place Player 4", "4"),
                div(class = "number-tile", `data-number` = "5", title = "Place Player 5", "5")
              )
          )
      ),
      
      div(class = "tool-group",
          h4("Lines"),
          div(
            div(class = "tool-tile", `data-tool` = "line", title = "Solid Line", "─"),
            div(class = "tool-tile", `data-tool` = "dotted-line", title = "Dotted Line", "┄")
          ),
          div(style = "margin-top: 10px;",
              div(class = "tool-tile", `data-tool` = "line-with-stops", title = "Line with Stop", "┣"),
              div(class = "tool-tile", `data-tool` = "dotted-line-with-stops", title = "Dotted Line with Stop", "┣-")
          )
      ),
      
      div(class = "tool-group",
          h4("Arrows"),
          div(
            div(class = "tool-tile", `data-tool` = "arrow", title = "Solid Arrow", "→"),
            div(class = "tool-tile", `data-tool` = "dotted-arrow", title = "Dotted Arrow", "⇢")
          )
      ),
      
      div(class = "tool-group",
          h4("Squiggly"),
          div(
            div(class = "tool-tile", `data-tool` = "squiggly-arrow", title = "Squiggly Arrow", "〰"),
            div(class = "tool-tile", `data-tool` = "dotted-squiggly-arrow", title = "Dotted Squiggly Arrow", "〰*")
          )
      ),
      
      div(class = "tool-group",
          h4("Curves"),
          div(
            div(class = "tool-tile", `data-tool` = "curve", title = "Solid Curve", "︵"),
            div(class = "tool-tile", `data-tool` = "dotted-curve", title = "Dotted Curve", "︵*")
          )
      ),
      
  )
}

# Canvas Area UI Module
canvasAreaUI <- function(id) {
  ns <- NS(id)
  
  div(class = "canvas-area",
      # Top Controls
      div(class = "top-controls",
          div(class = "court-controls",
              span("Court Type:"),
              selectInput(ns("courtType"), NULL, 
                          choices = list("Half Court" = "half", "Full Court" = "full"),
                          selected = "full", width = "120px")
          ),
          actionButton(ns("clearCourt"), "Clear Court", class = "action-button btn-clear"),
          actionButton(ns("undoLast"), "Undo Last", class = "action-button btn-undo"),
          actionButton(ns("saveDiagram"), "Save Diagram", class = "action-button btn-save")
      ),
      
      # Canvas Container
      div(class = "canvas-container",
          tags$canvas(id = "courtCanvas", width = "600", height = "400")
      ),
      
      # Status Bar
      div(class = "status-bar",
          span(id = "tool-status", ""),
          span(id = "coords", "")
      )
  )
}