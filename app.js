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
				time: "22/01/2019"
			},
			{
				id: 2,
				name: "Task 2",
				desc: "Task  desc",
				time: "23/01/2019"
			},
			{
				id: 3,
				name: "Task 3",
				desc: "Task 3 desc",
				time: "24/01/2019"
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
		taskTime: "#task-date",
		submitBtn: ".submit-btn",
		form: "form",
		taskList: "#task-list"
	};

	return {
		initDatePicker: function() {
			const elems = document.querySelectorAll(".datepicker");
			const instances = M.Datepicker.init(elems, {
				autoClose: true,
				format: "dd/mm/yyyy",
				firstDay: 1,
				minDate: new Date()
			});
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
							<button class="details-btn btn-flat col s3">Details</button>
					</li>
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
			time: document.querySelector(UISelectors.taskTime).value,
		};
		// Add task to tasks array
		TaskCtrl.addTask(task);
		UICtrl.loadTasks();
	};
	return {
		init: function() {
			loadEventListeners();
			UICtrl.initDatePicker();
			UICtrl.loadTasks();
		}
	};
})(UICtrl, TaskCtrl, StorageCtrl);

AppCtrl.init();