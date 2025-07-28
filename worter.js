const container = document.querySelector(".container");
const rootModal = document.getElementById("rootModal");
const modalRootContent = document.getElementById("modalRootContent");
const closeButton = document.querySelector(".close-button");

function groupItems(items) {
  const grouped = [];
  let currentGroup = [];
  let lastWord = null;

  items.forEach((item, index) => {
    const isSentence = /[.!?]$/.test(item.Sound_de.trim());
    if (!isSentence) {
      if (currentGroup.length > 0) {
        grouped.push(currentGroup);
        currentGroup = [];
      }
      currentGroup.push(item);
      lastWord = item;
    } else if (lastWord && index === parseInt(lastWord.Filename) + 1) {
      currentGroup.push(item);
    } else {
      if (currentGroup.length > 0) {
        grouped.push(currentGroup);
        currentGroup = [];
      }
      currentGroup.push(item);
      lastWord = null;
    }
  });

  if (currentGroup.length > 0) {
    grouped.push(currentGroup);
  }

  return grouped;
}

function createItem(group) {
  const mainItem = group[0];
  const relatedItems = group.slice(1);

  const isMainSentence = /[.!?]$/.test(mainItem.Sound_de.trim());

  let colorClass = "";
  if (!isMainSentence) {
    const lowerCaseSoundDe = mainItem.Sound_de.toLowerCase().trim();
    if (lowerCaseSoundDe.startsWith("die ")) {
      colorClass = "pink-text";
    } else if (lowerCaseSoundDe.startsWith("der ")) {
      colorClass = "blue-text";
    } else if (lowerCaseSoundDe.startsWith("das ")) {
      colorClass = "green-text";
    }
  }

  let rootIconHtml = "";
  if (mainItem.root && mainItem.root.trim() !== "") {
    rootIconHtml = `<div class="root-icon" data-root-content="${mainItem.root}">i</div>`;
  }

  const itemDiv = document.createElement("div");
  itemDiv.classList.add("item");

  itemDiv.innerHTML = `
        <div class="item-top">
            <div class="filename">${mainItem.Filename}</div>
            <div class="translate">${mainItem.translate_fa}</div>
        </div>
        ${rootIconHtml}
    `;

  const createItemBottom = (item, isSentence) => {
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

    const itemBottom = document.createElement("div");
    itemBottom.classList.add("item-bottom");
    // itemBottom.innerHTML = `
    //         <div class="sound ${isSentence ? "sentence" : ""} ${
    //   isSentence ? "" : colorClass
    // }">${soundContent}</div>
    //         <input type="text" class="input-text" placeholder="Testen Sie Ihr Schreiben.">
    //         <audio src="audio/${item.file}" preload="none"></audio>
    //         <div class="control-buttons">
    //             <button class="delete-btn">Delete</button>
    //             <button class="play-btn">Play Sound</button>
    //             <input type="range" min="0" max="${maxSliderValue}" value="0" step="1" class="reveal-slider">
    //         </div>
    //     `;

    itemBottom.innerHTML = `
    <div class="sound ${isSentence ? "sentence" : ""} ${
      isSentence ? "" : colorClass
    }">${soundContent}</div>
    <input type="text" class="input-text" placeholder="Testen Sie Ihr Schreiben.">
    <audio src="audio/${item.file}" preload="none"></audio>
    <div class="control-buttons">
        <button class="delete-btn">Delete</button>
        <button class="play-btn">Play Sound</button>
       
    </div>
    <input type="range" min="0" max="${maxSliderValue}" value="0" step="1" class="reveal-slider">
`;

    itemBottom.dataset.revealIndex = "0";

    const playButton = itemBottom.querySelector(".play-btn");
    const audio = itemBottom.querySelector("audio");
    playButton.addEventListener("click", () => {
      audio.play();
    });

    const deleteButton = itemBottom.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      itemDiv.remove();
    });

    const soundText = itemBottom.querySelector(".sound");
    soundText.addEventListener("click", () => {
      const spans = soundText.querySelectorAll("span");
      const allRevealed = Array.from(spans).every((span) =>
        span.classList.contains("revealed")
      );
      spans.forEach((span) => {
        span.classList.toggle("revealed", !allRevealed);
      });
      itemBottom.dataset.revealIndex = allRevealed ? "0" : spans.length;
      const slider = itemBottom.querySelector(".reveal-slider");
      slider.value = allRevealed ? 0 : spans.length;
      const percentage = (slider.value / maxSliderValue) * 100;
      slider.style.background = `linear-gradient(to right, #00ff88 ${percentage}%, #34495e ${percentage}%)`;
    });

    const slider = itemBottom.querySelector(".reveal-slider");
    slider.addEventListener("input", () => {
      const revealIndex = parseInt(slider.value);
      const spans = soundText.querySelectorAll("span");
      spans.forEach((span, index) => {
        span.classList.toggle("revealed", index < revealIndex);
      });
      itemBottom.dataset.revealIndex = revealIndex;
      const percentage = (revealIndex / maxSliderValue) * 100;
      slider.style.background = `linear-gradient(to right, #00ff88 ${percentage}%, #34495e ${percentage}%)`;
    });

    const inputText = itemBottom.querySelector(".input-text");
    inputText.addEventListener("input", () => {
      if (inputText.value.trim() === item.Sound_de) {
        inputText.classList.add("correct");
      } else {
        inputText.classList.remove("correct");
      }
    });

    return itemBottom;
  };

  const mainItemBottom = createItemBottom(mainItem, isMainSentence);
  itemDiv.appendChild(mainItemBottom);

  relatedItems.forEach((relatedItem) => {
    const isRelatedSentence = /[.!?]$/.test(relatedItem.Sound_de.trim());
    const relatedItemBottom = createItemBottom(relatedItem, isRelatedSentence);
    relatedItemBottom.querySelector(".sound").classList.add("sentence");
    relatedItemBottom.querySelector(".translate")?.remove();
    itemDiv.appendChild(relatedItemBottom);
  });

  const rootIcon = itemDiv.querySelector(".root-icon");
  if (rootIcon) {
    rootIcon.addEventListener("click", () => {
      modalRootContent.textContent = rootIcon.dataset.rootContent;
      rootModal.classList.add("show");
    });
  }

  return itemDiv;
}

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
    // accordionHeader.innerHTML = `
    //         <span>Gruppe ${i + 1} (${start + 1} - ${end})</span>
    //         <div class="header-buttons">
    //             <button class="toggle-textbox-btn" disabled>Text ein</button>
    //             <button class="test-btn">تست</button>
    //         </div>
    //     `;

    accordionHeader.innerHTML = `
    <span>Gruppe ${i + 1} (${start + 1} - ${end})</span>
    <div class="header-buttons">
        <button class="test-btn">تست</button>
        <button class="toggle-textbox-btn" disabled>Text ein</button>
    </div>
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

      const groupData = currentGroupItems.flat();
      localStorage.setItem("testGroupData", JSON.stringify(groupData));
      window.location.href = "worttest.html";
    });
  }
}

closeButton.addEventListener("click", () => {
  rootModal.classList.remove("show");
});

rootModal.addEventListener("click", (e) => {
  if (e.target === rootModal) {
    rootModal.classList.remove("show");
  }
});

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
