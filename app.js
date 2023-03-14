const board = document.querySelector(".board");
const keyboard = document.querySelector(".keyboard");
import data from "./words.js";
const menuButtons = document.querySelectorAll(".menu  button");
//const container = document.querySelector("body > main");
const popupWrapper = document.querySelector(".popup");

//menu buttons actions
[...menuButtons].map((btn, index) => {
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		popupWrapper.classList.add("animate");
		if (index == 0) {
			popupWrapper.innerHTML = ` <div class="wrapper">
      <article>
        <h1>NASIL OYNANIR</h1>
				<svg class="close" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
				<path fill="#565758" d="m12,0c-6.62736,0 -12,5.3724 -12,12c0,6.62763 5.37264,12 12,12c6.62763,0 12,-5.37237 12,-12c0,-6.6276 -5.37237,-12 -12,-12zm-3.6,7.2c0.30698,0 0.62819,0.1032 0.86255,0.33723l2.73745,2.73717l2.73717,-2.73717c0.2352,-0.23403 0.55563,-0.33723 0.86283,-0.33723c0.3072,0 0.62763,0.1032 0.86283,0.33723c0.468,0.46917 0.468,1.25637 0,1.72554l-2.73723,2.73723l2.73723,2.73723c0.468,0.46917 0.468,1.25637 0,1.72554c-0.46923,0.468 -1.25643,0.468 -1.72565,0l-2.73717,-2.73717l-2.73745,2.73717c-0.46856,0.468 -1.25637,0.468 -1.7251,0c-0.46861,-0.46917 -0.46861,-1.25637 0,-1.72554l2.73695,-2.73723l-2.73695,-2.73723c-0.46861,-0.46917 -0.46861,-1.25637 0,-1.72554c0.23447,-0.23403 0.55546,-0.33723 0.86255,-0.33723z"></path>
			</svg>
        <h2>
          WORDLE'i 6 denemede bulun.
        </h2>
        <p>
          Her tahmin 5 harfli doğru bir kelime olmalıdır. Göndermek için <br/> enter'a basın.
          </p>
					<p>
          Her tahminden sonra kutucukların renkleri tahmininizin <br/> yakınlığına göre değişecektir.
          </p>
      </article>

      <div class="examples">
        <h3>Örnekler</h3>
        <div class="sample">
          <span class="correct">A</span>
          <span>B</span>
          <span>O</span>
          <span>N</span>
          <span>E</span>
        </div>
        <p>A harfi kelimede var ve doğru yerde.</p>

        <h3>Örnekler</h3>
        <div class="sample">
          <span>G</span>
          <span class="present">İ</span>
          <span>Z</span>
          <span>E</span>
          <span>M</span>
        </div>
        <p>İ harfi kelimede var fakat yanlış yerde</p>

        <h3>Örnekler</h3>
        <div class="sample">
          <span>F</span>
          <span>A</span>
          <span>L</span>
          <span>E</span>
          <span>Z</span>
        </div>
        <p>Z harfi kelimede yok.</p>

        <div>İstediğiniz kadar oynayabilirsiniz</div>

      </div>
    </div>`;
		}
	});
});

//close btn for  the pop-up
window.addEventListener("click", (e) => {
	if (e.target.classList.contains("close") || e.target.tagName == "path") {
		popupWrapper.classList.remove("animate");
	}
});

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
console.log(guessWord);

if (!isGameFinsished) {
	keyboard.addEventListener("click", (e) => {
		if (e.target.tagName == "BUTTON" || e.target.tagName == "svg") {
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
