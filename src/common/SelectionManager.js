
//BUG: unselect needs to be triggered when events are dragged+dropped

function SelectionManager() {
	var t = this;


	// exports
	t.select = select;
	t.unselect = unselect;
	t.reportSelection = reportSelection;
	t.daySelectionMousedown = daySelectionMousedown;


	// imports
	var opt = t.opt;
	var trigger = t.trigger;
	var defaultSelectionEnd = t.defaultSelectionEnd;
	var renderSelection = t.renderSelection;
	var clearSelection = t.clearSelection;
	var getViewName = t.getViewName;


	// locals
	var selected = false;



	// unselectAuto
	if (opt('selectable') && opt('unselectAuto')) {
		$(document).mousedown(function(ev) {
			var ignore = opt('unselectCancel');
			if (ignore) {
				if ($(ev.target).parents(ignore).length) { // could be optimized to stop after first match
					return;
				}
			}
			unselect(ev);
		});
	}


	function select(startDate, endDate, allDay, resourceId) {
		unselect();
		if (!endDate) {
			endDate = defaultSelectionEnd(startDate, allDay);
		}
		if (resourceId !== undefined) {
			var resource, row;
			var resourceRenderEnd = addMinutes(cloneDate(endDate), opt('slotMinutes') * -1);
			$.each(t.getResources || [], function(index, r) {
				if (r.id === resourceId) {
					resource = r;
					row = index;
					return false;
				}
			});
		}
		renderSelection(startDate, resourceRenderEnd ? resourceRenderEnd : endDate, allDay, row);
		reportSelection(startDate, endDate, allDay, null, resource);
	}


	function unselect(ev) {
		if (selected) {
			selected = false;
			clearSelection();
			trigger('unselect', null, ev);
		}
	}


	function reportSelection(startDate, endDate, allDay, ev, resource) {
		if (typeof resource == 'object' && resource.readonly === true) {
			return false;
		}

		selected = true;
		trigger('select', null, startDate, endDate, allDay, ev, '', resource);
	}


	function daySelectionMousedown(ev) { // not really a generic manager method, oh well
		var cellDate = t.cellDate;
		var cellIsAllDay = t.cellIsAllDay;
		var hoverListener = t.getHoverListener();
		var reportDayClick = t.reportDayClick; // this is hacky and sort of weird
		var row;
		var resources = t.getResources || [];
		var resourceRO;

		var viewName = getViewName();
		if (ev.which == 1 && opt('selectable')) { // which==1 means left mouse button
			unselect(ev);
			var _mousedownElement = this;
			var dates;
			hoverListener.start(function(cell, origCell) { // TODO: maybe put cellDate/cellIsAllDay info in cell
				clearSelection();

				if (cell) {
					resourceRO = typeof resources[cell.row] == 'object' ? resources[cell.row].readonly : false;
				}


				if (cell && cellIsAllDay(cell) && resourceRO !== true) {
					dates = [ cellDate(origCell), cellDate(cell) ].sort(cmp);
					renderSelection(dates[0], dates[1], (viewName == 'resourceDay' ? false : true), cell.row);
					row = cell.row;
				}else{
					dates = null;
				}
			}, ev);
			$(document).one('mouseup', function(ev) {
				hoverListener.stop();
				if (dates) {
					if (+dates[0] == +dates[1]) {
						reportDayClick(dates[0],(viewName == 'resourceDay' ? false : true), ev, resources[row]);
					}
					reportSelection(dates[0], (viewName == 'resourceDay' ? addMinutes(dates[1], opt('slotMinutes')) : dates[1]), (viewName == 'resourceDay' ? false : true), ev, resources[row]);
				}
			});
		}
	}


}
