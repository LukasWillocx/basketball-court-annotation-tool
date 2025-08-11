library(shiny)
library(shinydashboard)

# Source modules
source("ui_components.R")
source("server_logic.R")

# Main UI
ui <- fluidPage(
  includeCSS("styles.css"),
  includeScript("basketball_court.js"),
  
  div(class = "main-container",
      toolbarUI("toolbar"),
      canvasAreaUI("canvas")
  )
)

# Main Server
server <- function(input, output, session) {
  toolbarServer("toolbar")
  canvasServer("canvas", input, session)
}

shinyApp(ui, server)