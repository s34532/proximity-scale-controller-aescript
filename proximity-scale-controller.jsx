{
  // Ensure a project is open
  if (app.project === null) {
    alert("Please open a project first.");
  } else {
    app.beginUndoGroup("Scale Layers By Distance");

    var comp = app.project.activeItem;

    if (comp === null || !(comp instanceof CompItem)) {
      alert("Please select or open a composition.");
    } else {
      var selectedLayers = comp.selectedLayers;

      if (selectedLayers.length === 0) {
        alert("Please select at least one layer.");
      } else {
        // Check if a controller layer named "Controls" exists, if not, create it
        var controlsLayerName = "Controls";
        var controlsLayer = null;

        // Search for a layer named "Controls"
        for (var i = 1; i <= comp.numLayers; i++) {
          var layer = comp.layer(i);
          if (layer.name === controlsLayerName) {
            controlsLayer = layer;
            break;
          }
        }

        // If not found, create a new Null layer named "Controls"
        if (controlsLayer === null) {
          controlsLayer = comp.layers.addNull();
          controlsLayer.name = controlsLayerName;
          controlsLayer.label = 9; // Set label color to green
          controlsLayer
            .property("ADBE Transform Group")
            .property("ADBE Anchor Point")
            .setValue([50, 50, 0]);
          controlsLayer.moveToBeginning();
        }

        // Add expression controls to the controlsLayer if they don't exist
        var maxScaleSlider = controlsLayer
          .property("Effects")
          .property("Max Scale");
        if (maxScaleSlider === null) {
          maxScaleSlider = controlsLayer
            .property("Effects")
            .addProperty("ADBE Slider Control");
          maxScaleSlider.name = "Max Scale";
          maxScaleSlider.property("Slider").setValue(150); // Default Max Scale
        }

        var minScaleSlider = controlsLayer
          .property("Effects")
          .property("Min Scale");
        if (minScaleSlider === null) {
          minScaleSlider = controlsLayer
            .property("Effects")
            .addProperty("ADBE Slider Control");
          minScaleSlider.name = "Min Scale";
          minScaleSlider.property("Slider").setValue(50); // Default Min Scale
        }

        var yOffsetSlider = controlsLayer
          .property("Effects")
          .property("Y Offset");
        if (yOffsetSlider === null) {
          yOffsetSlider = controlsLayer
            .property("Effects")
            .addProperty("ADBE Slider Control");
          yOffsetSlider.name = "Y Offset";
          yOffsetSlider.property("Slider").setValue(0); // Default Y Offset
        }

        // For each selected layer, add expressions to Scale and Position properties
        for (var i = 0; i < selectedLayers.length; i++) {
          var layer = selectedLayers[i];

          // Add expression to Scale property
          var scaleExpression =
            "var compCenter = [thisComp.width / 2, thisComp.height / 2];\n" +
            "var layerPos = thisLayer.toComp(thisLayer.anchorPoint);\n" +
            "var maxScale = thisComp.layer('" +
            controlsLayerName +
            "').effect('Max Scale')('Slider');\n" +
            "var minScale = thisComp.layer('" +
            controlsLayerName +
            "').effect('Min Scale')('Slider');\n" +
            "var maxDist = length([0,0], compCenter);\n" +
            "var dist = length(layerPos, compCenter);\n" +
            "var t = dist / maxDist;\n" +
            "var scaleValue = linear(t, 0, 1, maxScale, minScale);\n" +
            "[scaleValue, scaleValue];";

          // Set the expression
          layer.property("Scale").expression = scaleExpression;

          // Add expression to Position property (Y-axis offset)
          var positionExpression =
            "var yOffset = thisComp.layer('" +
            controlsLayerName +
            "').effect('Y Offset')('Slider');\n" +
            "value + [0, yOffset];";

          // Set the expression
          layer.property("Position").expression = positionExpression;
        }

        alert("Expressions added to selected layers.");
      }
    }

    app.endUndoGroup();
  }
}
