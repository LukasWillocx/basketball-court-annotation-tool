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
* A basketball
* straight, curved, terminated and squiggly lines in either solid or dotted configuration to identify dribbles, runs, screens and passes
* six basic colors (yellow, red, orange, blue, green and purple)
* Move and delete existing annotations

### Export capability
* As a .png that just encompasses the annotated area

### Simplicity
* Barebones, straightforward UI
* limited package depencencies (just shiny & shinydashboard)
* lightweight & super responsive
* No local installation, easily webhosted through shiny-server

### Design and purpose
I am quite familiar with R and R shiny, at least from a statistical perspective and as a webhostable framework. This was made out of sheer curiosity, leveraging a familiar framework to make a webapplication for which it is quite clearly not designed. It's more of a proof that that the R shiny platform is incredibly versatile and when provided with the right guts, can achieve almost anything. The ui and the front-facing server logic may be R, but javascript did all the heavy lifting here. It's just the appropriate language when it comes to drawing and annotation. 

### WebApplication Vs local/offline application
With this app, I explored the possibility to package a WebApp as a standalone application. This is made possible by the recent developments with webR. This allows to move the compute to the client device. This can however be translated to WebAssembly and then packaged as a self-contained application that works offline. This was done using Tauri, an opensource framework with Rust that works with any codebase, including R. It does not require a prior R installation on the host device, this is included in the application. It even comes packaged with a tiny web browser to facilitate the seamless running of a WebApplication, offline. This amounts to an executable of ~53MB, which is fairly large, but totally manageable by any modern standards. This is currently built as a Windows app, but can be built cross-platform, including MacOS and Linux.
