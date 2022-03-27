console.clear();
figma.showUI(__html__);
figma.ui.resize(320, 320);
// Get current Page
const currentPage = figma.currentPage;
// Get current Selection
const currentSelection = currentPage.selection;
const counterDirection = {
    HORIZONTAL: "VERTICAL",
    VERTICAL: "HORIZONTAL"
};
// Default settings
const settingsDefault = {
    children: {
        active: true,
        layoutAlign: "STRETCH"
    }
};
var settings = settingsDefault;
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
function setToStretch(nodes, stretchDirection) {
    for (let node of nodes) {
        let parent = node.parent;
        let parentStackDirection = node.parent.layoutMode;
        if (stretchDirection == "HORIZONTAL") {
            switch (parentStackDirection) {
                case "HORIZONTAL":
                    node.layoutGrow = 1;
                    break;
                case "VERTICAL":
                    node.layoutAlign = "STRETCH";
                    break;
            }
            if (stretchDirection == node.layoutMode) {
                node.primaryAxisSizingMode = "FIXED";
            }
        }
        if (stretchDirection == "VERTICAL") {
            // If parent is set to Hug vertically, it needs to be set to fixed
            // And then we need to to know the direction of the grand parent
            switch (parentStackDirection) {
                case "VERTICAL":
                    node.layoutGrow = 1;
                    parent.primaryAxisSizingMode = "FIXED";
                    break;
                case "HORIZONTAL":
                    node.layoutAlign = "STRETCH";
                    parent.counterAxisSizingMode = "FIXED";
                    break;
            }
            if (stretchDirection == node.layoutMode) {
                node.primaryAxisSizingMode = "FIXED";
            }
        }
    }
}
function setToHug(nodes, hugDirection) {
    console.log("setToHug()", hugDirection);
    for (let node of nodes) {
        let parent = node.parent;
        let parentStackDirection = node.parent.layoutMode;
        if (hugDirection == "HORIZONTAL") {
            if (parentStackDirection == "HORIZONTAL") {
                node.layoutGrow = 0;
                node.primaryAxisSizingMode = "AUTO";
            }
            else if (parentStackDirection == "VERTICAL") {
                node.layoutAlign = "INHERIT";
            }
            if (hugDirection == node.layoutMode) {
                node.primaryAxisSizingMode = "AUTO";
            }
            else {
                node.counterAxisSizingMode = "AUTO";
            }
        }
        if (hugDirection == "VERTICAL") {
            if (parentStackDirection == "VERTICAL") {
                node.layoutGrow = 0;
                node.primaryAxisSizingMode = "AUTO";
            }
            else if (parentStackDirection == "HORIZONTAL") {
                node.layoutAlign = "INHERIT";
                node.counterAxisSizingMode = "AUTO";
            }
        }
    }
}
setGrowPropertyWithDepth(currentSelection, "HUG", "VERTICAL", 0);
// setToHug(currentSelection, "HORIZONTAL")
function setGrowPropertyWithDepth(nodes, grow, direction, depth = 0) {
    console.log("setGrowPropertyWithDepth()", grow, direction, depth);
    // Handle which function should run
    let growMethod = function (nodes, direction) {
        switch (grow) {
            case "HUG":
                console.log("CASE: HUG");
                setToHug(nodes, direction);
                break;
            case "STRETCH":
                console.log("CASE: STRETCH");
                setToStretch(nodes, direction);
                break;
        }
    };
    // DEPTH 0
    if (depth == 0) {
        growMethod(nodes, direction);
        return;
    }
    // DEPTH 1
    if (depth == 1) {
        for (let node of nodes) {
            if (node.children != undefined) {
                growMethod(node.children, direction);
                return;
            }
        }
    }
    // DEPTH 2
    if (depth == 2) {
        for (let node of nodes) {
            if (node.children != undefined) {
                for (let child of node.children) {
                    let grandChildren = child.children;
                    if (grandChildren != undefined) {
                        growMethod(grandChildren, direction);
                    }
                }
            }
        }
        return;
    }
}
// Listen on messages from UI
figma.ui.onmessage = event => {
    let message = event;
    console.log("message received from UI: ", message);
    if (message.action == "stretch") {
        let selection = figma.currentPage.selection;
        setGrowPropertyWithDepth(selection, "STRETCH", message.direction, message.depth);
    }
    // function saveSettings(settings){
    //     let storage = figma.clientStorage
    //     storage.setAsync("pace.findDeprecatedComponents",settings).then( function(){
    //         console.log("Settings saved. New settings:", settings)
    //     })
    // }
};
