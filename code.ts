console.clear()

figma.showUI(__html__);
figma.ui.resize(320,320)

// Get current Page
const currentPage = figma.currentPage
// Get current Selection
const currentSelection = currentPage.selection


const counterDirection = {
    HORIZONTAL: "VERTICAL",
    VERTICAL: "HORIZONTAL"
}


// Default settings
const settingsDefault = {
    children: {
        active: true,
        layoutAlign: "STRETCH"    
    }
    
}


var settings = settingsDefault

// load settings
// let storage = figma.clientStorage
// var initSettings = {}
// storage.getAsync("pace.findDeprecatedComponents").then( function(res){
//     initSettings = settingsDefault
//     if(res != undefined){
//         initSettings = res
//     }
//     runPlugin(initSettings)
// })






function setToStretch(nodes:Array, stretchDirection){
    for(let node of nodes){
        let parent = node.parent
        let grandParent = node.parent.parent
        let parentStackDirection = node.parent.layoutMode
        let grandParentStackDirection = node.parent.layoutMode



        if(stretchDirection == "HORIZONTAL"){
            if( parentStackDirection == "HORIZONTAL" ){
                node.layoutGrow = 1
            }else if( parentStackDirection == "VERTICAL" ){
                node.layoutAlign = "STRETCH"
            }

            if(stretchDirection == node.layoutMode){
                node.primaryAxisSizingMode = "FIXED"
            }

        }
        if(stretchDirection == "VERTICAL"){

            // If parent is set to Hug vertically, it needs to be set to fixed
            // And then we need to to know the direction of the grand parent
            switch (parentStackDirection) {
                case "VERTICAL":
                    node.layoutGrow = 1
                    parent.primaryAxisSizingMode = "FIXED"
                    break
                case "HORIZONTAL":
                    node.layoutAlign = "STRETCH"
                    parent.counterAxisSizingMode = "FIXED"
                    break
            }

            if(stretchDirection == node.layoutMode){
                node.primaryAxisSizingMode = "FIXED"
            }


        }

    }
}


function setToStretchWithDepth(nodes:Array, depth:number = 0, stretchDirection){


    // DEPTH 0
    if(depth == 0){
        setToStretch(nodes, stretchDirection)
        return
    }
    // DEPTH 1
    if(depth == 1) {
        for(let node of nodes){
            if(node.children != undefined){
                setToStretch(node.children, stretchDirection)
                return
            }
        }    
    }
    // DEPTH 2
    if(depth == 2){
        for(let node of nodes){
            if(node.children != undefined){
                for(let child of node.children){
                    let grandChildren = child.children
                    
                    if(grandChildren != undefined){
                        setToStretch(grandChildren, stretchDirection)
                    }
                }
                return
            }
        }    
    }
}


// Listen on messages from UI
figma.ui.onmessage = event => {
  let message = event;
  console.log("message received from UI: ", message)

  if(message.action == "stretch"){
    let selection = figma.currentPage.selection
    setToStretchWithDepth(selection, message.depth, message.direction)
  }

// function saveSettings(settings){
//     let storage = figma.clientStorage
//     storage.setAsync("pace.findDeprecatedComponents",settings).then( function(){
//         console.log("Settings saved. New settings:", settings)
//     })
    // }
}


