function AgendaAvailRenderer() {
	var t = this;
	
	// exports
	t.renderAvailEvents = renderAvailEvents;
	t.clearAvailEvents = clearAvailEvents;
	
	// imports
	var renderAvailability = t.renderAvailability;
	var getMaxMinute = t.getMaxMinute;
	var getMinMinute = t.getMinMinute;
	
	
	/* Rendering
	----------------------------------------------------------------------------*/
	function renderAvailEvents(events) {
		$(_getUnavailEvents.apply(this, [events])).each(function() {
			// TODO: all-day
			renderAvailability(this.start, this.end);
		});
	};
	
	function _getUnavailEvents(events) {
		/*
		 * Turn an array of 'i am available from a to b' events into an array
		 * of 'i am not available from c to d' events, as these are what will
		 * be drawn on the calendar
		 */
		
		var res = [],
		    u_start = this.start,  // this is the view's start date
		    u_end = this.start,
		    a_start = null,
		    a_end = null;
		    
	    if (events.length == 0){
	    	return []
	    }
	    	
		
		// sort events by start time
	    events.sort(function(a, b) {
	    	return a.start < b.start ? -1 : a.start > b.start ? 1: 0;
	    })
	    
	    
		var addUnavail = function() {
			if (u_start != u_end) {
				res.push({
					start : u_start,
					end : u_end
				})
			}
		}
		
		// Skip invisible events
		events = $(events).filter(function() {
			return ((this.end.getHours() * 60 + this.end.getMinutes()) > getMinMinute())
				 && 
				   ((this.start.getHours() * 60 + this.start.getMinutes()) < getMaxMinute())
		});
		
		// build out unavail events, concatenating overlapping or sequential events
		$(events).each(function() {
			
			// first off the block
			if (a_start === null) { 
				a_start = this.start;
				a_end = this.end;
				u_end = this.start;
				addUnavail();
			}
			if (this.start > a_end) {
				u_start = a_end;
				u_end = this.start;
				addUnavail();
				a_start = this.start;
				a_end = this.end;
			}
			else {
				a_end = this.end;
			}
		});
		u_start = a_end;
		u_end = this.end; // this is the view's end date
		addUnavail();
		return res;
	}
	
	function clearAvailEvents() {
		//
	}
}