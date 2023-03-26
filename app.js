const board = document.querySelector(".board");
const keyboard = document.querySelector(".keyboard");
import data from "./words.js";
const menuButtons = document.querySelectorAll(".menu  button");
const popupWrapper = document.querySelector(".popup");
const errorElement = document.querySelector(".error");
const resultElement = document.querySelector(".result");

async function newDay() {
	let res = await fetch("https://wordle-db.vercel.app/");
	res = await res.json();
	return res
		.find(({ date }) => date == new Date().toDateString())
		.word.toLocaleUpperCase();
}

function resetLocalStorage(newWord) {
	localStorage.setItem(
		"gameState",
		JSON.stringify({
			tile: 0,
			row: 0,
			table: new Array(6)
				.fill("")
				.map((el) => new Array(5).fill({ value: "", state: "" })),
			guessWord: newWord,
			isGameFinished: false,
		})
	);
}

//game variable
let guessWord, row, tile, table, currentDay, isGameFinished, virtualCopy;

//menu buttons actions
[...menuButtons].map((btn, index) => {
	btn.addEventListener("click", (e) => {
		e.stopPropagation();
		if (index == 0) {
			popupWrapper.classList.add("animate");
			popupWrapper.innerHTML = ` <div class="wrapper">
      <article>
        <h1>NASIL OYNANIR</h1>
				<svg class="close" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
				<path class="close" fill="#565758" d="m12,0c-6.62736,0 -12,5.3724 -12,12c0,6.62763 5.37264,12 12,12c6.62763,0 12,-5.37237 12,-12c0,-6.6276 -5.37237,-12 -12,-12zm-3.6,7.2c0.30698,0 0.62819,0.1032 0.86255,0.33723l2.73745,2.73717l2.73717,-2.73717c0.2352,-0.23403 0.55563,-0.33723 0.86283,-0.33723c0.3072,0 0.62763,0.1032 0.86283,0.33723c0.468,0.46917 0.468,1.25637 0,1.72554l-2.73723,2.73723l2.73723,2.73723c0.468,0.46917 0.468,1.25637 0,1.72554c-0.46923,0.468 -1.25643,0.468 -1.72565,0l-2.73717,-2.73717l-2.73745,2.73717c-0.46856,0.468 -1.25637,0.468 -1.7251,0c-0.46861,-0.46917 -0.46861,-1.25637 0,-1.72554l2.73695,-2.73723l-2.73695,-2.73723c-0.46861,-0.46917 -0.46861,-1.25637 0,-1.72554c0.23447,-0.23403 0.55546,-0.33723 0.86255,-0.33723z"></path>
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
	if (e.target.classList.contains("close")) {
		popupWrapper.classList.remove("animate");
		resultElement.classList.add("none");
	}
	if (e.target.classList.contains("replay")) {
		window.location.reload();
	} else if (e.target.classList.contains("share")) {
		let generetedString = gameIsOver(row)
			? new Array(6)
					.fill("")
					.map((el, i) => {
						if (i < row) return "🟥";
						if (i == row) return "🟩";
						return "⬛️";
					})
					.join("")
			: "🟥🟥🟥🟥🟥🟥";

		let copyString = `Wordle Türkçe ${
			row + 1
		}/6 \n\nhttps://wordle-clone-2-hazel.vercel.app/\n\n${generetedString}`;

		navigator.clipboard.writeText(copyString);
		//popup copied clipboard
		errorElement.classList.remove("none");
		errorElement.textContent = "Panoya Kopyalandı";
		setTimeout(() => {
			errorElement.classList.add("none");
		}, 1000);
	}
});

//actions when window loaded
window.addEventListener("load", async (e) => {
	let newWord = await newDay();
	row = JSON.parse(localStorage.getItem("gameState"))?.row || 0;
	tile = JSON.parse(localStorage.getItem("gameState"))?.tile || 0;
	isGameFinished =
		JSON.parse(localStorage.getItem("gameState"))?.isGameFinished || false;
	table =
		JSON.parse(localStorage.getItem("gameState"))?.table ||
		new Array(6)
			.fill("")
			.map((el) => new Array(5).fill({ value: "", state: "" }));

	// currentDay
	currentDay = new Date().toDateString();
	if (JSON.parse(localStorage.getItem("gameState"))?.guessWord == newWord) {
		guessWord = JSON.parse(localStorage.getItem("gameState"))?.guessWord;
	} else resetLocalStorage(newWord);

	virtualCopy = table.slice();

	//reset game if it is over
	if (isGameFinished) {
		for (let i = 0; i <= row; i++) {
			updateAndCreateTable(check(i), i);
		}
		setTimeout(() => {
			handleResult(row);
		}, 1000);
		return;
	}

	updateAndCreateTable(table);

	//click event
	keyboard.addEventListener("click", (e) => {
		if (e.target.tagName == "BUTTON" || e.target.tagName == "svg") {
			let val = e.target.textContent.trim().length
				? e.target.textContent
				: "Delete";

			if (tile > 5) {
				tile = 5;
			}

			if (tile < 5 && val == "Enter" && !isGameFinished) {
				shakeAnimation(row);
				errorElement.classList.remove("none");
				errorElement.textContent = "Yetersiz Harf";
				setTimeout(() => {
					errorElement.classList.add("none");
				}, 1000);
				return;
			}

			if (tile > 4 && val == "Enter" && !isGameFinished) {
				let word = virtualCopy[row]
					.map(({ value }) => value)
					.join("")
					.slice(0, 5)
					.toLocaleLowerCase("tr");

				if (data.includes(word)) {
					updateAndCreateTable(check(row), row);
					if (gameIsOver(row)) {
						//oyun sonu ekranını göster
						handleResult(row);
						isGameFinished = true;
						//update localstorage
						localStorage.setItem(
							"gameState",
							JSON.stringify({
								tile,
								row,
								table,
								guessWord,
								isGameFinished,
							})
						);

						return;
					}
					if (row == 5) {
						// burada oyun sonu ekranını göster
						handleResult(row);
						isGameFinished = true;
						//update localstorage
						localStorage.setItem(
							"gameState",
							JSON.stringify({
								tile,
								row,
								table,
								guessWord,
								isGameFinished,
							})
						);
						return;
					}
					tile = 0;
					row++;
				} else {
					shakeAnimation(row);
					errorElement.classList.remove("none");
					errorElement.textContent = "Kelime Listede Yok";
					setTimeout(() => {
						errorElement.classList.add("none");
					}, 1000);
				}
			} else if (val == "Delete" && tile > 0 && !isGameFinished) {
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

	//keyboard event
	window.addEventListener("keydown", (e) => {
		if (tile > 5) {
			tile = 5;
		}

		if (e.key.length > 1 && e.key != "Backspace" && e.key != "Enter") {
			return;
		}

		if (tile < 5 && e.key == "Enter") {
			shakeAnimation(row);
			errorElement.classList.remove("none");
			errorElement.textContent = "Yetersiz Harf";
			setTimeout(() => {
				errorElement.classList.add("none");
			}, 1000);
			return;
		}

		if (tile > 4 && e.key == "Enter" && !isGameFinished) {
			let word = virtualCopy[row]
				.map(({ value }) => value)
				.join("")
				.slice(0, 5)
				.toLocaleLowerCase("tr");

			if (data.includes(word)) {
				updateAndCreateTable(check(row), row);
				if (gameIsOver(row)) {
					// burada oyun sonu ekranını göster
					handleResult(row);
					isGameFinished = true;
					console.log("calisti");
					//update localstorage
					const currentDay = new Date().toDateString();
					localStorage.setItem(
						"gameState",
						JSON.stringify({
							tile,
							row,
							table,
							guessWord,
							isGameFinished,
							currentDay,
						})
					);
					return;
				}
				if (row == 5) {
					// burada oyun sonu ekranını göster
					handleResult(row);
					console.log("oyun bitti");
					isGameFinished = true;
					//update localstorage
					localStorage.setItem(
						"gameState",
						JSON.stringify({
							tile,
							row,
							table,
							guessWord,
							isGameFinished,
						})
					);
					return;
				}
				row++;
				tile = 0;
			} else {
				shakeAnimation(row);
				errorElement.classList.remove("none");
				errorElement.textContent = "Kelime Listede Yok";
				setTimeout(() => {
					errorElement.classList.add("none");
				}, 1000);
			}
		} else if (e.key == "Backspace" && tile > 0 && !isGameFinished) {
			updateAndCreateTable(handleDelete(tile));
			tile--;
		} else {
			if (e.key !== "Backspace") {
				updateAndCreateTable(handleInput(e.key.toLocaleUpperCase("tr")));
				tile++;
			}
		}
	});
});

//implement table
function updateAndCreateTable(table, currentStep = null) {
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

	if (typeof currentStep == "number") {
		spinAnimate(currentStep);
	}
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

	//virtual keyboard change color events
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
			el[tile] = {
				value: letter,
				state: "",
			};
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
			el[step - 1] = {
				value: "",
				state: "",
			};
		}
		return el;
	});
	virtualCopy = newTable.slice();
	return newTable;
}

//spin animation
function spinAnimate(row) {
	[
		...document
			.querySelectorAll(`.board .wrapper`)
			[row].querySelectorAll(".cell"),
	].map((el, i) => {
		setTimeout(() => {
			el.style.animation = "spin 400ms ease";
		}, i * 100);
	});
}

//shake animation
function shakeAnimation(row) {
	document.querySelectorAll(`.board .wrapper`)[row].style.animation =
		"shake 200ms ease";
}

function handleResult(step) {
	resultElement.classList.remove("none");
	resultElement.innerHTML = `
	<div>
	<svg class="close" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
		<path class="close" fill="#565758"
			d="m12,0c-6.62736,0 -12,5.3724 -12,12c0,6.62763 5.37264,12 12,12c6.62763,0 12,-5.37237 12,-12c0,-6.6276 -5.37237,-12 -12,-12zm-3.6,7.2c0.30698,0 0.62819,0.1032 0.86255,0.33723l2.73745,2.73717l2.73717,-2.73717c0.2352,-0.23403 0.55563,-0.33723 0.86283,-0.33723c0.3072,0 0.62763,0.1032 0.86283,0.33723c0.468,0.46917 0.468,1.25637 0,1.72554l-2.73723,2.73723l2.73723,2.73723c0.468,0.46917 0.468,1.25637 0,1.72554c-0.46923,0.468 -1.25643,0.468 -1.72565,0l-2.73717,-2.73717l-2.73745,2.73717c-0.46856,0.468 -1.25637,0.468 -1.7251,0c-0.46861,-0.46917 -0.46861,-1.25637 0,-1.72554l2.73695,-2.73723l-2.73695,-2.73723c-0.46861,-0.46917 -0.46861,-1.25637 0,-1.72554c0.23447,-0.23403 0.55546,-0.33723 0.86255,-0.33723z">
		</path>
	</svg>
	<h2>  ${
		gameIsOver(step)
			? "Tebrikler " + (step + 1) + " adımda bildiniz"
			: "<br/><br/>" + "Kelime :" + guessWord
	}</h2>
	<div class="buttons">
		<button class="replay">Yeniden Oyna</button>
		<button class="share">Paylaş
			<svg class="share" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
				<path class="share" fill="#fff"
					d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z">
				</path>
			</svg>
	</div>

	</button>
	</div>`;
}
