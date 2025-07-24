     const container = document.querySelector('.container');

        function createItem(item) {
            const isSentence = /[.!?]$/.test(item.Sound_de);
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            // Split text into characters (for words) or words (for sentences)
            let soundContent = '';
            if (isSentence) {
                const words = item.Sound_de.split(' ');
                soundContent = words.map(word => `<span>${word}</span>`).join(' ');
            } else {
                const chars = item.Sound_de.split('');
                soundContent = chars.map(char => `<span>${char}</span>`).join('');
            }

            itemDiv.innerHTML = `
                <div class="item-top">
                    <div class="filename">${item.Filename}</div>
                    <div class="translate">${item.translate_fa}</div>
                </div>
                <div class="item-bottom">
                    <div class="sound ${isSentence ? 'sentence' : ''}">${soundContent}</div>
                    <input type="text" class="input-text" placeholder="Testen Sie Ihr Schreiben.">
                    <audio src="audio/${item.file}" preload="none"></audio>
                    <button class="play-btn">Play Sound</button>
                    <button class="delete-btn">Delete</button>
                    <div class="control-buttons">
                        <button class="reveal-btn">+</button>
                        <button class="hide-btn">-</button>
                    </div>
                </div>
            `;

            // Initialize reveal/hide indices
            itemDiv.dataset.revealIndex = '0';
            itemDiv.dataset.hideIndex = '0';

            // Add event listener for play button
            const playButton = itemDiv.querySelector('.play-btn');
            const audio = itemDiv.querySelector('audio');
            playButton.addEventListener('click', () => {
                audio.play();
            });

            // Add event listener for delete button
            const deleteButton = itemDiv.querySelector('.delete-btn');
            deleteButton.addEventListener('click', () => {
                itemDiv.remove();
            });

            // Add event listener for revealing/hiding sound text on click
            const soundText = itemDiv.querySelector('.sound');
            soundText.addEventListener('click', () => {
                const spans = soundText.querySelectorAll('span');
                const allRevealed = Array.from(spans).every(span => span.classList.contains('revealed'));
                spans.forEach(span => {
                    span.classList.toggle('revealed', !allRevealed);
                });
                itemDiv.dataset.revealIndex = allRevealed ? '0' : spans.length;
                itemDiv.dataset.hideIndex = allRevealed ? '0' : spans.length;
            });

            // Add event listeners for reveal/hide buttons
            const revealButton = itemDiv.querySelector('.reveal-btn');
            const hideButton = itemDiv.querySelector('.hide-btn');
            const spans = soundText.querySelectorAll('span');

            revealButton.addEventListener('click', () => {
                let revealIndex = parseInt(itemDiv.dataset.revealIndex);
                if (revealIndex < spans.length) {
                    spans[revealIndex].classList.add('revealed');
                    revealIndex++;
                    itemDiv.dataset.revealIndex = revealIndex;
                    itemDiv.dataset.hideIndex = revealIndex;
                }
            });

            hideButton.addEventListener('click', () => {
                let hideIndex = parseInt(itemDiv.dataset.hideIndex);
                if (hideIndex > 0) {
                    hideIndex--;
                    spans[hideIndex].classList.remove('revealed');
                    itemDiv.dataset.revealIndex = hideIndex;
                    itemDiv.dataset.hideIndex = hideIndex;
                }
            });

            // Add event listener for input text
            const inputText = itemDiv.querySelector('.input-text');
            inputText.addEventListener('input', () => {
                if (inputText.value.trim() === item.Sound_de) {
                    inputText.classList.add('correct');
                } else {
                    inputText.classList.remove('correct');
                }
            });

            return itemDiv;
        }

        function renderItems(items) {
            container.innerHTML = '';
            const groupSize = 100;
            const groups = Math.ceil(items.length / groupSize);

            for (let i = 0; i < groups; i++) {
                const start = i * groupSize;
                const end = Math.min(start + groupSize, items.length);

                const accordionDiv = document.createElement('div');
                accordionDiv.classList.add('accordion');

                const accordionHeader = document.createElement('div');
                accordionHeader.classList.add('accordion-header');
                accordionHeader.innerHTML = `گروه ${i + 1} (${start + 1} - ${end}) 
                                <button class="toggle-textbox-btn" disabled>Text ein</button>`;

                const accordionContent = document.createElement('div');
                accordionContent.classList.add('accordion-content');
                accordionContent.dataset.groupIndex = i; // Store group index for reference

                accordionDiv.appendChild(accordionHeader);
                accordionDiv.appendChild(accordionContent);
                container.appendChild(accordionDiv);

                accordionHeader.addEventListener('click', (e) => {
                    if (e.target.classList.contains('toggle-textbox-btn') || e.target.closest('.toggle-textbox-btn')) {
                        return;
                    }
                    const isActive = accordionContent.classList.contains('active');

                    // Close all other accordions
                    document.querySelectorAll('.accordion-content').forEach(content => {
                        if (content !== accordionContent && content.classList.contains('active')) {
                            content.classList.remove('active');
                            content.innerHTML = ''; // Clear content of other accordions
                            const otherHeader = content.previousElementSibling;
                            const otherToggleButton = otherHeader.querySelector('.toggle-textbox-btn');
                            otherToggleButton.disabled = true; // Disable button for closed accordions
                            otherToggleButton.textContent = 'Text ein'; // Reset button text
                        }
                    });
                    
                    // Toggle the clicked accordion
                    accordionContent.classList.toggle('active');
                    const toggleTextboxButton = accordionHeader.querySelector('.toggle-textbox-btn');
                    toggleTextboxButton.disabled = !accordionContent.classList.contains('active'); // Enable/disable button based on accordion state

                    if (isActive) {
                        // Clear content when closing
                        accordionContent.innerHTML = '';
                        toggleTextboxButton.textContent = 'Text ein';
                    } else {
                        // Create items when opening
                        const groupIndex = parseInt(accordionContent.dataset.groupIndex);
                        const groupStart = groupIndex * groupSize;
                        const groupEnd = Math.min(groupStart + groupSize, items.length);
                        const currentGroupItems = items.slice(groupStart, groupEnd);
                      

                        currentGroupItems.forEach(item => {
                            const itemDiv = createItem(item);
                            accordionContent.appendChild(itemDiv);
                        });
                    }
                });

                const toggleTextboxButton = accordionHeader.querySelector('.toggle-textbox-btn');
                toggleTextboxButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const textboxes = accordionContent.querySelectorAll('.input-text');
                    const isHidden = textboxes[0]?.style.display === 'none' || textboxes[0]?.style.display === '';
                    textboxes.forEach(textbox => {
                        textbox.style.display = isHidden ? 'block' : 'none';
                    });
                    toggleTextboxButton.textContent = isHidden ? 'Text aus' : 'Text ein';
                });
            }
        }

        // Fetch data from json-worter.json
        fetch('json-worter.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load JSON file');
                }
                return response.json();
            })
            .then(data => {
                renderItems(data);
            })
            .catch(error => {
                container.innerHTML = `<div class="error">خطا در بارگذاری فایل JSON: ${error.message}</div>`;
            });