console.log("JavaScript Is working!");

document.addEventListener("DOMContentLoaded", function () {

    // Global Active State Identifier
    const bodyPage = document.body.getAttribute("data-page");
    console.log(`[Maduka Library] Current Page Context: ${bodyPage}`);

    // ----------------------------------------------------------------------
    // 1. GLOBAL OPAC QUICK SEARCH HANDLER
    // ----------------------------------------------------------------------
    const quickSearchForm = id("quick-search");
    if (quickSearchForm) {
        quickSearchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const queryInput = this.querySelector("input[type='search']");
            const query = queryInput ? queryInput.value.trim() : "";

            if (query.length === 0) {
                alert("Please enter a book title, author, or ISBN keyword to search the catalog.");
            } else {
                alert(`Redirecting to Maduka OPAC Catalog search for: "${query}"...\n(Portal Gateway: mue.cblibrary.ng)`);
                window.open(`https://mue.cblibrary.ng`, "_blank");
            }
        });
    }

    // ----------------------------------------------------------------------
    // 2. RULES PAGE: INTERACTIVE BORROWING & FINE CALCULATOR LOGIC
    // ----------------------------------------------------------------------
    const calculateBtn = id("calculate-btn");
    const calcOutput = id("calculator-output");

    if (calculateBtn && calcOutput) {
        calculateBtn.addEventListener("click", function () {
            const userCategory = id("user-category").value;
            const daysOverdue = parseInt(id("days-overdue").value, 10);
            const clearanceStatus = id("clearance-status").value;

            // Form validation for calculator
            if (!userCategory) {
                renderOutput(calcOutput, "⚠️ Please select your User Category / Academic Level first.", false);
                return;
            }

            if (isNaN(daysOverdue) || daysOverdue < 0) {
                renderOutput(calcOutput, "⚠️ Please enter a valid non-negative number for overdue days.", false);
                return;
            }

            if (clearanceStatus === "pending") {
                renderOutput(calcOutput, "❌ Access Restricted: You have pending library fees. Please clear fees at the circulation desk to resume borrowing.", false);
                return;
            }

            // Calculation Algorithm
            let maxBooks = 0;
            let loanPeriodDays = 0;
            let fineRatePerDay = 100; // Default 100 Naira
            let categoryName = "";

            switch (userCategory) {
                case "100":
                    maxBooks = 2;
                    loanPeriodDays = 14;
                    fineRatePerDay = 100;
                    categoryName = "100 Level Student";
                    break;
                case "200":
                    maxBooks = 2;
                    loanPeriodDays = 14;
                    fineRatePerDay = 100;
                    categoryName = "200 / 300 Level Student";
                    break;
                case "400":
                    maxBooks = 4;
                    loanPeriodDays = 21;
                    fineRatePerDay = 100;
                    categoryName = "400 Level / Finalist";
                    break;
                case "pg":
                    maxBooks = 6;
                    loanPeriodDays = 30;
                    fineRatePerDay = 200;
                    categoryName = "Postgraduate Scholar";
                    break;
                case "faculty":
                    maxBooks = 10;
                    loanPeriodDays = 60;
                    fineRatePerDay = 0; // Staff exempt
                    categoryName = "Academic Staff / Faculty";
                    break;
                default:
                    renderOutput(calcOutput, "Invalid selection.", false);
                    return;
            }

            // Calculate Fine
            let totalFine = daysOverdue * fineRatePerDay;

            // Generate Output Message
            let resultHTML = `
                <div style="text-align: left;">
                    <h4>📋 Status Summary for: ${categoryName}</h4>
                    <ul>
                        <li><strong>Maximum Physical Books Allowance:</strong> ${maxBooks} Volumes</li>
                        <li><strong>Standard Loan Duration:</strong> ${loanPeriodDays} Days</li>
                        <li><strong>Overdue Fine Rate:</strong> &#8358;${fineRatePerDay} / day</li>
                        <li><strong>Days Overdue Recorded:</strong> ${daysOverdue} Days</li>
                    </ul>
            `;

            if (daysOverdue > 0) {
                if (fineRatePerDay === 0) {
                    resultHTML += `<p style="margin-top:10px; color:#155724;"><strong>Fine Status:</strong> Faculty Privilege Applied (Grace Period active, no monetary fine charged).</p>`;
                } else {
                    resultHTML += `<p style="margin-top:10px; color:#721c24;"><strong>⚠️ Total Fine Payable:</strong> &#8358;${totalFine.toLocaleString()} Naira. Please clear this balance at the ground floor desk.</p>`;
                }
                renderOutputRaw(calcOutput, resultHTML, fineRatePerDay === 0);
            } else {
                resultHTML += `<p style="margin-top:10px; color:#155724;"><strong>✅ Account Clean:</strong> You have no overdue fines. You are eligible to borrow up to ${maxBooks} books today!</p>`;
                renderOutputRaw(calcOutput, resultHTML, true);
            }
        });
    }

    // ----------------------------------------------------------------------
    // 3. STAFF DIRECTORY: SEARCH & CATEGORY FILTERING
    // ----------------------------------------------------------------------
    const staffSearchInput = id("staff-search-input");
    const departmentFilter = id("department-filter");
    const resetStaffBtn = id("reset-staff-filter");
    const staffCards = document.querySelectorAll(".staff-card");

    if (staffCards.length > 0) {
        function filterStaff() {
            const searchTerm = staffSearchInput ? staffSearchInput.value.toLowerCase().trim() : "";
            const selectedDept = departmentFilter ? departmentFilter.value : "all";

            staffCards.forEach(card => {
                const cardName = card.querySelector("h3").textContent.toLowerCase();
                const cardBio = card.querySelector(".staff-details").textContent.toLowerCase();
                const cardCategory = card.getAttribute("data-category");

                const matchesSearch = cardName.includes(searchTerm) || cardBio.includes(searchTerm);
                const matchesDept = selectedDept === "all" || cardCategory === selectedDept;

                if (matchesSearch && matchesDept) {
                    card.style.display = "block";
                } else {
                    card.style.display = "none";
                }
            });
        }

        if (staffSearchInput) staffSearchInput.addEventListener("input", filterStaff);
        if (departmentFilter) departmentFilter.addEventListener("change", filterStaff);

        if (resetStaffBtn) {
            resetStaffBtn.addEventListener("click", function () {
                if (staffSearchInput) staffSearchInput.value = "";
                if (departmentFilter) departmentFilter.value = "all";
                filterStaff();
            });
        }
    }

    // ----------------------------------------------------------------------
    // 4. CONTACT FORM: REGEX VALIDATION & SUBMISSION
    // ----------------------------------------------------------------------
    const contactForm = id("contact-form");
    const formFeedback = id("form-feedback-message");

    if (contactForm && formFeedback) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Stop default page refresh

            let isValid = true;

            // DOM Elements
            const fullName = id("full-name");
            const email = id("email-addr");
            const matricNo = id("matric-no");
            const category = id("category");
            const message = id("message-body");

            // Error Message Containers
            const nameErr = id("name-error");
            const emailErr = id("email-error");
            const matricErr = id("matric-error");
            const catErr = id("category-error");
            const msgErr = id("message-error");

            // Reset Errors
            [nameErr, emailErr, matricErr, catErr, msgErr].forEach(el => {
                if (el) el.textContent = "";
            });

            // Name Validation
            if (!fullName || fullName.value.trim().length < 3) {
                if (nameErr) nameErr.textContent = "Please enter your full name (minimum 3 letters).";
                isValid = false;
            }

            // Email Regex Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email.value.trim())) {
                if (emailErr) emailErr.textContent = "Please enter a valid email address (e.g., student@madukauniversity.edu.ng).";
                isValid = false;
            }

            // Matric Number Validation
            if (!matricNo || matricNo.value.trim().length < 4) {
                if (matricErr) matricErr.textContent = "Matriculation or Staff ID is required.";
                isValid = false;
            }

            // Category Selection Validation
            if (!category || category.value === "") {
                if (catErr) catErr.textContent = "Please select an inquiry category.";
                isValid = false;
            }

            // Message Length Validation
            if (!message || message.value.trim().length < 15) {
                if (msgErr) msgErr.textContent = "Message content must be at least 15 characters long.";
                isValid = false;
            }

            // Process Validation Outcome
            if (isValid) {
                const ticketNumber = Math.floor(100000 + Math.random() * 900000);
                const successMessage = `
                    ✅ <strong>Inquiry Ticket #${ticketNumber} Created Successfully!</strong><br>
                    Thank you, <strong>${escapeHTML(fullName.value)}</strong>. Your inquiry regarding <em>"${escapeHTML(category.value)}"</em> has been routed to the Library Support Desk. A confirmation email has been dispatched to <code>${escapeHTML(email.value)}</code>.
                `;
                renderOutputRaw(formFeedback, successMessage, true);
                contactForm.reset();
            } else {
                renderOutput(formFeedback, "⚠️ Please correct the errors highlighted above before submitting.", false);
            }
        });
    }

    // ----------------------------------------------------------------------
    // HELPER FUNCTIONS
    // ----------------------------------------------------------------------
    function id(elementId) {
        return document.getElementById(elementId);
    }

    function renderOutput(targetEl, text, isSuccess) {
        targetEl.textContent = text;
        targetEl.className = "result-message-box " + (isSuccess ? "result-success" : "result-danger");
        targetEl.style.display = "block";
    }

    function renderOutputRaw(targetEl, htmlContent, isSuccess) {
        targetEl.innerHTML = htmlContent;
        targetEl.className = "result-message-box " + (isSuccess ? "result-success" : "result-danger");
        targetEl.style.display = "block";
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

});
