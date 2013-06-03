function AvailabilityRenderer() {
	/*
	 * Component of View class
	 * Deals with drawing areas of availability onto the views, and previewing 
	 * new event creation based on availability data.
	 */
	var t = this;
	
	// exports
	t.renderAvailEvents = renderAvailEvents;
	t.clearAvailEvents = clearAvailEvents;
	t.reportAvailability = reportAvailability;
	
	// imports
	var renderAvailability = t.renderAvailability;
	var renderSelection = t.renderSelection;
	var clearSelection = t.clearSelection;
	var clearOverlays = t.clearOverlays;
	var getMaxMinute = t.getMaxMinute;
	var getMinMinute = t.getMinMinute;
	var opt = t.opt;
	
	// locals
	var availEvents = []
	var unavailEvents = []
	var currentSlot = null; 
	
	enableAvailHover();
	
	// Watch for other calendar events to toggle the hover watch
	$(t.calendar.getElement()).on('eventDragStart eventResizeStart eventMouseover', 
						    	  disableAvailHover);
	$(t.calendar.getElement()).on('eventDragStop eventResizeStop eventMouseout', 
								  handleDragStop);
	
	// Watch for day clicking so we can check if it's in the currently hilighted
	// available slot and raise a new trigger.
	$(t.calendar.getElement()).on('dayClick', handleDayClick);
	
	
	/* Data handling
	----------------------------------------------------------------------------*/
	
	function reportAvailability(events) {
		/*
		 *  Called when event data arrives
		 */
		availEvents = events;
		
		// Sort availability events by start time. This helps us later.
	    availEvents.sort(function(a, b) {
	    	return a.start < b.start ? -1 : a.start > b.start ? 1: 0;
	    });
	    
	    // Calculate the gaps between events that will be drawn as 'bad' areas
	    unavailEvents = getUnavailEvents(availEvents);
	}
	
	function getUnavailEvents(events) {
		/*
		 * Turn an array of 'i am available from a to b' events into an array
		 * of 'i am not available from c to d' events, as these are what will
		 * be drawn on the calendar.
		 * 
		 * Assumption: events are ordered by start time
		 */
		var res = [],
		    u_start = this.start,  // this is the view's start date
		    u_end = this.start,
		    a_start = null,
		    a_end = null,
			minMinute =  getMinMinute(),
			maxMinute =  getMaxMinute();
		    
	    if (events.length == 0){
	    	return []
	    }
	    
		var add = function() {
			if (u_start != u_end) {
				res.push({
					start : u_start,
					end : u_end
				})
			}
		}
		
		// build out unavail events, concatenating overlapping or sequential events
		$(events).each(function() {
			
			// Skip invisible events
			if ( ((this.end.getHours() * 60 + this.end.getMinutes()) < minMinute)
					 || 
			     ((this.start.getHours() * 60 + this.start.getMinutes()) > maxMinute)
			  ) {
			  	return;
			}
			
			// first off the block
			if (a_start === null) { 
				a_start = this.start;
				a_end = this.end;
				u_end = this.start;
				add();
			}
			if (this.start > a_end) {
				u_start = a_end;
				u_end = this.start;
				add();
				a_start = this.start;
				a_end = this.end;
			}
			else {
				a_end = this.end;
			}
		});
		u_start = a_end;
		u_end = this.end; // this is the view's end date
		add();
		return res;
	};
	
	function findSlot(date) {
		/*
		 * At a given date, search our availability slots to find a 
		 * matching slot.
		 */
		 var slot,
		 	 candidates = [],
		 	 seen  = [],
		 	 potentials = availEvents.slice();
		 	 
		 // There is the possibility of overlapping slots. We keep a list of
		 // potentials - all the slots we've not yet looked at, and 
		 // seen - the slots we've seen so we don't look at them again
		 // candidates - all the slots that the search date matches
		 
		 // console.log("searching " + date)
		 var searchPotentials = function() {
		     /*
		      * Binary search potentials for slots matching search date
		      */
			 var low = 0, 
			 	 high = potentials.length - 1, 
			 	 i,
			 	 slot,
			 	 comparison;
		 	
		 	 seen = [];
			 while (low <= high) {
			 	 //console.log("seen:" + seen);
			 	 //console.log("lo:" + low + " hi: " + high);
				 i = Math.floor((low + high) / 2);
				 slot = potentials[i];
			 	 //console.log("i: " + i + " start: " + slot.start + " end:" + slot.end)
				 if (slot.start <= date && date < slot.end) { 
				 	//console.log("found!");
				 	return i; 
			 	 }
			 	 seen.push(i);
			     if (slot.start < date) { 
			     	low = i + 1; 
		     	 }
			     else {
			     	high = i - 1; 
			     }
			 }
		 	 //console.log("not found :(");
			 return null;
		};
		
		slot = searchPotentials();
		while (slot !== null) {
			candidates.push(potentials[slot]);
			potentials.splice(slot, 1);
			// remove seen items from potentials too. 
			// TODO check for premature optimisation? splice isnt exactly speedy
			for(i = 0; i < seen.length; i++) {
				potentials.splice(seen[i], 1);
			}
			slot = searchPotentials();
		}
		
		// sort candidates by reverse start time and return the first one
	    candidates.sort(function(a, b) {
	    	return a.start < b.start ? 1 : a.start > b.start ? -1: 0;
	    });
	    
	    return candidates.length === 0 ? null : candidates[0];
	};
		
	/* Control Enable and Disable
	----------------------------------------------------------------------------*/
	
	function enableAvailHover() {
		/*
		 * Enable mouse move detection within the view to draw the selection preview
		 */
		console.log("Enabling avail hover");
		t.element.mouseenter(handleEnterCalArea).mouseleave(handleExitCalArea);
	}
	
	function disableAvailHover() {
		/*
		 * Disable mouse move detection 
		 */
		console.log("Disabling avail hover");
		clearSelection();
		currentSlot = null;
		t.element.unbind('mousemove',handleMouseMove)
		 .unbind('mouseenter', handleEnterCalArea)
		 .unbind('mouseleave', handleExitCalArea);
	}
	
	
	/* Mouse Events
	----------------------------------------------------------------------------*/
	
	function handleEnterCalArea() {
		$(this).mousemove(handleMouseMove);
	};
	
	function handleExitCalArea() {
		$(this).unbind('mousemove', handleMouseMove);
		clearSelection();
		currentSlot = null;
	};
	
	function handleMouseMove(evt) {
		/*
		 * Called when moving the mouse within the view to trigger displaying 
		 * the preview overlays
		 */
		var date = t.positionTime(evt.pageX, evt.pageY);
		clearSelection();
		currentSlot = findSlot(date);
		if (currentSlot !== null) {
			renderSelection(currentSlot.start, currentSlot.end);
		}
	};
	
	function handleDragStop() {
		/*
		 * Called when event drag stops. Re-enable hover watching.
		 */
		enableAvailHover();
		$(t.element).trigger('mouseenter');
	};
	
	function handleDayClick(date, allDay, jsEvent, view) {
		/*
		 * Called first when the user clicks on a date. If we're within a 
		 * currently available slot, raise a new trigger with the slot 
		 * data
		 */
		if (currentSlot !== null) {
			t.calendar.trigger('availClick', t.element, currentSlot);
		}
	};
	
	/* Availability Rendering
	----------------------------------------------------------------------------*/
	
	function renderAvailEvents() {
		$(unavailEvents).each(function() {
			// TODO: all-day? 
			renderAvailability(this.start, this.end);
		});
	};
	
	function clearAvailEvents() {
		clearOverlays('avail');
	};
}