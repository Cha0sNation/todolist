// Storage Controller
const StorageCtrl = (function() {
	return {
		getStoredTasks: function() {
			if (localStorage.getItem("tasks")) {
				return JSON.parse(localStorage.getItem("tasks"));
			}
			return [];
		},
		storeTask: function(task) {
			let tasks = this.getStoredTasks();
			tasks.push(task);
			localStorage.setItem("tasks", JSON.stringify(tasks));
		},
		updateStoredTask: function(tasks, updatedTask) {
			for (let task of tasks) {
				if (task.id == updatedTask.id) {
					task.name = updatedTask.name;
					task.desc = updatedTask.desc;
					task.time.general = updatedTask.time.general;
					task.time.specific = updatedTask.time.specific;
				}
			}
			localStorage.setItem("tasks", JSON.stringify(tasks));
		},
		deleteStoredTask: function(task) {
			let tasks = this.getStoredTasks();
			for (const [i, task] of tasks.entries()) {
				if (task.id == tasks[i].id) {
					tasks.splice(i, 1);
					localStorage.setItem("tasks", JSON.stringify(tasks));
				}
			}
		}
	};

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
		],
		currentTask: null
	};
	return {
		addTask: function(task) {
			const newTask = new Task(task.name, task.desc, task.time);
			data.tasks.push(newTask);
		},
		deleteTask: function(id) {
			for (const [i, task] of data.tasks.entries()) {
				if (id == task.id) {
					data.tasks.splice(i, 1);
				}
			}
		},
		generateID: function() {
			if (data.tasks.length == 0) {
				return 0;
			} else {
				return data.tasks.length;
			}
		},
		getTasks: function() {
			return data.tasks;
		},
		findTask: function(id) {
			for (const task of data.tasks) {
				if (task.id == id) {
					return task;
				}
			}
		},
		updateTask: function(id, newTask) {
			for (let task of data.tasks) {
				if (task.id == id) {
					task.name = newTask.name;
					task.desc = newTask.desc;
					task.time.general = newTask.time.general;
					task.time.specific = newTask.time.specific;
				}
			}
		},
		setCurrentTask: function(task) {
			data.currentTask = task;
		},
		getCurrentTask: function() {
			return data.currentTask;
		},
		setTasks: function(tasks) {
			data.tasks = tasks;
		}
	};
})();

// UI Controller
const UICtrl = (function() {
	const UISelectors = {
		create: "#create",
		taskName: "#task-name",
		taskDesc: "#task-description",
		taskDate: "#task-date",
		taskTime: "#task-time",
		submitBtn: ".submit-btn",
		submitForm: "#submit-form",
		editForm: "#edit-form",
		taskList: "#task-list",
		modalEdit: ".modal-edit",
		modalDelete: ".modal-delete"
	};
	const timeDifference = function(userTime) {
		// Split the date we get from the user
		const [userDay, userMonth, userYear] = userTime.general.split("/");
		// Get current date and time values
		const [currDay, currMonth, currYear, currHours, currMinutes] = [new Date().getDate(), new Date().getMonth(), new Date().getFullYear(), new Date().getHours(), new Date().getMinutes()];
		// Convert the current date and the user date to milliseconds
		const currMill = new Date(currYear, currMonth, currDay).getTime();
		const userMill = new Date(userYear, userMonth - 1, userDay).getTime();
		let specificDiff = 0;
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
			UICtrl.updateTaskList(tasks);
		},
		clearForm: function() {
			document.querySelector(UISelectors.taskName).value = "";
			document.querySelector(UISelectors.taskDesc).value = "";
			document.querySelector(UISelectors.taskDate).value = "";
			document.querySelector(UISelectors.taskTime).value = "";
		},
		updateTaskList: function(tasks) {
			const taskList = document.querySelector(UISelectors.taskList);
			taskList.innerHTML = "";
			if (tasks.length == 0) {
				taskList.style.display = "none";
			} else {
				taskList.style.display = "block";
			}
			for (const task of tasks) {
				taskList.innerHTML +=
					`
					<li class="collection-item row" id="task-${task.id}">
						<span class="col s9">${task.name}</span>
						<button class="details-btn btn-flat col s3 modal-trigger" data-target="modal-${task.id}">Details</button>
					</li>
					<div id="modal-${task.id}" class="modal">
						<div class="modal-content">
							<h4 class="task-name">${task.name}</h4>
							<p class="task-desc">${task.desc}</p>
							<p class="task-time">Finish by: ${task.time.general} | ${task.time.specific || "Not set"}</p>
							<em>${timeDifference(task.time)}</em>
						</div>
						<div class="modal-footer row">
							<button href="#!" class="modal-delete waves-effect waves-red btn-flat pull-s12">Delete</button>
							<button href="#!" class="modal-edit waves-effect waves-yellow btn-flat">Edit</button>
							<button href="#!" class="modal-close waves-effect btn-flat">Close</button>
						</div>
					</div>
					`;
			}
		},
		validForms: function() {
			if (document.querySelector(UISelectors.taskName).value != "" &&
				document.querySelector(UISelectors.taskDesc).value != "" &&
				document.querySelector(UISelectors.taskDate).value != "") {
				return true;
			}
			return false;
		}

	};
})();

// App controller
const AppCtrl = (function(UICtrl, TaskCtrl, StorageCtrl) {
	const UISelectors = UICtrl.getUISelectors();
	const loadEventListeners = function() {
		// Submit task when submit button is clicked
		document.querySelector(UISelectors.create).addEventListener("click", function(e) {
			if (e.target.id == "back-btn") {
				e.target.parentNode.removeChild(e.target);
				document.querySelector(UISelectors.submitBtn).className = "submit-btn btn-flat waves-effect col s12";
				document.querySelector(UISelectors.submitBtn).innerText = "Add Task";
				document.querySelector("form").id = "submit-form";
				UICtrl.clearForm();
			}
			else if (e.target.getAttribute("type") == "submit") {
				if (document.querySelector("form").id == "edit-form" && UICtrl.validForms()) {
					editTask();
					UICtrl.clearForm();
					/* eslint-disable-next-line no-undef*/
					M.updateTextFields();
					e.preventDefault();
				}
				else if (document.querySelector("form").id == "submit-form" && UICtrl.validForms()) {
					submitTask();
					/* eslint-disable-next-line no-undef*/
					M.updateTextFields();
					UICtrl.clearForm();
					e.preventDefault();
				}
			}
		});
		document.querySelector("form").addEventListener("submit", (e) => {
			e.preventDefault();
		});
		const editButtons = document.querySelectorAll(UISelectors.modalEdit);
		for (const button of editButtons) {
			button.addEventListener("click", function(e) {
				// Get id of selected task
				const id = button.parentElement.parentElement.id.slice(6);
				// Find task by id and set currentTask to that task
				TaskCtrl.setCurrentTask(TaskCtrl.findTask(id));
				const task = TaskCtrl.getCurrentTask();
				if (document.querySelector(UISelectors.submitForm)) {
					document.querySelector(UISelectors.submitForm).id = "edit-form";
				}
				document.querySelector(UISelectors.taskName).value = task.name;
				document.querySelector(UISelectors.taskDesc).value = task.desc;
				document.querySelector(UISelectors.taskDate).value = task.time.general;
				document.querySelector(UISelectors.taskTime).value = task.time.specific;

				document.querySelector(UISelectors.submitBtn).innerText = "Edit Task";
				document.querySelector(UISelectors.submitBtn).className = "submit-btn btn-flat waves-effect col s6";

				const backButton = document.createElement("button");
				backButton.className = "back-btn btn-flat waves-effect col s6";
				backButton.id = "back-btn";
				backButton.innerText = "Back";
				if (!document.querySelector("#back-btn")) {
					document.querySelector("form").after(document.querySelector(UISelectors.submitBtn), backButton);
				}

				/* eslint-disable-next-line no-undef*/
				M.updateTextFields();
				button.nextElementSibling.click();
			});
		}
		const deleteButtons = document.querySelectorAll(UISelectors.modalDelete);
		for (const button of deleteButtons) {
			button.addEventListener("click", () => {
				const id = button.parentElement.parentElement.id.slice(6);
				TaskCtrl.deleteTask(id);
				StorageCtrl.deleteStoredTask(TaskCtrl.findTask(id));
				UICtrl.loadTasks();
			});
		}
		document.querySelector(".datepicker").addEventListener("focus", (e) => {
			if (e.target.value == "") {
				/* eslint-disable-next-line no-undef*/
				var instance = M.Datepicker.getInstance(e.target);
				instance.open();
			}
		});
		document.querySelector(".timepicker").addEventListener("focus", (e) => {
			if (e.target.value == "") {
				/* eslint-disable-next-line no-undef*/
				var instance = M.Timepicker.getInstance(e.target);
				instance.open();
			}
		});
	};
	// Submit New Task
	const submitTask = function() {
		// Create task from input values
		const task = {
			id: TaskCtrl.generateID(),
			name: document.querySelector(UISelectors.taskName).value,
			desc: document.querySelector(UISelectors.taskDesc).value,
			time: {
				general: document.querySelector(UISelectors.taskDate).value,
				specific: document.querySelector(UISelectors.taskTime).value
			}
		};
		// Add task to tasks array
		TaskCtrl.addTask(task);
		StorageCtrl.storeTask(task);
		UICtrl.loadTasks();
		UICtrl.initModals();
	};
	const editTask = function() {
		const task = {
			name: document.querySelector(UISelectors.taskName).value,
			desc: document.querySelector(UISelectors.taskDesc).value,
			time: {
				general: document.querySelector(UISelectors.taskDate).value,
				specific: document.querySelector(UISelectors.taskTime).value
			}
		};
		TaskCtrl.updateTask(TaskCtrl.getCurrentTask().id, task);
		StorageCtrl.updateStoredTask(TaskCtrl.getTasks(), task);
		document.querySelector(UISelectors.editForm).id = "submit-form";
		document.querySelector(UISelectors.submitBtn).className = "submit-btn btn-flat waves-effect col s12";
		document.querySelector(UISelectors.submitBtn).innerText = "Add Task";
		document.querySelector("#back-btn").parentNode.removeChild(document.querySelector("#back-btn"));
		UICtrl.loadTasks();
		UICtrl.initModals();
	};
	return {
		init: function() {
			UICtrl.clearForm();
			UICtrl.initDatePicker();
			UICtrl.initTimePicker();
			TaskCtrl.setTasks(StorageCtrl.getStoredTasks());
			UICtrl.loadTasks();
			UICtrl.initModals();


			loadEventListeners();
		}
	};
})(UICtrl, TaskCtrl, StorageCtrl);

AppCtrl.init();