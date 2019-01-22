// Storage Controller
const StorageCtrl = (function() {

})();

// Task Controller
const TaskCtrl = (function() {
	const Task = function(name, desc, time) {
		this.name = name;
		this.desc = desc;
		this.time = time;
	};
	let data = {
		tasks: [
			{
				id: 0,
				name: "Task 1",
				desc: "Task 1 desc",
				time: {
					general: "22/01/2019",
					specific: "19:20"
				}
			},
			{
				id: 2,
				name: "Task 2",
				desc: "Task  desc",
				time: {
					general: "23/01/2019",
					specific: "05:30"
				}
			},
			{
				id: 3,
				name: "Task 3",
				desc: "Task 3 desc",
				time: {
					general: "24/01/2019",
					specific: "12:24"
				}
			}
		],
		currentTask: null
	};
	return {
		addTask: function(task) {
			const newTask = new Task(task.name, task.desc, task.time);
			data.tasks.push(newTask);
		},
		getTasks: function() {
			return data.tasks;
		}
	};
})();

// UI Controller
const UICtrl = (function() {
	const UISelectors = {
		taskName: "#task-name",
		taskDesc: "#task-description",
		taskDate: "#task-date",
		taskTime: "#task-time",
		submitBtn: ".submit-btn",
		form: "form",
		taskList: "#task-list",
		modalTrigger: ".modal-trigger"
	};
	const timeDifference = function(userTime) {
		// Split the date we get from the user
		const [userDay, userMonth, userYear] = userTime.general.split("/");
		// Get current date and time values
		const [currDay, currMonth, currYear, currHours, currMinutes] = [new Date().getDate(), new Date().getMonth(), new Date().getFullYear(), new Date().getHours(), new Date().getMinutes()];
		// Convert the current date and the user date to milliseconds
		const currMill = new Date(currYear, currMonth, currDay).getTime();
		const userMill = new Date(userYear, userMonth - 1, userDay).getTime();
		let specificDiff;
		// If user has specified hours and minutes
		if (userTime.specific) {
			const [hours, minutes] = userTime.specific.split(":");
			// Convert current hours and minutes and user hours and minutes to milliseconds
			const specificUserMill = Number(hours) * 3600000 + Number(minutes) * 60000;
			const specificCurrMill = currHours * 3600000 + currMinutes * 60000;
			// If user time is later than current time subtract current from user.
			// Ex:
			// user is 20:35 while current is 15:30
			// else substract user from current
			// Ex:
			// user is 13:15 while current is 21:50
			if (specificUserMill > specificCurrMill) {
				specificDiff = specificUserMill - specificCurrMill;
			} else {
				specificDiff = specificCurrMill - specificUserMill;
			}
		}
		// Get the general difference between dates, add difference of time(hours and minutes) and divide with 1000 to get seconds
		let diff = ((userMill - currMill) + specificDiff) / 1000;
		let formattedDiff = {
			minutes: 0,
			hours: 0,
			days: 0
		};
		// Format date
		while (diff >= 60) {
			diff -= 60;
			formattedDiff.minutes++;
		}
		while (formattedDiff.minutes >= 60) {
			formattedDiff.minutes -= 60;
			formattedDiff.hours++;
		}
		while (formattedDiff.hours >= 24) {
			formattedDiff.hours -= 24;
			formattedDiff.days++;
		}
		return `You have ${formattedDiff.minutes} minute(s), ${formattedDiff.hours} hour(s) and ${formattedDiff.days} day(s) to finish this task.`;
	};
	return {
		initDatePicker: function() {
			const elems = document.querySelectorAll(".datepicker");
			/* eslint-disable-next-line no-undef*/ /*eslint-disable-next-line no-unused-vars*/
			const instances = M.Datepicker.init(elems, {
				autoClose: true,
				format: "dd/mm/yyyy",
				firstDay: 1,
				minDate: new Date()
			});
		},
		initTimePicker: function() {
			const elems = document.querySelectorAll(".timepicker");
			/* eslint-disable-next-line no-undef*/ /*eslint-disable-next-line no-unused-vars*/
			const instances = M.Timepicker.init(elems, {
				twelveHour: false
			});
		},
		initModals: function() {
			const elems = document.querySelectorAll(".modal");
			/* eslint-disable-next-line no-undef*/ /*eslint-disable-next-line no-unused-vars*/
			const instances = M.Modal.init(elems, {});
		},
		getUISelectors: function() {
			return UISelectors;
		},
		loadTasks: function() {
			// Get tasks
			const tasks = TaskCtrl.getTasks();
			//Update UI
			UICtrl.updateTasks(tasks);
		},
		updateTasks: function(tasks) {
			const taskList = document.querySelector(UISelectors.taskList);
			taskList.innerHTML = "";
			for (const task of tasks) {
				taskList.innerHTML +=
					`
					<li class="collection-item row" id="task-${task.id}">
						<span class="col s9">${task.name}</span>
						<button class="details-btn btn-flat col s3 modal-trigger" data-target="modal-${task.id}">Details</button>
					</li>
					<div id="modal-${task.id}" class="modal">
						<div class="modal-content">
							<h4>${task.name}</h4>
							<p>${task.desc}</p>
							<em>${timeDifference(task.time)}</em>
						</div>
						<div class="modal-footer">
							<button href="#!" class="modal-close waves-effect waves-green btn-flat">Close</button>
						</div>
					</div>
					`;
			}
		}
	};
})();

// App controller
const AppCtrl = (function(UICtrl, TaskCtrl, StorageCtrl) {
	const UISelectors = UICtrl.getUISelectors();
	const loadEventListeners = function() {
		// Submit task when submit button is clicked
		document.querySelector(UISelectors.form).addEventListener("submit", function(e) {
			e.preventDefault();
			submitTask();
		});
	};
	// Submit New Task
	const submitTask = function() {
		// Create task from input values
		const task = {
			name: document.querySelector(UISelectors.taskName).value,
			desc: document.querySelector(UISelectors.taskDesc).value,
			time: {
				general: document.querySelector(UISelectors.taskDate).value,
				specific: document.querySelector(UISelectors.taskTime).value
			}
		};
		// Add task to tasks array
		TaskCtrl.addTask(task);
		UICtrl.loadTasks();
	};
	return {
		init: function() {
			UICtrl.initDatePicker();
			UICtrl.initTimePicker();
			UICtrl.loadTasks();
			UICtrl.initModals();


			loadEventListeners();
		}
	};
})(UICtrl, TaskCtrl, StorageCtrl);

AppCtrl.init();