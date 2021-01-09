/***********************
 *   GLOBAL VARIABLES
 **********************/

const main = document.querySelector('.employees');
const employeesUrl = 'https://randomuser.me/api/?results=12&nat=us&inc=name,email,location,cell,address,dob,picture&noinfo';
// Globally accessible flattened array of employee objects
let globalEmployeeArray = '';
const modalBlock = document.querySelector('.modal');



/***********************
 *      FETCH API
 **********************/

/**
 * Fetches employee data through API
 */
fetch(employeesUrl)
    .then(res => res.json())
    .then(data => flattenEmployees(data.results))
    .then(employees => generateCardHTML(employees))
    .catch(error => console.log( new Error('Request failed'), error));



/***********************
 *     JSON PARSER
 **********************/

/**
 * Parses employee data
 * Returns an array of flattened employee objects
 * @param {Array} arr -- Array of employee objects from API
 * @returns {Array} flateEmployeeObjects -- Array of flattened employee objects
 */
const flattenEmployees = (arr) => {
    const flatEmployeeObjects = arr
        .map(employee => {
            return {
                    'picture-lg': employee.picture.large,
                    'name': `${employee.name.first} ${employee.name.last}`,
                    'email': employee.email,
                    'city': employee.location.city,
                    // Dispense with the hyphen after the area code's parentheses
                    'phone': `${employee.cell.slice(0,5)} ${employee.cell.slice(6)}`,
                    // Concatenate the address components to match the format
                    'address': `${employee.location.street.number} ${employee.location.street.name}<br> ${employee.location.city}, ${employee.location.state} ${employee.location.postcode}`,
                    'dob': `${new Date(employee.dob.date.slice(0,10)).toLocaleDateString()}` // Format date from hyphenated data string
            };
        });
    return globalEmployeeArray = flatEmployeeObjects;
}



/***********************
 *    EVENT LISTENERS
 **********************/

/**
 * Listens for click on any card block or element
 * except for the email address
 * Populates and displays modal overlay
 */
function initializeCardListeners() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Trim white space
            const cardNameText = card.querySelector('.card__name').textContent.trim();
            generateModalHTML(cardNameText);
            modalBlock.classList.add('modal--show');
        });
    });
}

/**
 * Adds eventListeners to modal closer and buttons
 * @param {Number} index -- Index of employee object (in globalEmployeeArray) featured in current modal view
 */
function initializeModalListeners(index) {
    const modalCloser = document.querySelector('.modal__closer');
    const modalButtons = document.querySelectorAll('.modal__button');
    const lengthOfGlobalEmployeeArray = globalEmployeeArray.length;
    
    // Get previous employee name based on current empoyee index
    let prevEmployeeIndex = index - 1;
    if ( prevEmployeeIndex < 0 ) {
        prevEmployeeIndex = lengthOfGlobalEmployeeArray - 1;
    }
    const prevEmployeeName = globalEmployeeArray[prevEmployeeIndex].name;

    // Get next employee name based on current employee index
    let nextEmployeeIndex = index + 1;
    if ( nextEmployeeIndex > lengthOfGlobalEmployeeArray - 1) {
        nextEmployeeIndex = 0;
    }
    const nextEmployeeName = globalEmployeeArray[nextEmployeeIndex].name;

    // Listen for click on closer to close modal
    modalCloser.addEventListener('click', () => modalBlock.classList.remove('modal--show'), {once: true});
    
    /* Handle a click on previous and next buttons
    *  to change employee in the modal view */
    modalButtons.forEach(button => button.addEventListener('click', e => handleModalChange(e, nextEmployeeName, prevEmployeeName), {once: true}));

    /* Handle a keyup event for right and left arrows
    * to change employee in the modal view */
    document.addEventListener('keyup', e => handleModalChange(e, nextEmployeeName, prevEmployeeName), {once: true});
    
    /* Handle a keyup event for Esc key
    *  to close modal overlay */
    document.addEventListener('keyup', hideModalOverlay), {once: true};

    /* Handle a click outside of the
       modal view and close overlay */
    document.querySelector('.modal').addEventListener('click', hideModalOverlay);
}



/***********************
 *    EVENT HANDLERS
 **********************/

/**
 * Handles click on Next or Previous buttons in modal view
 * Handles keyup for right and left arrow keys in modal view
 * Advances modal view to the appropriate employee
 * by invoking generateModalHTML()
 * @param {Event} e -- Event triggered by user input (click or keyup)
 * @param {String} nextEmployeeName -- Name of next employee in employee grid
 * @param {String} prevEmployeeName -- Name of previous employee in employee grid
 */
function handleModalChange(e, nextEmployeeName, prevEmployeeName) {
    let next = false;
    let prev = false;

    // Handle button clicks
    if (e.target.tagName === "BUTTON") {
        const targetText = e.target.textContent.toUpperCase();
        if (targetText === "NEXT >") { 
            next = true;
        } else if (targetText === "< PREVIOUS") {
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
        generateModalHTML(nextEmployeeName);
    } else if (prev) {
        generateModalHTML(prevEmployeeName);
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



/***********************
 *    HTML GENERATORS
 **********************/

/**
 * Generates HTML for employee cards 
 * from an array of employee objects
 * Injects HTML into grid layout
 * Initializes eventListeners for clicks on .card elements
 * @param {Array} employees -- Array of employee objects from API
 */
const generateCardHTML = (employees) => {
    let HTML = "";
    employees.forEach(employee => {
        HTML += `
            <div class="card">
                <img class="card__img" src="${employee['picture-lg']}" alt="Employee image">
                <div class="card__info">
                    <h2 class="card__name">
                        ${employee.name}
                    </h2>
                    <p class="card__email">
                        <a href="mailto:${employee.email}">${employee.email}</a>
                    </p>
                    <p class="card__city">
                        ${employee.city}
                    </p>
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
 * Initializes eventListeners for elements in modal view 
 * @param {String} name -- Name of employee featured in current modal view
 */
function generateModalHTML (name) {
    globalEmployeeArray.forEach( (employee, index) => {
        if (employee.name === name) {
            const HTML = `
                <span class="modal__closer">&times;</span>
                <img class="modal__img" src="${employee['picture-lg']}" alt="Employee picture">
                <h2 class="modal__name">${employee.name}</h2>
                <p class="modal__email"><a href="mailto:${employee.email}">${employee.email}</a></p>
                <p class="modal__city">${employee.city}</p>
                <hr class="modal__hr">
                <p class="modal__phone">${employee.phone}</p>
                <p class="modal__address">${employee.address}</p>
                <p class="modal__dob">Birthday: ${employee.dob}</p>
                <div class="modal__container">
                    <button class="modal__button modal__button--prev">< Previous</button>
                    <button class="modal__button modal__button--next">Next ></button>
                </div>
            `;
            document.querySelector('.modal__content').innerHTML = HTML;
            initializeModalListeners(index);
        }
    });
}