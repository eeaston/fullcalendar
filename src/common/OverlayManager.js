 
function OverlayManager() {
	var t = this;
	
	
	// exports
	t.renderOverlay = renderOverlay;
	t.clearOverlays = clearOverlays;
	
	
	// locals
	var usedOverlays = {
		'selection': [],
		'avail': []
	};
	var unusedOverlays = {
		'selection': [],
		'avail': []
	};
	
	var overlayGenerator = {
		'selection': function() {
			return $("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>");
		},
		'avail' : function() {
			return $("<div class='fc-cell-overlay-avail' style='position:absolute;z-index:3'/>");
		}
	};
	
	
	function renderOverlay(rect, parent, overlayType) {
		/*
		 * overlayType: defaults to 'selection' for regular selection overlays
		 */
		overlayType = overlayType ? overlayType : 'selection';
		var e = unusedOverlays[overlayType].shift();
		if (!e) {
			e = overlayGenerator[overlayType]();
		}
		if (e[0].parentNode != parent[0]) {
			e.appendTo(parent);
		}
		usedOverlays[overlayType].push(e.css(rect).show());
		return e;
	};
	

	function clearOverlays(overlayType) {
		overlayType = overlayType ? overlayType : 'selection';
		var e;
		while (e = usedOverlays[overlayType].shift()) {
			unusedOverlays[overlayType].push(e.hide().unbind());
		}
	};


}
