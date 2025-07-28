const container = document.querySelector(".container");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const closeButton = document.querySelector(".close-button");

function createItem(item) {
  // Check if it's a sentence (ends with ., ?, !)
  const isSentence = /[.!?]$/.test(item.Sound_de.trim());

  let soundContent = "";
  let maxSliderValue;
  let segments;
  if (isSentence) {
    segments = item.Sound_de.split(" ");
    soundContent = segments.map((word) => `<span>${word}</span>`).join(" ");
    maxSliderValue = segments.length;
  } else {
    segments = item.Sound_de.split("");
    soundContent = segments.map((char) => `<span>${char}</span>`).join("");
    maxSliderValue = segments.length;
  }

  // Determine the color class based on the article
  let colorClass = "";
  // Only apply color if it's not a sentence and starts with a specific article
  if (!isSentence) {
    const lowerCaseSoundDe = item.Sound_de.toLowerCase().trim();
    if (lowerCaseSoundDe.startsWith("die ")) {
      colorClass = "pink-text";
    } else if (lowerCaseSoundDe.startsWith("der ")) {
      colorClass = "blue-text";
    } else if (lowerCaseSoundDe.startsWith("das ")) {
      colorClass = "green-text";
    }
  }

  // Add root icon if root exists
  let rootIconHtml = "";
  if (item.root && item.root.trim() !== "") {
    rootIconHtml = `<div class="root-icon" data-root-content="${item.root}">i</div>`;
  }

  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");
  itemDiv.innerHTML = `
                <div class="item-top">
                    <div class="filename">${item.Filename}</div>
                    <div class="translate">${item.translate_fa}</div>
                </div>
                ${rootIconHtml} <div class="item-bottom">
                    <div class="sound ${
                      isSentence ? "sentence" : ""
                    } ${colorClass}">${soundContent}</div>
                    <input type="text" class="input-text" placeholder="Testen Sie Ihr Schreiben.">
                    <audio src="audio/${item.file}" preload="none"></audio>
                    <button class="play-btn">Play Sound</button>
                    <button class="delete-btn">Delete</button>
                    <div class="control-buttons">
                        <input type="range" min="0" max="${maxSliderValue}" value="0" step="1" class="reveal-slider">
                    </div>
                </div>
            `;

  // Initialize reveal/hide indices
  itemDiv.dataset.revealIndex = "0";

  // Add event listener for play button
  const playButton = itemDiv.querySelector(".play-btn");
  const audio = itemDiv.querySelector("audio");
  playButton.addEventListener("click", () => {
    audio.play();
  });

  // Add event listener for delete button
  const deleteButton = itemDiv.querySelector(".delete-btn");
  deleteButton.addEventListener("click", () => {
    itemDiv.remove();
  });

  // Add event listener for revealing/hiding sound text on click
  const soundText = itemDiv.querySelector(".sound");

  soundText.addEventListener("click", () => {
    const spans = soundText.querySelectorAll("span");
    const allRevealed = Array.from(spans).every((span) =>
      span.classList.contains("revealed")
    );
    spans.forEach((span) => {
      span.classList.toggle("revealed", !allRevealed);
    });
    itemDiv.dataset.revealIndex = allRevealed ? "0" : spans.length;
    const slider = itemDiv.querySelector(".reveal-slider");
    slider.value = allRevealed ? 0 : spans.length;
    const percentage = (slider.value / maxSliderValue) * 100;
    slider.style.background = `linear-gradient(to right, #00ff88 ${percentage}%, #34495e ${percentage}%)`;
  });

  const slider = itemDiv.querySelector(".reveal-slider");
  slider.addEventListener("input", () => {
    const revealIndex = parseInt(slider.value);
    const spans = soundText.querySelectorAll("span");
    spans.forEach((span, index) => {
      span.classList.toggle("revealed", index < revealIndex);
    });
    itemDiv.dataset.revealIndex = revealIndex;
    const percentage = (revealIndex / maxSliderValue) * 100;
    slider.style.background = `linear-gradient(to right, #00ff88 ${percentage}%, #34495e ${percentage}%)`;
  });

  // Add event listener for input text
  const inputText = itemDiv.querySelector(".input-text");
  inputText.addEventListener("input", () => {
    if (inputText.value.trim() === item.Sound_de) {
      inputText.classList.add("correct");
    } else {
      inputText.classList.remove("correct");
    }
  });

  // Add event listener for the root icon to open modal
  const rootIcon = itemDiv.querySelector(".root-icon");
  if (rootIcon) {
    rootIcon.addEventListener("click", () => {
      modalRootContent.textContent = rootIcon.dataset.rootContent;
      rootModal.classList.add("show");
    });
  }

  return itemDiv;
}

// function renderItems(items) {
//   container.innerHTML = "";
//   const groupSize = 50;
//   const groups = Math.ceil(items.length / groupSize);

//   for (let i = 0; i < groups; i++) {
//     const start = i * groupSize;
//     const end = Math.min(start + groupSize, items.length);

//     const accordionDiv = document.createElement("div");
//     accordionDiv.classList.add("accordion");

//     const accordionHeader = document.createElement("div");
//     accordionHeader.classList.add("accordion-header");
//     accordionHeader.innerHTML = `
//                         <span>Gruppe ${i + 1} (${start + 1} - ${end})</span>
//                         <button class="toggle-textbox-btn" disabled>Text ein</button>
//                     `;

//     const accordionContent = document.createElement("div");
//     accordionContent.classList.add("accordion-content");
//     accordionContent.dataset.groupIndex = i; // Store group index for reference

//     accordionDiv.appendChild(accordionHeader);
//     accordionDiv.appendChild(accordionContent);
//     container.appendChild(accordionDiv);

//     accordionHeader.addEventListener("click", (e) => {
//       if (
//         e.target.classList.contains("toggle-textbox-btn") ||
//         e.target.closest(".toggle-textbox-btn")
//       ) {
//         return;
//       }
//       const isActive = accordionContent.classList.contains("active");

//       // Close all other accordions
//       document.querySelectorAll(".accordion-content").forEach((content) => {
//         if (
//           content !== accordionContent &&
//           content.classList.contains("active")
//         ) {
//           content.classList.remove("active");
//           content.innerHTML = ""; // Clear content of other accordions
//           const otherHeader = content.previousElementSibling;
//           const otherToggleButton = otherHeader.querySelector(
//             ".toggle-textbox-btn"
//           );
//           otherToggleButton.disabled = true; // Disable button for closed accordions
//           otherToggleButton.textContent = "Text ein"; // Reset button text
//         }
//       });

//       // Toggle the clicked accordion
//       accordionContent.classList.toggle("active");
//       const toggleTextboxButton = accordionHeader.querySelector(
//         ".toggle-textbox-btn"
//       );
//       toggleTextboxButton.disabled =
//         !accordionContent.classList.contains("active"); // Enable/disable button based on accordion state

//       if (isActive) {
//         // Clear content when closing
//         accordionContent.innerHTML = "";
//         toggleTextboxButton.textContent = "Text ein";
//       } else {
//         // Create items when opening
//         const groupIndex = parseInt(accordionContent.dataset.groupIndex);
//         const groupStart = groupIndex * groupSize;
//         const groupEnd = Math.min(groupStart + groupSize, items.length);
//         const currentGroupItems = items.slice(groupStart, groupEnd);

//         currentGroupItems.forEach((item) => {
//           const itemDiv = createItem(item);
//           accordionContent.appendChild(itemDiv);
//         });
//       }
//     });

//     const toggleTextboxButton = accordionHeader.querySelector(
//       ".toggle-textbox-btn"
//     );
//     toggleTextboxButton.addEventListener("click", (e) => {
//       e.stopPropagation();
//       const textboxes = accordionContent.querySelectorAll(".input-text");
//       const isHidden =
//         textboxes[0]?.style.display === "none" ||
//         textboxes[0]?.style.display === "";
//       textboxes.forEach((textbox) => {
//         textbox.style.display = isHidden ? "block" : "none";
//       });
//       toggleTextboxButton.textContent = isHidden ? "Text aus" : "Text ein";
//     });
//   }
// }

// Event listener to close the modal

// ... (بقیه کد همان است تا بخش renderItems)

function renderItems(items) {
    container.innerHTML = "";
    const groupedItems = groupItems(items);
    const groupSize = 50;
    const groups = Math.ceil(items.length / groupSize);

    for (let i = 0; i < groups; i++) {
        const start = i * groupSize;
        const end = Math.min(start + groupSize, items.length);

        const accordionDiv = document.createElement("div");
        accordionDiv.classList.add("accordion");

        const accordionHeader = document.createElement("div");
        accordionHeader.classList.add("accordion-header");
        accordionHeader.innerHTML = `
            <span>Gruppe ${i + 1} (${start + 1} - ${end})</span>
            <button class="toggle-textbox-btn" disabled>Text ein</button>
            <button class="test-btn">تست</button> <!-- دکمه جدید تست -->
        `;

        const accordionContent = document.createElement("div");
        accordionContent.classList.add("accordion-content");
        accordionContent.dataset.groupIndex = i;

        accordionDiv.appendChild(accordionHeader);
        accordionDiv.appendChild(accordionContent);
        container.appendChild(accordionDiv);

        accordionHeader.addEventListener("click", (e) => {
            if (
                e.target.classList.contains("toggle-textbox-btn") ||
                e.target.closest(".toggle-textbox-btn") ||
                e.target.classList.contains("test-btn") ||
                e.target.closest(".test-btn")
            ) {
                return;
            }
            const isActive = accordionContent.classList.contains("active");

            // بستن سایر آکاردئون‌ها
            document.querySelectorAll(".accordion-content").forEach((content) => {
                if (
                    content !== accordionContent &&
                    content.classList.contains("active")
                ) {
                    content.classList.remove("active");
                    content.innerHTML = "";
                    const otherHeader = content.previousElementSibling;
                    const otherToggleButton = otherHeader.querySelector(
                        ".toggle-textbox-btn"
                    );
                    otherToggleButton.disabled = true;
                    otherToggleButton.textContent = "Text ein";
                }
            });

            // باز و بسته کردن آکاردئون کلیک‌شده
            accordionContent.classList.toggle("active");
            const toggleTextboxButton = accordionHeader.querySelector(
                ".toggle-textbox-btn"
            );
            toggleTextboxButton.disabled =
                !accordionContent.classList.contains("active");

            if (isActive) {
                accordionContent.innerHTML = "";
                toggleTextboxButton.textContent = "Text ein";
            } else {
                const groupIndex = parseInt(accordionContent.dataset.groupIndex);
                const groupStart = groupIndex * groupSize;
                const groupEnd = Math.min(groupStart + groupSize, items.length);
                const currentGroupItems = groupedItems.filter((group) =>
                    group.some(
                        (item) =>
                            parseInt(item.Filename) >= groupStart + 1 &&
                            parseInt(item.Filename) <= groupEnd
                    )
                );

                currentGroupItems.forEach((group) => {
                    const itemDiv = createItem(group);
                    accordionContent.appendChild(itemDiv);
                });
            }
        });

        const toggleTextboxButton = accordionHeader.querySelector(
            ".toggle-textbox-btn"
        );
        toggleTextboxButton.addEventListener("click", (e) => {
            e.stopPropagation();
            const textboxes = accordionContent.querySelectorAll(".input-text");
            const isHidden =
                textboxes[0]?.style.display === "none" ||
                textboxes[0]?.style.display === "";
            textboxes.forEach((textbox) => {
                textbox.style.display = isHidden ? "block" : "none";
            });
            toggleTextboxButton.textContent = isHidden ? "Text aus" : "Text ein";
        });

        // رویداد برای دکمه تست
        const testButton = accordionHeader.querySelector(".test-btn");
        testButton.addEventListener("click", (e) => {
            e.stopPropagation();
            const groupIndex = parseInt(accordionContent.dataset.groupIndex);
            const groupStart = groupIndex * groupSize;
            const groupEnd = Math.min(groupStart + groupSize, items.length);
            const currentGroupItems = groupedItems.filter((group) =>
                group.some(
                    (item) =>
                        parseInt(item.Filename) >= groupStart + 1 &&
                        parseInt(item.Filename) <= groupEnd
                )
            );

            // جمع‌آوری تمام آیتم‌های گروه (کلمات و جملات)
            const groupData = currentGroupItems.flat(); // فلت کردن آرایه گروه‌ها برای گرفتن همه آیتم‌ها
            // ذخیره داده‌ها در localStorage
            localStorage.setItem("testGroupData", JSON.stringify(groupData));
            // هدایت به صفحه آزمون
            window.location.href = "worttest.html";
        });
    }
}

// ... (بقیه کد بدون تغییر)
closeButton.addEventListener("click", () => {
  rootModal.classList.remove("show");
});

// Close modal when clicking outside of the content
rootModal.addEventListener("click", (e) => {
  if (e.target === rootModal) {
    rootModal.classList.remove("show");
  }
});

// // Fetch data from json-worter.json (using the provided test data)
// const testData = [
//     {
//         "Filename": "1603",
//         "Sound_de": "die Vorsicht",
//         "translate_fa": "احتیاط",
//         "file": "1603_de.mp3",
//         "root": "vor (قبل) + sicht (دید، نگاه)"
//     },
//     {
//         "Filename": "1604",
//         "Sound_de": "Vorsicht! Da kommt ein Auto.",
//         "translate_fa": "احتیاط! یک ماشین می‌آید.",
//         "file": "1604_de.mp3",
//         "root": ""
//     },
//     {
//         "Filename": "1605",
//         "Sound_de": "(sich) vorstellen",
//         "translate_fa": "معرفی کردن (خود)",
//         "file": "1605_de.mp3",
//         "root": "vor (قبل) + stellen (قرار دادن)"
//     },
//     {
//         "Filename": "1606",
//         "Sound_de": "Wir wollen uns kennenlernen. Können Sie sich bitte vorstellen?",
//         "translate_fa": "ما می‌خواهیم با هم آشنا شویم. لطفاً خودتان را معرفی کنید.",
//         "file": "1606_de.mp3",
//         "root": ""
//     },
//     {
//         "Filename": "1607",
//         "Sound_de": "das Vorwahl",
//         "translate_fa": "کد منطقه",
//         "file": "1607_de.mp3",
//         "root": "vor (قبل) + wählen (انتخاب کردن، شماره‌گیری)"
//     },
//     {
//         "Filename": "1608",
//         "Sound_de": "Wie ist die Vorwahl von München?",
//         "translate_fa": "کد منطقه مونیخ چیست؟",
//         "file": "1608_de.mp3",
//         "root": ""
//     },
//     {
//         "Filename": "1609",
//         "Sound_de": "der wandern",
//         "translate_fa": "پیاده‌روی کردن",
//         "file": "1609_de.mp3",
//         "root": ""
//     }
// ];
// renderItems(testData); // Use testData directly for demonstration

// In a real scenario, uncomment the fetch call and remove the testData usage:

fetch("json-worter.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load JSON file");
    }
    return response.json();
  })
  .then((data) => {
    renderItems(data);
  })
  .catch((error) => {
    container.innerHTML = `<div class="error">خطا در بارگذاری فایل JSON: ${error.message}</div>`;
  });
