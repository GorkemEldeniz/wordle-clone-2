const board = document.querySelector(".board");
const keyboard = document.querySelector(".keyboard");
import data from "./words.js";

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
let guessWord =
	data[Math.floor(Math.random() * data.length)].toLocaleUpperCase("tr");
let isGameFinsished = false;

if (!isGameFinsished) {
	keyboard.addEventListener("click", (e) => {
		if (e.target.tagName == "BUTTON" || e.target.tagName == "SVG") {
			let val = e.target.textContent.trim().length
				? e.target.textContent
				: "Delete";

			if (tile > 5) {
				tile = 5;
			}

			if (tile < 5 && val == "Enter") {
				return;
			}

			if (tile > 4 && val == "Enter") {
				let word = virtualCopy[row]
					.map(({ value }) => value)
					.join("")
					.slice(0, 5)
					.toLocaleLowerCase("tr");

				if (data.includes(word)) {
					updateAndCreateTable(check(row));
					if (gameIsOver(row)) {
						isGameFinsished = true;
						return;
					}
					tile = 0;
					row++;
				}
			} else if (val == "Delete" && tile > 0) {
				updateAndCreateTable(handleDelete(tile));
				tile--;
			} else {
				if (val !== "Delete") {
					updateAndCreateTable(handleInput(val));
					tile++;
				}
			}
		}
	});

	window.addEventListener("keydown", (e) => {
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
			let word = virtualCopy[row]
				.map(({ value }) => value)
				.join("")
				.slice(0, 5)
				.toLocaleLowerCase("tr");

			if (data.includes(word)) {
				updateAndCreateTable(check(row));
				if (gameIsOver(row)) {
					isGameFinsished = true;
					return;
				}
				tile = 0;
				row++;
			}
		} else if (e.key == "Backspace" && tile > 0) {
			updateAndCreateTable(handleDelete(tile));
			tile--;
		} else {
			if (e.key !== "Backspace") {
				updateAndCreateTable(handleInput(e.key.toLocaleUpperCase("tr")));
				tile++;
			}
		}
	});
}

//check is word is true
function check(row) {
	let signedLetters = [];
	const buttons = document.querySelectorAll(".keyboard button");

	let elements = virtualCopy[row].map((el, i) => {
		let state = "";
		if (el.value == guessWord[i]) {
			signedLetters.push({ state: "correct", value: el.value, priority: 2 });
			state = "correct";
		} else if (guessWord.includes(el.value)) {
			signedLetters.push({ state: "present", value: el.value, priority: 1 });
			state = "present";
		} else {
			signedLetters.push({ state: "absent", value: el.value, priority: 0 });
			state = "absent";
		}
		return {
			value: el.value,
			state,
		};
	});

	[...buttons].map((button, index) => {
		let ar = signedLetters.filter(({ value }) => value == button.textContent);
		if (ar.length && !button.classList.contains("correct")) {
			let { state } = ar.sort((a, b) => b.priority - a.priority)[0];
			button.classList.add(`${state}`);
		}
	});

	let newTable = virtualCopy.map((el, i) => {
		if (i == row) {
			return elements;
		}
		return el;
	});

	virtualCopy = newTable.slice();
	return virtualCopy;
}

//check gameisover
function gameIsOver(row) {
	return virtualCopy[row].every((el) => el.state == "correct");
}

//get the input from user
function handleInput(letter) {
	let newTable = virtualCopy.map((el, index) => {
		if (index == row) {
			el[tile] = { value: letter, state: "" };
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
