/***********************
 *   GLOBAL VARIABLES
 **********************/

const main = document.querySelector('.employees');
const modalBlock = document.querySelector('.modal');
// URL used for API call
const employeesUrl = 'https://randomuser.me/api/?results=12&nat=us&inc=name,email,location,cell,address,dob,picture&noinfo';
// Flattened array of all employees (no nested objects)
let employees = [];
/* Dynamically updated flattened array of all employees to cycle through 
 * in the modal view */
let modalEmployees = [];

/***********************
 *      FETCH API
 **********************/
// Function call to invoke Fetch API call
getJSON(employeesUrl)
    .then(data => flattenEmployees(data.results))
    .catch(error => console.error(error));

/**
 * Fetches employee data through API
 * Returns JSON object containing employee info
 * @param {String} url -- URL to access employee info API
 * @returns {Object} JSON -- Parsed JSON from employee info API
 */
async function getJSON(url) {
    try {
        return await fetch(url)
            .then(res => res.json())
    } catch (err) {
        HTML = '<p class="error">Error connecting with remote server.<br>Please refresh page to try again. 😊</p>';
        main.innerHTML = HTML;
        throw console.error(Error('Connection to remote server failed'), err);
    }
}

/***********************
 *     JSON PARSER
 **********************/

/**
 * Parses employee data
 * Assigns an array of flattened employee objects 
 * to the @global {Array} employees
 * Initializes the {Array} modalEmployees = {Array} employees
 * Calls the @function generateCardHTML(employees)
 * @param {Array} arr -- Array of employee objects from API
 */
const flattenEmployees = async (arr) => {
    employees = arr
        .map(employee => {
            return {
                    'picture': employee.picture.large,
                    'name': `${employee.name.first} ${employee.name.last}`,
                    'email': employee.email,
                    'city': employee.location.city,
                    // Dispense with the hyphen after the area code's parentheses
                    'phone': `${employee.cell.slice(0,5)} ${employee.cell.slice(6)}`,
                    // Concatenate the address components to match the format
                    'address': `${employee.location.street.number} ${employee.location.street.name}<br> ${employee.location.city}, ${employee.location.state}<br>${employee.location.postcode}`,
                    // Format date from hyphenated data string
                    'dob': `${formatDate(employee.dob.date)}` 
            };
        });
    modalEmployees = employees;
    generateCardHTML(employees);
}

/**
 * Formats date string taken from parsed JSON retrieved through API
 * Returns properly formatted date string (MM/DD/YYYY)
 * @param {String} date -- Date passed from API JSON
 * @returns {String} formattedDate -- Locale date string derived from instance of a Date object
 */
function formatDate(date){
    formattedDate = new Date(date.slice(0,10));
    return formattedDate.toLocaleDateString();
};


/***********************
 *    HTML GENERATORS
 **********************/

/**
 * Generates HTML for employee cards 
 * from an array of employee objects
 * Injects HTML into grid layout
 * Calls @function initializeCardListeners to listen
 * for clicks on .card elements
 * @param {Array} employees -- Array of employee objects from API
 */
const generateCardHTML = (employees) => {
    let HTML = "";
    employees.forEach(employee => {
        HTML += `
            <div class="card">
                <img class="card__img" src="${employee.picture}" alt="Employee image">
                <div class="card__info">
                    <h2 class="card__name">${employee.name}</h2>
                    <p class="card__email"><a href="mailto:${employee.email}">${employee.email}</a></p>
                    <p class="card__city">${employee.city}</p>
                </div>
            </div>
        `;
    });
    main.innerHTML = HTML;
    initializeCardListeners();
}

/**
 * Locates one employee in employee object array
 * Injects HTML into modal view
 * Calls @function initializeModalListeners to listen
 * for interactions with elements in modal view 
 * @param {String} name -- Name of employee featured in current modal view
 */
function generateModalHTML (modalEmployees, name) {
    modalEmployees.forEach( (employee, index) => {
        if (employee.name === name) {
            let HTML = `
                <span class="modal__closer">&times;</span>
                <img class="modal__img" src="${employee.picture}" alt="Employee picture">
                <h2 class="modal__name">${employee.name}</h2>
                <p class="modal__email"><a href="mailto:${employee.email}">${employee.email}</a></p>
                <p class="modal__city">${employee.city}</p>
                <hr class="modal__hr">
                <p class="modal__phone">${employee.phone}</p>
                <p class="modal__address">${employee.address}</p>
                <p class="modal__dob">Birthday: ${employee.dob}</p>
                `;
                if ( modalEmployees.length > 1 ) {
                    HTML += `
                    <div class="modal__container">
                        <button class="modal__button modal__button--prev"><&nbsp;Previous</button>
                        <button class="modal__button modal__button--next">Next&nbsp;></button>
                    </div>
                    `;
                }
            document.querySelector('.modal__content').innerHTML = HTML;
            initializeModalListeners(modalEmployees, index);
        }
    });
}



/***********************
 *    EVENT LISTENERS
 **********************/

/**
 * Listens for click on any card block or element
 * except for the email address
 * Calls @function showModal(card) on click
 * to display modal view
 */
function initializeCardListeners() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => showModal(card));
    });
}

/**
 * Displays modal overlay
 * Calls @function generateModalHTML(modalEmployees, cardNameText)
 * to populate overlay with employee information
 * @param {Object} card -- HTMLElement representing one employee
 */
function showModal(card) {
    // Trim white space
    const cardNameText = card.querySelector('.card__name').textContent.trim();
    modalBlock.classList.add('modal--show');
    generateModalHTML(modalEmployees, cardNameText);
}

/**
 * Adds eventListeners to modal closer and buttons
 * @param {Array} modalEmployees -- Employees to display in modal view
 * @param {Number} index -- Index of employee object (in globalEmployeeArray) featured in current modal view
 */
function initializeModalListeners(modalEmployees, index) {
    const modalCloser = document.querySelector('.modal__closer');
    const modalButtons = document.querySelectorAll('.modal__button');
    const length = modalEmployees.length;
    
    // If buttons have been included in the modal HTML
    if (modalButtons.length) {

        // Get previous employee name based on current empoyee index
        let prevEmployeeIndex = index - 1;
        if ( prevEmployeeIndex < 0 ) {
            prevEmployeeIndex = length - 1;
        }
        const prevEmployeeName = modalEmployees[prevEmployeeIndex].name;

        // Get next employee name based on current employee index
        let nextEmployeeIndex = index + 1;
        if ( nextEmployeeIndex > length - 1) {
            nextEmployeeIndex = 0;
        }
        const nextEmployeeName = modalEmployees[nextEmployeeIndex].name;

            /* Handle a click on previous and next buttons
        *  to change employee in the modal view */
        modalButtons.forEach(button => button.addEventListener('click', e => handleModalChange(e, modalEmployees, nextEmployeeName, prevEmployeeName), {once: true}));

        /* Handle a keyup event for right and left arrows
        * to change employee in the modal view */
        document.addEventListener('keyup', e => handleModalChange(e, modalEmployees, nextEmployeeName, prevEmployeeName), {once: true});
    }

    // Listen for click on closer to close modal
    modalCloser.addEventListener('click', () => modalBlock.classList.remove('modal--show'), {once: true});
    
    /* Handle a keyup event for Esc key
    *  to close modal overlay */
    document.addEventListener('keyup', hideModalOverlay), {once: true};

    /* Handle a click outside of the
       modal view and close overlay */
    document.querySelector('.modal').addEventListener('click', hideModalOverlay);
}

/**
 * Listens for keyboard input in the search input element
 * Calls @function filterCards() on input 
 */
document.querySelector('.search__input')
    .addEventListener( 'input', e => filterCards(e.target.value));



/***********************
 *    EVENT HANDLERS
 **********************/

 /**
  * Filters the @global employees array to include
  * only employees with names containing the input string
  * Assigns filtered array to the @global modalEmployees variable
  * Calls @function toggleCard() to show/hide card
  * @Calls @function hideEmptyMsg() and @function showEmptyMsg()
  * to appropriately hide/show a message that no employees
  * were found in the search
  * @param {String} input -- User keyboard input
  */
function filterCards(input) {
    hideEmptyMsg();
    modalEmployees = employees.filter(employee => {
        const name = employee.name.toLowerCase();
        if (name.includes(input.toLowerCase())) {
            toggleCard(name, true);
            return true;
        }
        toggleCard(name, false)
        return false;
    });
    showEmptyMsg();
}

/**
 * Hides message that no search results were returned
 */
function hideEmptyMsg() {
    const lastChild = document.querySelector('.employees').lastElementChild;
    if (lastChild.tagName === 'P') {
        lastChild.remove();
    }
}

/**
 * Compares the number of cards on the page
 * with the number of hidden cards
 * and hides the message indicating no returned results
 * if they are equal
 */
function showEmptyMsg() {
    const cards = document.getElementsByClassName('card');
    const hiddenCards = document.getElementsByClassName('card--hidden');
    if (hiddenCards.length === cards.length) {
        if ( document.querySelector('.employees').lastElementChild.tagName !== 'P') {
        const p = document.createElement('P');
        p.classList.add('employees__empty-msg');
        p.innerText = 'No employees match your search.';
        main.appendChild(p);
        }
    }
}

/**
 * Hides or shows an employee card based on
 * the provided parameters
 * @param {String} name -- Name of employee to show/hide
 * @param {Boolean} isIncluded -- Whether to show/hide
 */
function toggleCard( name, isIncluded ) {
    const cards = document.querySelectorAll('.card'); 
    cards.forEach( card => {
        const cardName = card.querySelector('.card__name')
                            .innerText.toLowerCase();
        if ( cardName === name ) {
            if ( isIncluded ) {
                card.classList.remove('card--hidden');
            } else {
                card.classList.add('card--hidden');
            }
        }
    }
    );
}


/**
 * Handles click on Next or Previous buttons in modal view
 * Handles keyup for right and left arrow keys in modal view
 * Advances modal view to the appropriate employee
 * by invoking generateModalHTML()
 * @param {Event} e -- Event triggered by user input (click or keyup)
 * @param {String} nextEmployeeName -- Name of next employee in employee grid
 * @param {String} prevEmployeeName -- Name of previous employee in employee grid
 */
function handleModalChange(e, modalEmployees, nextEmployeeName, prevEmployeeName) {
    let next = false;
    let prev = false;

    // Handle button clicks
    if (e.target.tagName === "BUTTON") {
        const targetText = e.target.innerText.toUpperCase();
        if (targetText.includes("NEXT")) { 
            next = true;
        } else if (targetText.includes("PREVIOUS")) {
            prev = true;
        }
    }
    
    // Handle keyups (right and left arrows)
    if (e.key) {
        if (e.key === "ArrowRight") {
            next = true;
        } else if (e.key === "ArrowLeft") {
            prev = true;
        }
    }

    // Populate modal view with new employee
    if (next) {
        generateModalHTML(modalEmployees, nextEmployeeName);
    } else if (prev) {
        generateModalHTML(modalEmployees, prevEmployeeName);
    }
}

/**
 * Hides modal overlay
 * if escape key is pressed in modal view
 * @param {Event} e -- Event triggered by user input
 */
function hideModalOverlay(e) {
    if (e.key === "Escape" || e.target.classList.contains('modal')) {
        modalBlock.classList.remove('modal--show');
        document.querySelector('.modal').removeEventListener('click', hideModalOverlay);
    }
}