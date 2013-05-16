function AgendaAvailRenderer() {
	var t = this;
	
	// exports
	t.renderAvailEvents = renderAvailEvents;
	t.clearAvailEvents = clearAvailEvents;
	
	// imports
	var renderSelection = t.renderSelection;
	var getMaxMinute = t.getMaxMinute;
	var getMinMinute = t.getMinMinute;
	
	
	/* Rendering
	----------------------------------------------------------------------------*/
	function renderAvailEvents(events) {
		$(events).each(function() {
			if ( ((this.end.getHours() * 60 + this.end.getMinutes()) > getMinMinute())
				 &&
				 ((this.start.getHours() * 60 + this.start.getMinutes()) < getMaxMinute())
				) {
				renderSelection(this.start, this.end);
			}
		});
	};
	
	function clearAvailEvents() {
		//
	}
}