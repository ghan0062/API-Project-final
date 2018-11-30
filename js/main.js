let mirnaCode = (function () {
	/* globals APIKEY */

    const movieDataBaseURL = "https://api.themoviedb.org/3/";
    let imageURL = null;
    let imageSizes = [];
    let searchString = "";
    let pages = [];
    let timeKey = "timeKey";
    let staleDataTimeOut = 3600;
    let h3 = null;
    document.addEventListener("DOMContentLoaded", init);

    function init() {
        pages = document.querySelectorAll(".page");
        console.log(pages);
        document.querySelector(".settingsButton").addEventListener("click", showOverlay);
        document.querySelector(".cancelButton").addEventListener("click", hideOverlay);
        document.querySelector(".overlay").addEventListener("click", hideOverlay);
        document.querySelector(".saveButton").addEventListener("click", function (e) {
            let videoList = document.getElementsByName("Video");
            let videoType = null;
            for (let i = 0; i < videoList.length; i++) {
                if (videoList[i].checked) {
                    videoType = videoList[i].value;
                    break;
                }
            }
            alert(videoType);
            console.log("You picked " + videoType);
            hideOverlay(e);

        });



		//    console.log(APIKEY);
        addEventListener();
        getLocalStorageData();


    }

    function showOverlay(e) {
        e.preventDefault();
        let overlay = document.querySelector(".overlay");
        overlay.classList.remove("hide");
        overlay.classList.add("show");
        showModal(e);
    }

    function showModal(e) {
        e.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.remove("off");
        modal.classList.add("on");
    }

    function hideOverlay(e) {
        e.preventDefault();
        e.stopPropagation(); // don't allow clicks to pass through
        let overlay = document.querySelector(".overlay");
        overlay.classList.remove("show");
        overlay.classList.add("hide");
        hideModal(e);
    }

    function hideModal(e) {
        e.preventDefault();
        let modal = document.querySelector(".modal");
        modal.classList.remove("on");
        modal.classList.add("off");
    }



    function addEventListener() {
        let searchButton = document.querySelector(".searchButtonDiv");
        searchButton.addEventListener("click", startSearch);
		//    let backButton = document.getElementById("#back-button");
		//    backButton.addEventListener("click", back);

		//    let saveButton = document.getElementById("saveButton");
		// saveButton.addEventListener("click", saveLocalStorageData);
		//    
		//    let clearButton = document.getElementById("clearAllButton");
		// clearButton.addEventListener("click", function(){
		//        localStorage.clear();
		//   
		//    


    }

    function getLocalStorageData() {
		//load image sizes and base url from local storage

		//doesn't exist
		//the data is  there but stale (over 1 hour old)
		//if there is no poster path or sizes in local storage or if the information is over 60 minutes old (stale)
		//then we need to get that data from TMDb using fetch
        function getLocalStorageData() {
			// First see if the key exists in local storage
            if (localStorage.getItem(timeKey)) {
                let savedDate = localStorage.getItem(timeKey); // get the saved date string
                savedDate = new Date(savedDate); // use this string to initialize a new Date object
				//    console.log(savedDate);

                let seconds = calculateElapsedTime(savedDate);

                h3.innerHTML = `Retrieving Saved Date from Local Storage<br>Saved Date: ${savedDate}<br>Current Date: ${new Date()}<br>Elapsed Time: ${seconds} seconds`;

                if (seconds > staleDataTimeOut) {
                    console.log("Local Storage Data is stale");
                    h3.innerHTML += "<br>Local Storage Data is stale";
                    saveDateToLocalStorage();
                    getPosterPathAndSizes();
                }
            } else {
                saveDateToLocalStorage();
                getPosterPathAndSizes();
            }
        }

        function saveDateToLocalStorage() {
            console.log("Saving current Date to Local Storage");
            h3.innerHTML += "<br>Saving current Date to Local Storage";
            let now = new Date();
            localStorage.setItem(timeKey, now);
        }

        function calculateElapsedTime(savedDate) {
            let now = new Date(); // get the current time
            console.log(now);

			// calculate elapsed time
            let elapsedTime = now.getTime() - savedDate.getTime(); // this in milliseconds

            let seconds = Math.ceil(elapsedTime / 1000);
            console.log("Elapsed Time: " + seconds + " seconds");
            return seconds;
        }


        getPosterPathAndSizes();
    }
	//else it does exist and is less than 1 hour old
	//load from local storage


    localStorage.getItem



    function getPosterPathAndSizes() {
        let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;

        fetch(url)
			.then(function (response) {
    return response.json();

})
			.then(function (data) {
    console.log(data);
    imageURL = data.images.secure_base_url;
    imageSizes = data.images.poster_sizes;
    console.log(imageURL);
    console.log(imageSizes);

})
			.catch(function (error) {
    alert(error);
});
    }

    function startSearch() {
        console.log("start search");
        searchString = document.getElementById("search-input").value;
        if (!searchString) {
            alert("Please enter search data");
            searchString.focus();
            return;
        }
		// this is a new search so you should reset any existing page data

        getSearchResults();

    }

    function getSearchResults() {

		// https://developers.themoviedb.org/3/search/search-movies  look up search movie (also TV Shows)
        let url = `${movieDataBaseURL}search/movie?api_key=${APIKEY}&query=${searchString}`;

        fetch(url)
			.then(response => response.json())
			.then(data => {
    console.log(data);

				//  create the page from data
    createPage(data);

				//  navigate to "results";
})
			.catch(error => console.log(error));
    }

    function createPage(data) {
        let content = document.querySelector("#search-results>.content");
        let title = document.querySelector("#search-results>.title");
        let message = document.createElement("h2");
        content.innerHTML = "";
        title.innerHTML = "";

        if (data.total_results == 0) {
            message.innerHTML = `No results found for ${searchString}`;
        } else {
            message.innerHTML = `Total results = ${data.total_results} for ${searchString}`;


        }
        title.appendChild(message);

        let documentFragment = new DocumentFragment();


        documentFragment.appendChild(createMovieCards(data.results));

        content.appendChild(documentFragment);

        let cardList = document.querySelectorAll(".content>div");

        cardList.forEach(function (item) {
            item.addEventListener("click", getRecommendations);

        });
    }

    function createMovieCards(results) {

        let documentFragment = new DocumentFragment(); // use a documentFragment for performance

        results.forEach(function (movie) {

            let movieCard = document.createElement("div");
            let section = document.createElement("section");
            let image = document.createElement("img");
            let videoTitle = document.createElement("h3");
            let videoDate = document.createElement("p");
            let videoRating = document.createElement("p");
            let videoOverview = document.createElement("p");

			// set up the content
            videoTitle.textContent = movie.title;
            videoDate.textContent = movie.release_date;
            videoRating.textContent = movie.vote_average;
            videoOverview.textContent = movie.overview;

			// set up image source URL
            image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;

			// set up movie data attributes
            movieCard.setAttribute("data-title", movie.title);
            movieCard.setAttribute("data-id", movie.id);

			// set up class names
            movieCard.className = "movieCard";
            section.className = "imageSection";

			// append elements
            section.appendChild(image);
            movieCard.appendChild(section);
            movieCard.appendChild(videoTitle);
            movieCard.appendChild(videoDate);
            movieCard.appendChild(videoRating);
            movieCard.appendChild(videoOverview);

            documentFragment.appendChild(movieCard);

        });

        return documentFragment;
    }

    function getRecommendations() {
		//    console.log(this);
        let movieTitle = this.getAttribute("data-title");

		//    searchString = movieTitle;

        let movieID = this.getAttribute("data-id");
        console.log("you clicked: " + movieTitle + " " + movieID);

        let url = `${movieDataBaseURL}movie/${movieID}/recommendations?api_key=${APIKEY}`;

        fetch(url)
			.then(response => response.json())
			.then(data => {
    console.log(data);

				//  create the page from data
    createPage(data);

				//  navigate to "results";
})
			.catch(error => console.log(error));
    }
})();
