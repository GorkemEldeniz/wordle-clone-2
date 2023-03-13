const board = document.querySelector(".board");

//create table
let table = new Array(6)
	.fill("")
	.map((el) => new Array(5).fill({ value: "", state: "" }));

let virtualCopy = table.slice();

//implement table
function updateAndCreateTable(table) {
	board.innerHTML = "";
	for (let row = 0; row < table.length; row++) {
		let wrapper = document.createElement("div");
		wrapper.classList.add("wrapper");
		for (let tile = 0; tile < 5; tile++) {
			let cell = document.createElement("span");
			let { value, state } = table[row][tile];
			cell.classList.add("cell");
			cell.textContent = value;
			cell.dataset.state = state;
			wrapper.appendChild(cell);
		}
		board.appendChild(wrapper);
	}
}

updateAndCreateTable(table);

let row = 0;
let tile = 0;
let guessWord = "ELMAS";
let isGameFinsished = false;
let regex = /^[a-zA-Z\s]+$/;

window.addEventListener("keydown", (e) => {
	if (isGameFinsished) {
		console.log("oyun bitti");
		return;
	}
	if (tile > 5) {
		tile = 5;
	}

	if (e.key.length > 1 && e.key != "Backspace" && e.key != "Enter") {
		return;
	}

	if (tile < 5 && e.key == "Enter") {
		return;
	}

	if (tile > 4 && e.key == "Enter") {
		updateAndCreateTable(check(row));
		if (gameIsOver(row)) {
			isGameFinsished = true;
		}
		tile = 0;
		row++;
	} else if (e.key == "Backspace" && tile >= 0) {
		updateAndCreateTable(handleDelete(tile));
		tile--;
	} else {
		updateAndCreateTable(handleInput(e));
		tile++;
	}
});

//check is word is true
function check(row) {
	let elements = virtualCopy[row].map((el, i) => {
		let state = "";
		if (el.value == guessWord[i]) {
			state = "correct";
		} else if (guessWord.includes(el.value)) {
			state = "present";
		} else {
			state = "absent";
		}
		return {
			value: el.value,
			state,
		};
	});

	let newTable = virtualCopy.map((el, i) => {
		if (i == row) {
			return elements;
		}
		return el;
	});

	virtualCopy = newTable.slice();
	console.log(virtualCopy);
	return virtualCopy;
}

//check gameisover
function gameIsOver(row) {
	return virtualCopy[row].every((el) => el.state == "correct");
}

//get the input from user
function handleInput(e) {
	let newTable = virtualCopy.map((el, index) => {
		if (index == row) {
			el[tile] = { value: e.key.toUpperCase(), state: "" };
		}
		return el;
	});
	virtualCopy = newTable.slice();
	return newTable;
}

//handle delete
function handleDelete(step) {
	let newTable = virtualCopy.map((el, index) => {
		if (index == row) {
			el[step - 1] = { value: "", state: "" };
		}
		return el;
	});
	virtualCopy = newTable.slice();
	return newTable;
}

//handle Submit
function handleSubmit(e) {
	return;
}
