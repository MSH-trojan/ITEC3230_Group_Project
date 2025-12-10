// ===============================
// STORAGE HELPERS
// ===============================

function getPetsFromSession() {
    const raw = sessionStorage.getItem("petcare_pets");
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse petcare_pets from sessionStorage", e);
        return [];
    }
}

function savePetsToSession(petsArray) {
    sessionStorage.setItem("petcare_pets", JSON.stringify(petsArray));
}

function getReservationsFromSession() {
    const raw = sessionStorage.getItem("petcare_reservations");
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse petcare_reservations from sessionStorage", e);
        return [];
    }
}

function saveReservationsToSession(resArray) {
    sessionStorage.setItem("petcare_reservations", JSON.stringify(resArray));
}

// ===============================
// ALERT HELPERS
// ===============================

function showError(box, msg) {
    if (!box) return;
    box.textContent = msg;
    box.classList.remove("d-none");
}

function clearError(box) {
    if (!box) return;
    box.classList.add("d-none");
    box.textContent = "";
}

function showSuccess(box, msg) {
    if (!box) return;
    box.textContent = msg;
    box.classList.remove("d-none");
}

// ===============================
// RESERVATION HELPERS
// ===============================

function getCheckedValue(name) {
    const checked = document.querySelector(`input[name='${name}']:checked`);
    return checked ? checked.value : "";
}

// behave like radio group
function setupSingleSelectCheckboxGroup(name) {
    const boxes = document.querySelectorAll(`input[name='${name}']`);
    boxes.forEach(box => {
        box.addEventListener("change", () => {
            if (box.checked) {
                boxes.forEach(other => {
                    if (other !== box) other.checked = false;
                });
            }
        });
    });
}

// ===============================
// SIDEBAR PET PROFILES
// ===============================

function populatePetProfilesNav() {
    const listEl = document.getElementById("pet-profiles-list");
    if (!listEl) return;

    const pets = getPetsFromSession();
    listEl.innerHTML = "";

    if (!pets || pets.length === 0) {
        return;
    }

    pets.forEach((pet) => {
        const li = document.createElement("li");
        li.className = "nav-text";

        const a = document.createElement("a");
        a.href = "profile.html";
        a.textContent = pet.name || "Unnamed pet";
        a.dataset.petId = String(pet.id);

        a.addEventListener("click", () => {
            sessionStorage.setItem("petcare_current_pet_id", String(pet.id));
        });

        li.appendChild(a);
        listEl.appendChild(li);
    });
}

// ===============================
// MAIN DOMContentLoaded BLOCK
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    // header user name
    const welcomeSpanGlobal = document.getElementById("welcome-name");
    if (welcomeSpanGlobal) {
        const currentUser = sessionStorage.getItem("petcare_current_user") || "";
        if (currentUser) {
            welcomeSpanGlobal.textContent = currentUser;
        }
    }

    // header pet thumb
    function updateHeaderPetThumb() {
        const thumb = document.getElementById("pet-thumb");
        if (!thumb) return;

        const pets = getPetsFromSession();
        if (!pets.length) return;

        let currentPetId = sessionStorage.getItem("petcare_current_pet_id");
        let currentPet = pets.find(p => String(p.id) === String(currentPetId));

        if (!currentPet) {
            currentPet = pets[0];
            sessionStorage.setItem("petcare_current_pet_id", String(currentPet.id));
        }

        if (currentPet.photo) {
            thumb.src = currentPet.photo;
            thumb.alt = currentPet.name || "Pet photo";
        }
    }

    updateHeaderPetThumb();

    // password show/hide
    const toggles = document.querySelectorAll(".toggle-password-outside");
    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const inputId = toggle.getAttribute("data-target");
            const input = document.getElementById(inputId);
            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                toggle.textContent = "𐩒";
            } else {
                input.type = "password";
                toggle.textContent = "👁︎";
            }
        });
    });

    // LOGIN
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const loginErrorBox = document.getElementById("login-error");
        const loginSuccessBox = document.getElementById("login-success");

        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();

            clearError(loginErrorBox);
            if (loginSuccessBox) {
                loginSuccessBox.classList.add("d-none");
                loginSuccessBox.textContent = "";
            }

            if (!loginForm.checkValidity()) {
                loginForm.classList.add("was-validated");
                showError(loginErrorBox, "Please fill in all required fields.");
                return;
            }

            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            const storedUser = sessionStorage.getItem("petcare_username");
            const storedPass = sessionStorage.getItem("petcare_password");

            if (!storedUser || !storedPass ||
                username !== storedUser || password !== storedPass) {
                showError(
                    loginErrorBox,
                    "Login failed. Username or password is incorrect, or you are not registered yet."
                );
                return;
            }

            sessionStorage.setItem("petcare_user_logged_in", "true");
            sessionStorage.setItem("petcare_current_user", username);

            showSuccess(loginSuccessBox, "Login successful! Redirecting...");

            setTimeout(() => {
                const pets = getPetsFromSession();
                if (pets.length === 0) {
                    window.location.href = "add-pet.html";
                } else {
                    window.location.href = "home.html";
                }
            }, 1200);
        });
    }

    // REGISTER
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        const firstNameInput = document.getElementById("reg-first-name");
        const lastNameInput  = document.getElementById("reg-last-name");
        const emailInput     = document.getElementById("reg-email");
        const usernameInput  = document.getElementById("reg-username");
        const passwordInput  = document.getElementById("reg-password");
        const confirmInput   = document.getElementById("reg-confirm");

        const registerErrorBox   = document.getElementById("register-error");
        const registerSuccessBox = document.getElementById("register-success");

        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();

            clearError(registerErrorBox);
            if (registerSuccessBox) {
                registerSuccessBox.classList.add("d-none");
                registerSuccessBox.textContent = "";
            }

            if (!registerForm.checkValidity()) {
                registerForm.classList.add("was-validated");
                showError(registerErrorBox, "Please fill in all required fields.");
                return;
            }

            const firstName = firstNameInput?.value.trim() || "";
            const lastName  = lastNameInput?.value.trim() || "";
            const email     = emailInput?.value.trim() || "";
            const username  = usernameInput.value.trim();
            const password  = passwordInput.value;
            const confirm   = confirmInput.value;

            if (password !== confirm) {
                showError(registerErrorBox, "Password and Confirm Password do not match.");
                return;
            }

            sessionStorage.setItem("petcare_username", username);
            sessionStorage.setItem("petcare_password", password);
            sessionStorage.setItem("petcare_first_name", firstName);
            sessionStorage.setItem("petcare_last_name", lastName);
            sessionStorage.setItem("petcare_email", email);

            showSuccess(
                registerSuccessBox,
                "Registration completed successfully. Redirecting to login..."
            );

            registerForm.reset();
            registerForm.classList.remove("was-validated");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        });
    }

    // ADD PET
    let petPhotoBase64 = "";
    const petPhotoInput   = document.getElementById("pet-photo");
    const petPhotoPreview = document.getElementById("pet-photo-preview");
    const addPetBackBtn = document.getElementById("add-pet-back-btn");
    if (addPetBackBtn) {
        const pets = getPetsFromSession();

        // If this is the first pet ever, hide the back button
        if (!pets.length) {
            addPetBackBtn.classList.add("d-none");
        } else {
            addPetBackBtn.addEventListener("click", (e) => {
                e.preventDefault();

                if (document.referrer) {
                    window.history.back();
                } else {
                    window.location.href = "home.html";
                }
            });
        }
    }

    if (petPhotoInput) {
        petPhotoInput.addEventListener("change", () => {
            const file = petPhotoInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                petPhotoBase64 = e.target.result;
                if (petPhotoPreview) {
                    petPhotoPreview.src = petPhotoBase64;
                }
            };
            reader.readAsDataURL(file);
        });
    }

    const addPetForm = document.getElementById("add-pet-form");
    if (addPetForm) {
        addPetForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!addPetForm.checkValidity()) {
                addPetForm.classList.add("was-validated");
                return;
            }

            addPetForm.classList.add("was-validated");

            const pets = getPetsFromSession();

            const newPet = {
                id: Date.now(),
                createdAt: new Date().toISOString(),
                name: document.getElementById("pet-name").value.trim(),
                birthday: {
                    dd: document.getElementById("bday-dd").value.trim(),
                    mm: document.getElementById("bday-mm").value.trim(),
                    yy: document.getElementById("bday-yy").value.trim()
                },
                username: document.getElementById("profile-username").value.trim(),
                type: document.getElementById("pet-type").value.trim(),
                breed: document.getElementById("pet-breed").value.trim(),
                password: document.getElementById("pet-password").value,
                photo: petPhotoBase64 || "",
                weight: "",
                color: "",
                sex: "",
                notes: "",
                records: []
            };

            pets.push(newPet);
            savePetsToSession(pets);

            sessionStorage.setItem("petcare_current_pet_id", String(newPet.id));

            window.location.href = "home.html";
        });
    }

    // DASHBOARD (home)
    const dashboardRoot = document.querySelector(".dashboard-main");
    if (dashboardRoot) {
        const pets = getPetsFromSession();

        if (pets.length === 0) {
            window.location.href = "add-pet.html";
        } else {
            const welcomeSpan = document.getElementById("welcome-name");
            const currentUser = sessionStorage.getItem("petcare_current_user") || "";
            if (welcomeSpan && currentUser) {
                welcomeSpan.textContent = currentUser;
            }

            const firstPet = pets[0];

            if (!sessionStorage.getItem("petcare_current_pet_id")) {
                sessionStorage.setItem("petcare_current_pet_id", String(firstPet.id));
            }

            const currentPetId = sessionStorage.getItem("petcare_current_pet_id");
            const currentPet =
                pets.find(p => String(p.id) === String(currentPetId)) || firstPet;

            const thumbImg = document.getElementById("pet-thumb");
            if (thumbImg && currentPet && currentPet.photo) {
                thumbImg.src = currentPet.photo;
            }
        }

        const apptContainer        = document.getElementById("appointments-container");
        const remindersContainer   = document.getElementById("reminders-container");
        const appointmentModal     = document.getElementById("appointmentModal");
        const appointmentModalBody = document.getElementById("appointmentModalBody");
        const appointmentModalClose= document.getElementById("appointmentModalClose");

        function closeAppointmentModal() {
            if (!appointmentModal) return;
            appointmentModal.classList.remove("active");
        }

        if (appointmentModal && appointmentModalClose) {
            appointmentModalClose.addEventListener("click", closeAppointmentModal);
            appointmentModal.addEventListener("click", (e) => {
                if (e.target === appointmentModal) {
                    closeAppointmentModal();
                }
            });
        }

        function openAppointmentModal(res) {
            if (!appointmentModal || !appointmentModalBody) return;

            const notesHtml = res.notes
                ? `<div class="modal-section">
                       <h4>Notes</h4>
                       <p>${res.notes}</p>
                   </div>`
                : "";

            appointmentModalBody.innerHTML = `
                <h3>${res.petName}'s ${res.service}</h3>
                <div class="modal-section">
                    <h4>Date & Time</h4>
                    <p>${res.date} at ${res.time}</p>
                </div>
                <div class="modal-section">
                    <h4>Location</h4>
                    <p>${res.location}</p>
                </div>
                ${notesHtml}
            `;

            appointmentModal.classList.add("active");
        }

        function makeDateKey(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
        }

        function renderAppointments() {
            if (!apptContainer) return;

            const reservations = getReservationsFromSession();
            if (!reservations.length) {
                apptContainer.innerHTML =
                    `<p class="dash-empty-main">Your appointments will appear here.</p>`;
                return;
            }

            apptContainer.innerHTML = "";

            reservations.forEach((res) => {
                const row = document.createElement("div");
                row.className = "appointment-row";

                const text = document.createElement("div");
                text.className = "appt-text";
                text.textContent =
                    `${res.petName}'s ${res.service} on ${res.date}`;

                const actions = document.createElement("div");
                actions.className = "appt-actions";

                const viewBtn = document.createElement("button");
                viewBtn.className = "cta-btn dash-small-btn";
                viewBtn.textContent = "View Detail";
                viewBtn.addEventListener("click", () => openAppointmentModal(res));

                const cancelBtn = document.createElement("button");
                cancelBtn.className = "dash-outline-btn dash-small-btn";
                cancelBtn.textContent = "Cancel";
                cancelBtn.addEventListener("click", () => {
                    const all       = getReservationsFromSession();
                    const remaining = all.filter(r => r.id !== res.id);
                    saveReservationsToSession(remaining);
                    renderAppointments();
                    renderReminders();
                });

                actions.appendChild(viewBtn);
                actions.appendChild(cancelBtn);

                row.appendChild(text);
                row.appendChild(actions);

                apptContainer.appendChild(row);
            });
        }

        function renderReminders() {
            if (!remindersContainer) return;

            const all = getReservationsFromSession();
            if (!all.length) {
                remindersContainer.innerHTML = `
                    <p class="dash-empty-main">
                        Your reminders will appear here.
                    </p>`;
                return;
            }

            const today    = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayKey    = makeDateKey(today);
            const tomorrowKey = makeDateKey(tomorrow);

            const upcomingSoon = all.filter(res =>
                res.date === todayKey || res.date === tomorrowKey
            );

            if (!upcomingSoon.length) {
                remindersContainer.innerHTML = `
                    <p class="dash-empty-main">
                        No reminders for today or tomorrow.
                    </p>`;
                return;
            }

            remindersContainer.innerHTML = "";
            const ul = document.createElement("ul");
            ul.style.listStyle = "none";
            ul.style.paddingLeft = "0";

            upcomingSoon.forEach(res => {
                const li = document.createElement("li");
                li.style.marginBottom = "6px";
                const label = (res.date === todayKey) ? "Today" : "Tomorrow";
                li.textContent = `[${label}] ${res.petName}'s ${res.service} at ${res.time}`;
                ul.appendChild(li);
            });

            remindersContainer.appendChild(ul);
        }

        renderAppointments();
        renderReminders();
    }

    // PROFILE PAGE
    const profileRoot = document.querySelector(".profile-main");
    if (profileRoot) {
        const pets = getPetsFromSession();

        if (!pets || pets.length === 0) {
            window.location.href = "add-pet.html";
        } else {
            let currentPetId = sessionStorage.getItem("petcare_current_pet_id");
            let currentPet = pets.find(p => String(p.id) === String(currentPetId));

            if (!currentPet) {
                currentPet = pets[0];
                currentPetId = String(currentPet.id);
                sessionStorage.setItem("petcare_current_pet_id", currentPetId);
            }

            currentPet.weight   = currentPet.weight || "";
            currentPet.color    = currentPet.color  || "";
            currentPet.sex      = currentPet.sex    || "";
            currentPet.notes    = currentPet.notes  || "";
            currentPet.birthday = currentPet.birthday || { dd: "", mm: "", yy: "" };
            currentPet.records  = currentPet.records || [];

            const thumbImgProfile = document.getElementById("pet-thumb");
            if (thumbImgProfile && currentPet.photo) {
                thumbImgProfile.src = currentPet.photo;
            }

            const profileTitleSpan = document.getElementById("profile-pet-name");
            if (profileTitleSpan) {
                profileTitleSpan.textContent = currentPet.name || "Pet Name";
            }

            function formatDOB(pet) {
                if (!pet.birthday) return "—";
                const { dd, mm, yy } = pet.birthday;
                if (!dd && !mm && !yy) return "—";
                return [dd, mm, yy].filter(Boolean).join("/");
            }

            function renderRecordsForPet(pet) {
                const medContainer  = document.getElementById("profile-medical-list");
                const treatContainer = document.getElementById("profile-treatment-list");
                if (!medContainer || !treatContainer) return;

                const records = pet.records || [];
                const medical = records.filter(r => r.type === "medical");
                const treatments = records.filter(r => r.type === "treatment");

                function fillList(container, items, emptyText) {
                    container.innerHTML = "";
                    if (!items.length) {
                        container.innerHTML = `<p>${emptyText}</p>`;
                        return;
                    }

                    const ul = document.createElement("ul");

                    items.forEach(r => {
                        const li = document.createElement("li");
                        const datePart = r.date ? ` (${r.date})` : "";
                        const baseText = `${r.title || "Record"}${datePart} – `;

                        // First add the text part
                        li.appendChild(document.createTextNode(baseText));

                        if (r.fileUrl) {
                            // clickable link to open/download PDF
                            const link = document.createElement("a");
                            link.href = r.fileUrl;
                            link.target = "_blank";
                            link.rel = "noopener noreferrer";
                            link.textContent = r.fileName || "View PDF";
                            link.download = r.fileName || undefined; // suggest filename for download
                            li.appendChild(link);
                        } else {
                            // fallback for old records that have only fileName
                            li.appendChild(
                                document.createTextNode(r.fileName || "PDF")
                            );
                        }

                        ul.appendChild(li);
                    });

                    container.appendChild(ul);
                }

                fillList(medContainer, medical, "No medical records added yet.");
                fillList(treatContainer, treatments, "No treatments added yet.");
            }

            function renderProfileDetails() {
                const nameEl   = document.getElementById("profile-name");
                const typeEl   = document.getElementById("profile-type");
                const breedEl  = document.getElementById("profile-breed");
                const dobEl    = document.getElementById("profile-dob");
                const weightEl = document.getElementById("profile-weight");
                const colorEl  = document.getElementById("profile-color");
                const sexEl    = document.getElementById("profile-sex");
                const notesEl  = document.getElementById("profile-notes");

                if (nameEl)   nameEl.textContent   = currentPet.name  || "—";
                if (typeEl)   typeEl.textContent   = currentPet.type  || "—";
                if (breedEl)  breedEl.textContent  = currentPet.breed || "—";
                if (dobEl)    dobEl.textContent    = formatDOB(currentPet);
                if (weightEl) weightEl.textContent = currentPet.weight || "—";
                if (colorEl)  colorEl.textContent  = currentPet.color  || "—";
                if (sexEl)    sexEl.textContent    = currentPet.sex    || "—";
                if (notesEl)  notesEl.textContent  = currentPet.notes  || "—";
            }

            renderProfileDetails();
            renderRecordsForPet(currentPet);

            // edit modal
            const profileModalOverlay = document.getElementById("profile-modal-overlay");
            const profileModalClose   = document.getElementById("profile-modal-close");
            const profileEditForm     = document.getElementById("profile-edit-form");
            const editBtn             = document.getElementById("profile-edit-btn");

            const editName   = document.getElementById("edit-pet-name");
            const editType   = document.getElementById("edit-pet-type");
            const editBreed  = document.getElementById("edit-pet-breed");
            const editBdd    = document.getElementById("edit-bday-dd");
            const editBmm    = document.getElementById("edit-bday-mm");
            const editByy    = document.getElementById("edit-bday-yy");
            const editWeight = document.getElementById("edit-pet-weight");
            const editColor  = document.getElementById("edit-pet-color");
            const editSex    = document.getElementById("edit-pet-sex");
            const editNotes  = document.getElementById("edit-pet-notes");

            function openProfileModal() {
                if (!profileModalOverlay) return;

                if (editName)   editName.value   = currentPet.name  || "";
                if (editType)   editType.value   = currentPet.type  || "";
                if (editBreed)  editBreed.value  = currentPet.breed || "";

                if (editBdd) editBdd.value = currentPet.birthday.dd || "";
                if (editBmm) editBmm.value = currentPet.birthday.mm || "";
                if (editByy) editByy.value = currentPet.birthday.yy || "";

                if (editWeight) editWeight.value = currentPet.weight || "";
                if (editColor)  editColor.value  = currentPet.color  || "";
                if (editSex)    editSex.value    = currentPet.sex    || "";
                if (editNotes)  editNotes.value  = currentPet.notes  || "";

                profileModalOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
            }

            function closeProfileModal() {
                if (!profileModalOverlay) return;
                profileModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }

            if (editBtn) {
                editBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    openProfileModal();
                });
            }

            if (profileModalClose) {
                profileModalClose.addEventListener("click", (e) => {
                    e.preventDefault();
                    closeProfileModal();
                });
            }

            if (profileModalOverlay) {
                profileModalOverlay.addEventListener("click", (e) => {
                    if (e.target === profileModalOverlay) {
                        closeProfileModal();
                    }
                });
            }

            if (profileEditForm) {
                profileEditForm.addEventListener("submit", (e) => {
                    e.preventDefault();

                    if (editName)   currentPet.name   = editName.value.trim();
                    if (editType)   currentPet.type   = editType.value.trim();
                    if (editBreed)  currentPet.breed  = editBreed.value.trim();
                    if (editWeight) currentPet.weight = editWeight.value.trim();
                    if (editColor)  currentPet.color  = editColor.value.trim();
                    if (editSex)    currentPet.sex    = editSex.value.trim();
                    if (editNotes)  currentPet.notes  = editNotes.value.trim();

                    if (!currentPet.birthday) currentPet.birthday = { dd: "", mm: "", yy: "" };
                    if (editBdd) currentPet.birthday.dd = editBdd.value.trim();
                    if (editBmm) currentPet.birthday.mm = editBmm.value.trim();
                    if (editByy) currentPet.birthday.yy = editByy.value.trim();

                    const idx = pets.findIndex(p => String(p.id) === String(currentPet.id));
                    if (idx !== -1) {
                        pets[idx] = currentPet;
                        savePetsToSession(pets);
                    }

                    renderProfileDetails();
                    if (profileTitleSpan) {
                        profileTitleSpan.textContent = currentPet.name || "Pet Name";
                    }

                    populatePetProfilesNav();

                    closeProfileModal();
                });
            }

            // records modal
            const recordModalOverlay = document.getElementById("record-modal-overlay");
            const recordModalClose   = document.getElementById("record-modal-close");
            const recordAddBtn       = document.getElementById("profile-add-btn");
            const recordTreatBtn     = document.getElementById("record-add-treatment");
            const recordMedBtn       = document.getElementById("record-add-medical");
            const recordSelectedLbl  = document.getElementById("record-modal-selected");
            const recordTitleInput   = document.getElementById("record-title");
            const recordDateInput    = document.getElementById("record-date");
            const recordFileInput    = document.getElementById("record-file");
            const recordSaveBtn      = document.getElementById("record-save-btn");

            let currentRecordType = null;

            function openRecordModal() {
                if (!recordModalOverlay) return;

                currentRecordType = null;
                if (recordSelectedLbl) {
                    recordSelectedLbl.textContent =
                        "Select a type above, then upload a PDF.";
                }
                if (recordTitleInput) recordTitleInput.value = "";
                if (recordDateInput)  recordDateInput.value  = "";
                if (recordFileInput)  recordFileInput.value  = "";

                recordModalOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
            }

            function closeRecordModal() {
                if (!recordModalOverlay) return;
                recordModalOverlay.classList.remove("active");
                document.body.style.overflow = "";
            }

            if (recordAddBtn) {
                recordAddBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    openRecordModal();
                });
            }

            if (recordModalClose) {
                recordModalClose.addEventListener("click", (e) => {
                    e.preventDefault();
                    closeRecordModal();
                });
            }

            if (recordModalOverlay) {
                recordModalOverlay.addEventListener("click", (e) => {
                    if (e.target === recordModalOverlay) {
                        closeRecordModal();
                    }
                });
            }

            if (recordTreatBtn) {
                recordTreatBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    currentRecordType = "treatment";
                    if (recordSelectedLbl) {
                        recordSelectedLbl.textContent =
                            "Adding a Treatment record (PDF) for this pet.";
                    }
                });
            }

            if (recordMedBtn) {
                recordMedBtn.addEventListener("click", (e) => {
                    e.preventDefault();
                    currentRecordType = "medical";
                    if (recordSelectedLbl) {
                        recordSelectedLbl.textContent =
                            "Adding a Medical record (PDF) for this pet.";
                    }
                });
            }

            if (recordSaveBtn) {
                recordSaveBtn.addEventListener("click", (e) => {
                    e.preventDefault();

                    if (!currentRecordType) {
                        alert("Please choose Treatment or Medical record first.");
                        return;
                    }
                    if (!recordFileInput || !recordFileInput.files.length) {
                        alert("Please choose a PDF file to upload.");
                        return;
                    }

                    const file  = recordFileInput.files[0];
                    const title = (recordTitleInput?.value.trim()) || file.name;
                    const date  = recordDateInput?.value || "";

                    // Only allow PDF (extra safety)
                    if (file.type !== "application/pdf") {
                        alert("Only PDF files are allowed.");
                        return;
                    }

                    const allPets = getPetsFromSession();
                    const idx = allPets.findIndex(p => String(p.id) === String(currentPet.id));
                    if (idx === -1) {
                        alert("Something went wrong finding this pet.");
                        return;
                    }

                    const pet = allPets[idx];
                    pet.records = pet.records || [];

                    // Read file as Data URL so we can reopen it later
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const fileUrl = ev.target.result;  // data:application/pdf;base64,...

                        pet.records.push({
                            id: Date.now(),
                            type: currentRecordType,   // "medical" or "treatment"
                            title,
                            date,
                            fileName: file.name,
                            fileUrl                      // 🔗 stored here
                        });

                        savePetsToSession(allPets);

                        currentPet = allPets[idx];
                        renderRecordsForPet(currentPet);
                        closeRecordModal();
                    };

                    reader.onerror = () => {
                        alert("Could not read the PDF file.");
                    };

                    reader.readAsDataURL(file);
                });
            }

        }
    }

    // INTRO BUTTON
    const joinBtn = document.querySelector(".intro-btn");
    if (joinBtn) {
        joinBtn.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = "login.html";
        });
    }

    // FOOTER MODAL
    const footerLinks      = document.querySelectorAll("footer .footer-links a");
    const footerModal      = document.getElementById("footer-modal-overlay");
    const footerModalTitle = document.getElementById("footer-modal-title");
    const footerModalBody  = document.getElementById("footer-modal-body");
    const footerModalClose = document.querySelector(".footer-modal-close");

    function openFooterModal(type) {
        if (!footerModal || !footerModalTitle || !footerModalBody) return;

        let title = "";
        let body  = "";

        switch (type) {
            case "contact":
                title = "Contact";
                body  = `
                    <p>If you have any questions about your pet's care,
                    appointments, or reminders, please contact our support team:</p>
                    <ul>
                        <li>Email: support@petcareplus.example</li>
                        <li>Phone: (555) 123-4567</li>
                        <li>Hours: 9:00 AM – 5:00 PM (Mon–Fri)</li>
                    </ul>
                `;
                break;
            case "terms":
                title = "Terms of Service";
                body  = `
                    <p>PetCare+ is a student project dashboard designed to help
                    owners keep track of their pets' appointments and reminders.</p>
                    <p>By using this demo, you agree that all data shown here is
                    fictional and for educational purposes only.</p>
                `;
                break;
            case "privacy":
                title = "Privacy Policy";
                body  = `
                    <p>This demo does not store any real personal information.
                    All data is kept locally in your browser's session storage
                    and cleared when you close the tab.</p>
                `;
                break;
            default:
                title = "";
                body  = "";
        }

        footerModalTitle.textContent = title;
        footerModalBody.innerHTML    = body;
        footerModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeFooterModal() {
        if (!footerModal) return;
        footerModal.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (footerModal) {
        footerModal.addEventListener("click", (e) => {
            if (e.target === footerModal) {
                closeFooterModal();
            }
        });
    }
    if (footerModalClose) {
        footerModalClose.addEventListener("click", closeFooterModal);
    }

    footerLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const type     = link.dataset.footerLink;
            const loggedIn = sessionStorage.getItem("petcare_user_logged_in") === "true";

            if (type === "home" || type === "about") {
                if (!loggedIn && type === "home") {
                    event.preventDefault();
                    alert("Please login first.");
                    window.location.href = "login.html";
                }
                return;
            }

            event.preventDefault();

            if (!loggedIn) {
                alert("Please login first.");
                window.location.href = "login.html";
                return;
            }

            openFooterModal(type);
        });
    });

    // LOGOUT
    const logoutButtons = document.querySelectorAll(".logout-btn");
    logoutButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault();
            sessionStorage.setItem("petcare_user_logged_in", "false");
            sessionStorage.removeItem("petcare_current_user");
            window.location.href = "login.html";
        });
    });

    // NOTIFICATIONS PAGE
    const notifRoot = document.querySelector(".notifications-main");
    if (notifRoot) {
        const tbody = document.getElementById("notifications-body");

        function daysFromToday(dateStr) {
            if (!dateStr) return Infinity;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const d = new Date(dateStr + "T00:00:00");
            if (isNaN(d.getTime())) return Infinity;

            const diffMs = d.getTime() - today.getTime();
            return diffMs / (1000 * 60 * 60 * 24);
        }

        function labelWhen(dateStr, timeStr) {
            const diff = daysFromToday(dateStr);
            const timePart = timeStr ? ` at ${timeStr}` : "";

            if (diff === 0) return `Today${timePart}`;
            if (diff === 1) return `Tomorrow${timePart}`;
            if (diff > 1 && diff < 7) return `In ${Math.round(diff)} days${timePart}`;
            return `${dateStr}${timePart}`;
        }

        function buildNotifications() {
            if (!tbody) return;

            const all = getReservationsFromSession();

            // only show today + tomorrow
            const soon = all
                .filter(res => {
                    const diff = daysFromToday(res.date);
                    return diff === 0 || diff === 1;
                })
                .sort((a, b) => {
                    if (a.date !== b.date) return a.date.localeCompare(b.date);
                    return (a.time || "").localeCompare(b.time || "");
                });

            tbody.innerHTML = "";

            if (!soon.length) {
                const tr = document.createElement("tr");
                const td = document.createElement("td");
                td.colSpan = 4; // 4 columns in your table
                td.textContent = "No upcoming notifications for today or tomorrow.";
                tr.appendChild(td);
                tbody.appendChild(tr);
                return;
            }

            soon.forEach(res => {
                const tr = document.createElement("tr");

                const petTd  = document.createElement("td");
                const msgTd  = document.createElement("td");
                const whenTd = document.createElement("td");
                const actTd  = document.createElement("td");

                petTd.textContent = res.petName || "Pet";

                // Notification description
                const service = res.service || "Appointment";
                const location = res.location ? ` at ${res.location}` : "";
                msgTd.textContent =
                    `${service} for ${res.petName || "pet"}${location}.`;

                // When
                whenTd.textContent = labelWhen(res.date, res.time);

                // Actions cell
                actTd.className = "notif-actions-cell";

                const topRow = document.createElement("div");
                topRow.className = "notif-actions-top";

                // View button
                const viewBtn = document.createElement("button");
                viewBtn.className = "cta-btn notif-view-btn";
                viewBtn.textContent = "View";
                viewBtn.addEventListener("click", () => {
                    alert(
                        `${res.petName || "Pet"} – ${res.service || "Appointment"}\n` +
                        `${res.date || ""} at ${res.time || ""}\n` +
                        (res.location ? `Location: ${res.location}\n` : "") +
                        (res.notes ? `Notes: ${res.notes}` : "")
                    );
                });

                // Dismiss button (only hides from UI, leaves reservation)
                const dismissBtn = document.createElement("button");
                dismissBtn.className = "notif-dismiss-btn";
                dismissBtn.textContent = "Dismiss";
                dismissBtn.addEventListener("click", () => {
                    tr.remove();
                    if (!tbody.querySelector("tr")) {
                        const emptyTr = document.createElement("tr");
                        const emptyTd = document.createElement("td");
                        emptyTd.colSpan = 4;
                        emptyTd.textContent =
                            "No upcoming notifications for today or tomorrow.";
                        emptyTr.appendChild(emptyTd);
                        tbody.appendChild(emptyTr);
                    }
                });

                topRow.appendChild(viewBtn);
                topRow.appendChild(dismissBtn);

                // Reschedule button
                const reschedBtn = document.createElement("button");
                reschedBtn.className = "notif-resched-btn";
                reschedBtn.textContent = "Reschedule";
                reschedBtn.addEventListener("click", () => {
                    // Remember which reservation we're editing
                    sessionStorage.setItem("petcare_reschedule_id", String(res.id));
                    window.location.href = "reservation.html";
                });

                actTd.appendChild(topRow);
                actTd.appendChild(reschedBtn);

                tr.appendChild(petTd);
                tr.appendChild(msgTd);
                tr.appendChild(whenTd);
                tr.appendChild(actTd);

                tbody.appendChild(tr);
            });
        }

        buildNotifications();
    }

    // RESERVATION PAGE
    const reservationForm = document.getElementById("reservationForm");

    if (reservationForm) {
        const petSelect       = document.getElementById("resPetSelect");
        const resErrorBox     = document.getElementById("reservationError");
        const resSuccessBox   = document.getElementById("reservationSuccess");

        const pets = getPetsFromSession();
        pets.forEach(pet => {
            const opt = document.createElement("option");
            opt.value = pet.id;
            opt.textContent = pet.name;
            petSelect.appendChild(opt);
        });

        setupSingleSelectCheckboxGroup("serviceType");
        setupSingleSelectCheckboxGroup("resLocation");

        // ----------------------------
        // RESCHEDULE MODE: prefill form
        // ----------------------------
        const rescheduleId = sessionStorage.getItem("petcare_reschedule_id");
        let editingReservation = null;

        const reservationsForPrefill = getReservationsFromSession();
        if (rescheduleId) {
            editingReservation = reservationsForPrefill.find(
                r => String(r.id) === String(rescheduleId)
            );

            if (editingReservation) {
                // Pet select
                petSelect.value = editingReservation.petId;

                // Service checkboxes
                const serviceBoxes = document.querySelectorAll("input[name='serviceType']");
                serviceBoxes.forEach(box => {
                    box.checked = (box.value === editingReservation.service);
                });

                // Location checkboxes
                const locBoxes = document.querySelectorAll("input[name='resLocation']");
                locBoxes.forEach(box => {
                    box.checked = (box.value === editingReservation.location);
                });

                // Date, time, notes
                const resDateInput  = document.getElementById("resDate");
                const resTimeInput  = document.getElementById("resTime");
                const resNotesInput = document.getElementById("resNotes");

                if (resDateInput)  resDateInput.value  = editingReservation.date  || "";
                if (resTimeInput)  resTimeInput.value  = editingReservation.time  || "";
                if (resNotesInput) resNotesInput.value = editingReservation.notes || "";
            }
        }

        reservationForm.addEventListener("submit", (e) => {
            e.preventDefault();

            clearError(resErrorBox);
            if (resSuccessBox) {
                resSuccessBox.classList.add("d-none");
                resSuccessBox.textContent = "";
            }

            const loggedIn = sessionStorage.getItem("petcare_user_logged_in") === "true";
            if (!loggedIn) {
                alert("Please login first!");
                window.location.href = "login.html";
                return;
            }

            const petId   = petSelect.value;
            const petName = petSelect.options[petSelect.selectedIndex]?.text;
            const service  = getCheckedValue("serviceType");
            const location = getCheckedValue("resLocation");
            const date     = document.getElementById("resDate").value; // "YYYY-MM-DD"
            const time     = document.getElementById("resTime").value; // "HH:MM"
            const notes    = document.getElementById("resNotes").value.trim();

            if (!petId)    return showError(resErrorBox, "Please select a pet.");
            if (!service)  return showError(resErrorBox, "Select a service.");
            if (!location) return showError(resErrorBox, "Select a location.");
            if (!date)     return showError(resErrorBox, "Select a date.");
            if (!time)     return showError(resErrorBox, "Select a time.");

            // ============================
            // 6-HOUR RULE: must be at least 6 hours from now
            // ============================
            const now = new Date();
            const targetDateTime = new Date(`${date}T${time}:00`);

            if (isNaN(targetDateTime.getTime())) {
                return showError(resErrorBox, "Selected date/time is invalid.");
            }

            const diffMs   = targetDateTime.getTime() - now.getTime();
            const sixHours = 6 * 60 * 60 * 1000;

            if (diffMs < sixHours) {
                return showError(
                    resErrorBox,
                    "Appointments must be booked at least 6 hours in advance."
                );
            }

            const reservations = getReservationsFromSession();

            // 🔒 NO DOUBLE BOOKING: block same date + time for any *other* reservation
            const slotTaken = reservations.some(r =>
                r.date === date &&
                r.time === time &&
                (!rescheduleId || String(r.id) !== String(rescheduleId))
            );

            if (slotTaken) {
                return showError(
                    resErrorBox,
                    "This time slot is already booked. Please choose a different time."
                );
            }

            // ---------------------------------
            // CREATE NEW OR UPDATE EXISTING ONE
            // ---------------------------------
            if (rescheduleId) {
                // EDIT MODE
                const idx = reservations.findIndex(
                    r => String(r.id) === String(rescheduleId)
                );
                if (idx !== -1) {
                    reservations[idx] = {
                        ...reservations[idx],
                        petId,
                        petName,
                        service,
                        location,
                        date,
                        time,
                        notes,
                        updatedAt: new Date().toISOString()
                    };
                }
            } else {
                // NEW RESERVATION
                const newReservation = {
                    id: Date.now(),
                    petId,
                    petName,
                    service,
                    location,
                    date,
                    time,
                    notes,
                    createdAt: new Date().toISOString()
                };
                reservations.push(newReservation);
            }

            saveReservationsToSession(reservations);

            // reset UI
            reservationForm.reset();
            setupSingleSelectCheckboxGroup("serviceType");
            setupSingleSelectCheckboxGroup("resLocation");

            // ------------- REDIRECT LOGIC -------------
            if (rescheduleId) {
                // We just rescheduled -> clear flag, go back to Notifications
                sessionStorage.removeItem("petcare_reschedule_id");

                if (resSuccessBox) {
                    showSuccess(
                        resSuccessBox,
                        "Reservation rescheduled successfully! Redirecting to notifications..."
                    );
                }

                setTimeout(() => {
                    window.location.href = "notifications.html";
                }, 1500);

                return; // important: don't run the "new booking" logic below
            }

            // helper: is this booking today or tomorrow? (for new reservations only)
            function isTodayOrTomorrow(dateStr) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const d = new Date(dateStr + "T00:00:00");
                if (isNaN(d.getTime())) return false;

                const diffDays = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                return diffDays === 0 || diffDays === 1;
            }

            if (isTodayOrTomorrow(date)) {
                // ✅ show success message first
                if (resSuccessBox) {
                    showSuccess(
                        resSuccessBox,
                        "Appointment booked successfully! A notification has been created for you..."
                    );
                }

                // after 3 seconds, show alert + redirect to Notifications
                setTimeout(() => {
                    alert("You have a new upcoming notification for this appointment.");
                    window.location.href = "notifications.html";
                }, 3000);
            } else {
                // normal flow → Calendar (unchanged)
                if (resSuccessBox) {
                    showSuccess(
                        resSuccessBox,
                        "Appointment booked successfully! Redirecting to calendar..."
                    );
                }
                setTimeout(() => {
                    window.location.href = "calendar.html";
                }, 1200);
            }
        });

    }

    // PET PHOTO POPUP
    const petThumbBtn = document.getElementById("pet-thumb-btn");
    const petThumbImg = document.getElementById("pet-thumb");
    const petPopup    = document.getElementById("pet-photo-popup");
    const petPopupImg = document.getElementById("pet-photo-full");

    if (petThumbBtn && petThumbImg && petPopup && petPopupImg) {
        petThumbBtn.addEventListener("click", (e) => {
            e.preventDefault();
            petPopupImg.src = petThumbImg.src;
            petPopup.classList.add("active");
        });

        petPopup.addEventListener("click", () => {
            petPopup.classList.remove("active");
        });
    }

    // CALENDAR PAGE
    const calendarRoot = document.querySelector(".calendar-main");
    if (calendarRoot) {
        const monthLabel = document.getElementById("calendar-month-label");
        const prevBtn    = document.getElementById("calendar-prev");
        const nextBtn    = document.getElementById("calendar-next");
        const tbody      = document.getElementById("calendar-body");

        const modalOverlay = document.getElementById("calendar-modal-overlay");
        const modalBody    = document.getElementById("calendar-modal-body");
        const modalClose   = document.getElementById("calendar-modal-close");

        let currentMonth = new Date();
        currentMonth.setDate(1);

        function fmtMonthYear(d) {
            return d.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long"
            });
        }

        function formatLongDate(dateStr) {
            const d = new Date(dateStr + "T00:00:00");
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        }

        function getEventClass(service) {
            if (!service) return "calendar-event--veterinary"; // default category

            const s = service.toLowerCase();

            // Veterinary (Vet Visit, Veterinary, etc.)
            if (s.includes("vet") || s.includes("veterinary"))
                return "calendar-event--veterinary";

            // Grooming
            if (s.includes("groom")) 
                return "calendar-event--grooming";

            // Boarding or Daycare
            if (s.includes("board") || s.includes("daycare"))
                return "calendar-event--boarding";

            // fallback
            return "calendar-event--veterinary";
        }

        function groupReservations() {
            const all = getReservationsFromSession();
            const map = {};
            all.forEach(res => {
                if (!res.date) return;
                if (!map[res.date]) map[res.date] = [];
                map[res.date].push(res);
            });
            return map;
        }

        function openModalForDate(dateStr, items) {
            if (!modalOverlay || !modalBody) return;
            if (!items || !items.length) return;

            const title = formatLongDate(dateStr);

            const listHtml = items.map(res => {
                const time  = res.time || "";
                const loc   = res.location || "";
                const notes = res.notes
                    ? `<div class="calendar-modal-notes">${res.notes}</div>`
                    : "";
                return `
                    <div class="calendar-modal-item">
                        <div class="calendar-modal-title">
                            ${res.petName || "Pet"} – ${res.service || "Appointment"}
                        </div>
                        <div class="calendar-modal-meta">
                            ${time ? `<span>${time}</span>` : ""}
                            ${loc ? `<span>${loc}</span>` : ""}
                        </div>
                        ${notes}
                    </div>
                `;
            }).join("");

            modalBody.innerHTML = `
                <h3 class="calendar-modal-heading">${title}</h3>
                ${listHtml}
            `;

            modalOverlay.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeCalendarModal() {
            if (!modalOverlay) return;
            modalOverlay.classList.remove("active");
            document.body.style.overflow = "";
        }

        if (modalOverlay) {
            modalOverlay.addEventListener("click", (e) => {
                if (e.target === modalOverlay) {
                    closeCalendarModal();
                }
            });
        }
        if (modalClose) {
            modalClose.addEventListener("click", (e) => {
                e.preventDefault();
                closeCalendarModal();
            });
        }

        function buildCalendar() {
            if (!tbody) return;

            const eventsByDate = groupReservations();

            if (monthLabel) {
                monthLabel.textContent = fmtMonthYear(currentMonth);
            }

            tbody.innerHTML = "";

            const year  = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            const firstDay = new Date(year, month, 1);
            const nativeDow = firstDay.getDay();
            const offset = (nativeDow + 6) % 7;

            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let dayCounter = 1 - offset;

            for (let rowIndex = 0; rowIndex < 6; rowIndex++) {
                const tr = document.createElement("tr");

                for (let col = 0; col < 7; col++) {
                    const td = document.createElement("td");
                    td.className = "calendar-cell";

                    const cellDate = new Date(year, month, dayCounter);
                    const cellMonth = cellDate.getMonth();
                    const dateStr = cellDate.toISOString().slice(0, 10);

                    td.dataset.date = dateStr;

                    if (cellMonth !== month) {
                        td.classList.add("other-month");
                    }

                    const dayNumber = document.createElement("div");
                    dayNumber.className = "calendar-day-number";
                    dayNumber.textContent = String(cellDate.getDate());
                    td.appendChild(dayNumber);

                    const dayEvents = eventsByDate[dateStr] || [];
                    dayEvents.forEach(res => {
                        const ev = document.createElement("div");
                        ev.className = "calendar-event " + getEventClass(res.service);
                        ev.textContent =
                            (res.petName || "Pet") + " – " + (res.service || "Appointment");
                        td.appendChild(ev);
                    });

                    if (dayEvents.length) {
                        td.classList.add("calendar-cell--has-events");
                        td.addEventListener("click", () => {
                            openModalForDate(dateStr, dayEvents);
                        });
                    }

                    tr.appendChild(td);
                    dayCounter++;
                }

                tbody.appendChild(tr);
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                currentMonth.setMonth(currentMonth.getMonth() - 1);
                buildCalendar();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                currentMonth.setMonth(currentMonth.getMonth() + 1);
                buildCalendar();
            });
        }

        buildCalendar();
    }

    // finally: fill sidebar list
    populatePetProfilesNav();
});

// ===============================
// SIDEBAR OPEN/CLOSE (hamburger)
// ===============================

const openMenu   = document.querySelector('#show-menu');
const hideMenu   = document.querySelector('#hide-menu');
const sideMenu   = document.querySelector('#nav-menu');
const overlay    = document.querySelector('#sidebar-overlay');

if (openMenu && hideMenu && sideMenu && overlay) {
    function openSidebar(e) {
        e.preventDefault();
        sideMenu.classList.add('active');
        overlay.classList.add('active');
    }

    function closeSidebar(e) {
        if (e) e.preventDefault();
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
    }

    openMenu.addEventListener('click', openSidebar);
    hideMenu.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
}
