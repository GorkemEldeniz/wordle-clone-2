const options = {
	method: "GET",
	url: "https://wordle-answers-solutions.p.rapidapi.com/today",
	headers: {
		"X-RapidAPI-Key": "SIGN-UP-FOR-KEY",
		"X-RapidAPI-Host": "wordle-answers-solutions.p.rapidapi.com",
	},
};

fetch("https://wordle-answers-solutions.p.rapidapi.com/today", options)
	.then(function (response) {
		console.log(response.data);
	})
	.catch(function (error) {
		console.error(error);
	});
