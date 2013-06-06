/*
 *  Availability manager - this is just like EventManager but deals with
 *  availability data instead of events.
 * 
 *  This must be imported _after_ the EventManager
 */
function AvailabilityManager(options, _availSources) {
	var t = this;
	
	// exports
	t.addAvailabilitySource = addAvailabilitySource;
	t.removeAvailabilitySource = removeAvailabilitySource;
	t.isAvailEvent = isAvailEvent;
	
	// imports
	var addEventSource = t.addEventSource;
	var removeEventSource = t.removeEventSource;
	var getView = t.getView;
	
	for (var i=0; i<_availSources.length; i++) {
		_addAvailabilitySource(_availSources[i]);
	}
	
	/* Sources
	-----------------------------------------------------------------------------*/
	

	function addAvailabilitySource(source) {
		source = _getAvailabilitySource(source);
		if (source) {
			addEventSource(source);
		}
	}
	
	function removeAvailabilitySource(source) {
		source = _getAvailabilitySource(source);
		if (source) {
			removeEventSource(source);
		}
		getView().clearAvailEvents();
	};
	
	function _transformEventData(evt) {
		/*
		 * post-process availability events, we stick an empty title in
		 * to keep the EventManager happy.
		 */
		return $.extend({title: ''}, evt);
	};
	
	function _getAvailabilitySource(source) {
		if ($.isFunction(source) || $.isArray(source)) {
			source =  { events: source };
		}
		else if (typeof source == 'string') {
			source =  { url: source };
		}
		if (typeof source == 'object') {
			// Set flag for availability sources
			source._isAvail = true;
			
			// Post-process events
			if ($.isFunction(source.eventDataTransform)) {
				var old = source.eventDataTransform;
				source.eventDataTransform = function(evt) {
					return _transformEventData(old(evt));
				}
			}
			else {
				source.eventDataTransform = _transformEventData;
			}
			return source;
		}
	}
	
	function isAvailEvent(evt) {
		/*
		 * Filter function for availability events
		 */
		return evt.source && evt.source._isAvail === true;
	}
};	