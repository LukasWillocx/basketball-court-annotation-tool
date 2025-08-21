# basketball-court-annotation-tool

This repository concerns a full self contained Basketball Court Annotation Tool in the R shiny framework, leveraging javascript and its object notation (json) to draw and make annotations in real time. These drafts, diagrams or plays can be exported as high resolution .png.

## Features

### Court design
* Half court or full court designs
* Official scaled NBA dimensions
* Additional border to permit drafts that start from a throw-in situation
  
### Annotation tools
* Player indicators (1-5)
* crosses/triangles/circles
* straight, curved, terminated and squiggly lines in either solid or dotted configuration to identify dribbles, runs, screens and passes
* six basic colors (yellow, red, orange, blue, green and purple)

### Export capability
* As a .png that just encompasses the annotated area

### Simplicity
* Barebones, straightforward UI
* limited package depencencies (just shiny & shinydashboard)
* lightweight & super responsive
* No local installation, easily webhosted through shiny-server

### Design and purpose
The app is designed with the help of Claude 4.0. I am quite familiar with R and R shiny, at least from a statistical perspective and as a webhostable framework. This was made out of sheer curiosity, leveraging a familiar framework to make a webapplication for which it is quite clearly not designed. It's more of a proof that that the R shiny platform is incredibly versatile and when provided with the right guts, can achieve almost anything. The ui and the front-facing server logic may be R, but javascript did all the heavy lifting here. It's just the appropriate language when it comes to drawing and annotation. 

[layout.pdf](https://github.com/user-attachments/files/21714234/layout.pdf)

The app is currently available @ http://app.luwi.me/basket 
