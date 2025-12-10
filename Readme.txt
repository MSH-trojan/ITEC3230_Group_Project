
  _____     _    _____                     
 |  __ \   | |  / ____|                _   
 | |__) |__| |_| |     __ _ _ __ ___ _| |_ 
 |  ___/ _ \ __| |    / _` | '__/ _ \_   _|
 | |  |  __/ |_| |___| (_| | | |  __/ |_|  
 |_|   \___|\__|\_____\__,_|_|  \___|      
                                           
                                           



------------------------------------------------------------------------------------------------------

PetCare+ is a fully front-end pet management dashboard designed and implemented using HTML, CSS, Bootstrap, and vanilla JavaScript. The system operates entirely through the browser’s sessionStorage, requiring no backend infrastructure. Its purpose is to provide a smooth, app-like experience for managing pets, appointments, medical records, reminders, and daily interactions, while maintaining clean modular logic and a well-structured user interface.

The platform begins with index.html, which serves as the landing page. From there, users can proceed to login.html, where authentication is handled by validating stored session credentials. Successful login redirects the user either to the main dashboard (home.html) or, if no pets exist yet, to the add-pet page. Registration is performed on register.html and saves new user data directly into sessionStorage.

Pet creation and management take place in add-pet.html, allowing users to add the first pet or multiple additional pets. Each pet includes core details such as name, breed, birthday, type, and an uploaded photo. Once pets are added, the home.html dashboard becomes the central navigation hub. The dashboard displays upcoming appointments, quick reminders for today and tomorrow, and provides access to detailed views through modal components.

Profile-related operations are handled in profile.html, where users may view and edit their pet’s information, update attributes such as weight or color, and add medical or treatment records. These records support PDF uploads through FileReader, allowing the system to store files as base64-encoded URLs in sessionStorage for later retrieval and viewing.

Appointment creation occurs on reservation.html. The page supports selecting a pet, choosing a service category, specifying a location, picking a date and time, and optionally providing notes. The appointment logic includes safeguards such as preventing bookings within six hours of the current time, blocking duplicate time slots, and triggering special handling for appointments scheduled for today or tomorrow. In those cases, the user receives an immediate success message followed by a notification alert and automatic redirection to the notifications page.

The monthly appointment calendar is rendered in calendar.html. It displays a grid-style calendar that highlights all scheduled appointments using color-coded event chips. Each appointment category is visually distinguished (e.g., grooming, veterinary, boarding) and clicking on a date with events opens a modal showing a structured list of appointments for that day.

Notifications are managed in notifications.html. This page automatically lists all upcoming appointments occurring today or tomorrow. Each notification includes quick-action buttons to view details, dismiss the notification, or initiate the rescheduling process. Rescheduling is performed by storing the selected reservation ID in sessionStorage and redirecting the user back to reservation.html, where the system preloads the appointment details for editing. Once the user confirms their changes, a reschedule success message appears and the system returns to the notifications page.

Throughout the entire project, the JavaScript codebase is structured to maintain separation of responsibility, including helpers for storage, alerts, user interface rendering, sidebar navigation, appointment logic, file handling, calendar building, and edit modals. Every component is designed with a consistent user experience in mind, ensuring intuitive navigation and a smooth workflow from login to final scheduling.

PetCare+ demonstrates how a fully functional, interactive application can be developed using only front-end technologies while still providing dynamic data handling, modal-driven interaction, file uploads, custom validation rules, and multi-page state persistence. It stands as a complete session-based application prototype, suitable for academic demonstration, UI/UX portfolio pieces, or as a foundation for future backend integration.