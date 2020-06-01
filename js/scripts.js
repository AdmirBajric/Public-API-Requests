// Selecting required elements and create variable with random user link
const searchContainer = document.querySelector(".search-container");
const gallery = document.getElementById("gallery");
const randomUser = "https://randomuser.me/api/?nat=gb,us&results=12";

// Fetch resources asynchronously
fetch(randomUser)
  .then(checkStatus)
  .then((response) => response.json())
  .then(showEmployees)
  .catch((err) => console.log("Looks like there was a error", err));

// Check if Promise object is resolved or rejected
function checkStatus(response) {
  if (response.ok === true) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
}

// showEmployees calls functions with resolved object from the fetch resource
function showEmployees(data) {
  searchFormHTML();
  createCard(data);
  addListeners(data);
  filterUser(data);
}

// Create the search form and added to the DOM
const searchFormHTML = () => {
  let searchHTML = `
      <form action="#" method="get">
          <input type="search" id="search-input" class="search-input" placeholder="Search...">
          <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
      </form>`;

  searchContainer.innerHTML += searchHTML;
};

// Creates card element for all employees and added to the DOM
const createCard = (data) => {
  const employee = data.results
    .map(
      (user) => `
  <div class="card">
        <div class="card-img-container">
          <img class="card-img" src="${user.picture.large}" alt="profile picture">
        </div>
      <div class="card-info-container">
          <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
          <p class="card-text">${user.email}</p>
          <p class="card-text cap">${user.location.city}, ${user.location.state}</p>
      </div>
  </div>
  `
    )
    .join("");
  gallery.innerHTML = employee;
};

// Added eventListeners to all card elements for modal container, when one card element is clicked its shows a modal
const addListeners = (data) => {
  const card = document.querySelectorAll(".card");
  card.forEach((card, index) => {
    card.addEventListener("click", () => showModal(data, index));
  });
};

// Create modal container for current clicked card element employees
const showModal = (data, index) => {
  // Current variable stores the current clicked card element with the employees
  const current = data.results[index];
  // Data conversion from the data object for the birthday of the current clicked card element employees
  const day = current.dob.date.slice(8, 10);
  const month = current.dob.date.slice(5, 7);
  const year = current.dob.date.slice(0, 4);
  const birthday = `${month}/${day}/${year}`;
  // Create modal container and added to the the DOM
  const modal = `
    <div class="modal-container">
    <div class="modal">
      <button type="button" id="modal-close-btn" class="modal-close-btn">
        <strong>X</strong>
      </button>
      <div class="modal-info-container">
        <img
          class="modal-img"
          src="${current.picture.large}"
          alt="profile picture"
        />
        <h3 id="name" class="modal-name cap">
          ${current.name.first} ${current.name.last}
        </h3>
        <p class="modal-text">${current.email}</p>
        <p class="modal-text cap">${current.location.city}</p>
        <hr />
        <p class="modal-text">${current.cell}</p>
        <p class="modal-text">
          ${current.location.street.name} ${current.location.street.number},
          ${current.location.state}, ${current.location.postcode}
        </p>
        <p class="modal-text">Birthday: ${birthday}</p>
      </div>
    </div>
    <div class="modal-btn-container">
      <button type="button" id="modal-prev" class="modal-prev btn">
        Prev
      </button>
      <button type="button" id="modal-next" class="modal-next btn">
        Next
      </button>
    </div>
  </div>
      `;
  gallery.innerHTML += modal;
  // modalsBtn for the functionality of the modal buttons
  modalsBtn(data, index);
};

// Selecting elements, added eventListeners to buttons in modal container, to close modal, prev and next button to show prev or next employees
const modalsBtn = (data, index) => {
  const close = document.querySelector(".modal-close-btn strong");
  const modalContainer = document.querySelector(".modal-container");
  // EventListener for closing the modal container
  close.addEventListener("click", () => {
    modalContainer.remove();
    addListeners(data, index);
  });
  // EventListener for prev button, when is clicked the showModal function is called to show the prev card element employees
  const modalPrev = document.querySelector("#modal-prev");
  modalPrev.addEventListener("click", () => {
    modalContainer.remove();
    showModal(data, index - 1);
  });
  // EventListener for next button, when is clicked the showModal function is called to show the next card element employees
  const modalNext = document.querySelector("#modal-next");
  modalNext.addEventListener("click", () => {
    modalContainer.remove();
    showModal(data, index + 1);
  });
  // If one card element is showing on the page the prev and next button is hidden
  if (data.results.length === 1) {
    const modalBtn = document.querySelector(".modal-btn-container");
    modalBtn.style.display = "none";
  } else {
    // Functionality for buttons, to show or hide buttons on the modal container
    if (index === 0) {
      modalPrev.style.display = "none";
      modalNext.style.display = "";
    } else if (index <= data.results.length - 2) {
      modalPrev.style.display = "";
      modalNext.style.display = "";
    } else {
      modalPrev.style.display = "";
      modalNext.style.display = "none";
    }
  }
};

// Selecting required elements, added eventListeners to input field for real time search and submit button for searching the employees
function filterUser(data) {
  const searchInput = document.querySelector("#search-input");
  const searchSubmit = document.querySelector("form");
  // EventListener for keyup event on the input field, setting attributes and style of input field, calling search function to filter the input value
  searchInput.addEventListener("keyup", (e) => {
    searchInput.setAttribute("placeholder", "Search...");
    searchInput.style.border = "1px solid #c8c8c8e6";
    const currUser = e.target.value.toLowerCase();
    search(currUser);
  });
  // EventListener for submit button, added preventDefault method, when submit is clicked and the input field is empty,
  // setting attribute and style on input field, calling search function to filter the input value
  searchSubmit.addEventListener("submit", (e) => {
    e.preventDefault();
    const currUser = e.target.firstElementChild.value.toLowerCase();
    if (currUser === "") {
      searchInput.setAttribute("placeholder", "Can't be blank!");
      searchInput.style.border = "2px solid #e45252";
    }
    search(currUser);
  });
  // Filter the input value to show the required matches
  const search = (currUser) => {
    // Helper variables for the filtering
    let matchUser = [];
    let noMatch = [];
    let newData = {};
    // Filtering the input value with the data object
    data.results.forEach((user) => {
      if (
        currUser.match("[/a-z/]") &&
        user.name.first.toLowerCase().match(currUser)
      ) {
        matchUser.push(user);
        newData = {
          results: matchUser,
        };
      } else {
        noMatch.push(user);
      }
    });
    // If no matches are found a error message is created and added to the DOM
    if (noMatch.length === 12 && searchInput.value !== "") {
      const div = `
        <div id="err-search"><h2>Sorry no match found! Please try again!</h2></div>
        `;

      gallery.innerHTML = div;
    } else {
      // If no matches are found the functions are called with the data object
      if (matchUser.length === 0) {
        createCard(data);
        addListeners(data);
      } else {
        // If matches are found the functions are called with the newData object
        createCard(newData);
        addListeners(newData);
      }
    }
  };
}
