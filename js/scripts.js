/* jshint esversion:6*/
$(document).ready(function(){
	init();
});
//Defined functions
function init(){
	//Initiate datetimepicker
	$("#date").datetimepicker();
	//Prevent form refresh
	preventRefresh();
	//Initiate listeners
	initListeners();
	//Edit text
	editText();
	//Load stored toDos
	loadSavedToDos();
}
function arrowUp(button){
	button.closest(".todoDiv").prev().before(button.closest(".todoDiv"));
}
function arrowDown(button){
	button.closest(".todoDiv").next().after(button.closest(".todoDiv"));
}
function detailsText(detailsText){
	//show detailsText
	return detailsText.closest(".todoDiv").children().eq(1);
}
function remove(button){
	button.parent().fadeOut(function(){
		button.remove();
	});
	detailsText(button).fadeOut(function(){
		detailsText(button).remove();
	});
}
function registerInput(event){
	if(event.which == 13 && !$("#todoInput").is(":invalid") && $("#date").val() != ""){
		//Get todoText
		let todoText = $("input").val();
		//Get finishDate text
		let dateText = $("#date").val();
		// Get date of input
		let time = new Date();
		//Add new input to list
		let toDo = `${code1.replace(/\\/g, "")}${todoText}${code2.replace(/\\/g, "")}${time.toDateString()} / ${time.toTimeString().slice(0, 9)}  Finish by:  ${dateText}</p></div>`;
		//Save todo text to localStorage var
		storeToLocalStorage(toDo);
		$("ul").append(toDo);
	}
}
function preventRefresh(){
	$("form").submit(function(e) {
		e.preventDefault();
	});
}
function storeToLocalStorage(toDo){
	//If localStorage exists
	if(localStorage.getItem("savedToDos")){
		//Create savedToDoList
		let savedToDoList =[];
		//Split the string in LS into 2 or more
		let localStorageList = localStorage.getItem("savedToDos").split(",");
		//Merge the LS list with savedToDoList
		savedToDoList = localStorage.getItem("savedToDos").split(",");
		//Push new toDo to list
		savedToDoList.push(toDo);
		//Update LS with savedToDoList
		localStorage.setItem("savedToDos", savedToDoList.map(toDo => toDo));
	} else {
		let savedToDoList = [];
		savedToDoList.push(toDo);
		localStorage.setItem("savedToDos", savedToDoList.map(toDo => toDo));
	}
}
function loadSavedToDos(){
	if(localStorage.getItem("savedToDos")){
		let savedToDoList =[];
		let localStorageList = localStorage.getItem("savedToDos").split(",");
		savedToDoList.push(localStorageList);
		savedToDoList.forEach(toDo => $("ul").append(toDo));
	}
}
function newText(input, event, isRed, oldToDo){
	if(event.which == 13){
		let newText = input.val();
		//If text is empty don't allow edit
		if(newText != ""){
			if(isRed){
				let toDoDiv = input.closest(".todoDiv");
				let savedToDoList =[];
				//Split the string in LS into 2 or more
				let localStorageList = localStorage.getItem("savedToDos").split(",");
				//Parse every item of LS list separately(required because JSON gives error without spliting first)
				savedToDoList = localStorage.getItem("savedToDos").split(",");
				//Merge the LS list with savedToDoList
				savedToDoList = savedToDoList.concat(localStorageList);
				savedToDoList.forEach(function(toDo){
					//If todo matches with previous todo
					if(toDo == `<div class="todoDiv">${toDoDiv.html()}</div>`){
						//Replace text with new text
						input.replaceWith("<span class=\"text red\">" + newText + "</span>");
						//Now toDoDiv refers to the updated toDo
						savedToDoList[savedToDoList.indexOf(toDo)] = `<div class="todoDiv">${toDoDiv.html()}</div>` ;
						//Update localstorage
						localStorage.setItem("savedToDos", savedToDoList.map((toDo) => JSON.stringify(toDo)));
					}
				});
			} else {
				let toDoDiv = input.closest(".todoDiv");
				let savedToDoList =[];
				//Split the string in LS into 2 or more
				let localStorageList = localStorage.getItem("savedToDos").split(",");
				//Merge the LS list with savedToDoList
				savedToDoList = localStorage.getItem("savedToDos").split(",");
				savedToDoList.forEach(function(toDo){
					//If todo matches with previous todo
					if(toDo == `<div class="todoDiv">${oldToDo}</div>`){
						//Replace with new todo
						input.replaceWith("<span class=\"text\">" + newText + "</span>");
						//Now toDoDiv refers to the updated toDo
						savedToDoList[savedToDoList.indexOf(toDo)] = `<div class="todoDiv">${toDoDiv.html()}</div>` ;
						//Update localstorage
						localStorage.setItem("savedToDos", savedToDoList.map(toDo => toDo));
					}
				});
			}
		}
	}
}
function inputCreate(text, isRed, target){
	if(target.prev().is(".red")){
		isRed = true;
	} else {
		isRed = false;
	}
	target.prev().replaceWith("<input type=\"text\" class=\"newInput\"required></input>");
	target.prev().val(text);
	target.prev().focus();
	return isRed;
}
function editText(){
	$("ul").on("click", ".todoDiv li .fa-edit", function(){
		let oldToDo = $(this).closest(".todoDiv").html();
		let text = $(this).prev().text();
		let isRed;
		//Create input and get isRed
		isRed = inputCreate(text, isRed, $(this));
		//If lose focus cancel edit
		$($(this).prev()).focusout(function(){
			if(isRed){
				$(this).replaceWith("<span class=\"text red\">" + text + "</span>");
			} else {
				$(this).replaceWith("<span class=\"text\">" + text + "</span>");
			}
		});
		$(this).prev().keypress(function(event){
			//Replace text
			newText($(this), event, isRed, oldToDo);
		});
	});
}
function initListeners(){
	//Mark To Do as completed
	$("ul").on("click", ".text", function(){
		$(this).toggleClass("completed");
	});
	//Delete To Do and detailsText
	$("ul").on("click", ".delete", function(){
		let button = $(this);
		let savedToDoList =[];
		savedToDoList = localStorage.getItem("savedToDos").split(",");
		savedToDoList.forEach(function(toDo, i){
			//If todo matches with todo on list
			if(toDo == `<div class="todoDiv">${button.closest(".todoDiv").html()}</div>`){
				//Splice todo off of list
				savedToDoList.splice(i, 1);
				//Update localstorage
				localStorage.setItem("savedToDos", savedToDoList.map(toDo => toDo));
			}
		});
		remove($(this));
	});
	//Toggle input visibility
	$(".fa-plus").click(function(){
		$("#hide").fadeToggle(200);
	});
	//Toggle detailsText visibility
	$("ul").on("click", ".todoDiv li .details .fa-info", function(){
		detailsText($(this)).fadeToggle(400);
	});
	//Move li up
	$("ul").on("click",".todoDiv li .details .fa-arrow-up", function(){
		arrowUp($(this));
	});
	//Move li down
	$("ul").on("click",".todoDiv li .details .fa-arrow-down", function(){
		arrowDown($(this));
	});
	//Mark To-Do as important
	$("ul").on("click", ".todoDiv li .details .fa-bell", function(e){
		let toDoDiv = $(this).closest(".todoDiv").html();
		let savedToDoList =[];
		//Split the string in LS into 2 or more
		let localStorageList = localStorage.getItem("savedToDos").split(",");
		//Merge the LS list with savedToDoList
		savedToDoList = localStorage.getItem("savedToDos").split(",");
		savedToDoList.forEach(function(toDo){
			//If todo matches with previous todo
			if(toDo == `<div class="todoDiv">${toDoDiv}</div>`){
				//Replace with new todo
				$(e.target).toggleClass("red");
				$(e.target).parent().prev().prev().toggleClass("red");
				detailsText($(e.target)).toggleClass("red-bg");
				let newToDoDiv = $(e.target).closest(".todoDiv").html();
				//Now toDoDiv refers to the updated toDo
				savedToDoList[savedToDoList.indexOf(toDo)] = `<div class="todoDiv">${newToDoDiv}</div>` ;
				//Update localstorage
				localStorage.setItem("savedToDos", savedToDoList.map(toDo => toDo));
			}
		});
	});
	//Register todoInput
	$("#todoInput").keypress(function(event){
		//If pressed enter and inputs not empty
		registerInput(event);
	});
}
//HTML to insert when adding TO DO
const code1 = "<div class=\"todoDiv\"><li><span class=\"delete\"><i class=\"fa fa-trash\"></i></span><span class=\"text\">",
	code2 = "</span> <i class=\"fa fa-edit\"></i><span class=\"details\"><i class=\"fa fa-arrow-up\"></i><i class=\"fa fa-arrow-down\"></i>  <i class=\"fa fa-info\"></i><i class=\"fa fa-bell\"></i></span></li><p class=\"detailsText hidden\">Added: ";