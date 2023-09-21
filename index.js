  const output = document.getElementById('output');
        let listening = false;
        let timerId;
        let lastSpeechTimestamp = 0;
        const speechTimeout = 1500; // 1.5 seconds

        // Check if the browser supports speech recognition
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

            recognition.lang = 'en-US'; // Set the language to English
            recognition.continuous = true; // Enable continuous recognition

            recognition.onstart = () => {
                output.textContent = 'Listening...';
            };

            recognition.onend = () => {
                if (listening) {
                    const currentTime = new Date().getTime();
                    const timeSinceLastSpeech = currentTime - lastSpeechTimestamp;

                    if (timeSinceLastSpeech >= speechTimeout) {
                        // If no speech for 1.5 seconds, reset and wait for the wake word
                        resetRecognition();
                    } else {
                        recognition.start();
                    }
                }
            };

            recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1][0].transcript;

                if (listening) {
                    output.textContent = `You said: ${result}`;
                    lastSpeechTimestamp = new Date().getTime();

                    // Check if the recognized text is a question
                    const isQuestion = /(who|what|where|why|how)\b/i.test(result);

                    if (isQuestion) {
                        // Open a new tab and perform a Google search
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(result)}`, '_blank');
                    }

                    // Check if the recognized text contains "Open"
                    if (/open/i.test(result)) {
                        const words = result.split(' ');
                        const openIndex = words.findIndex(word => word.toLowerCase() === 'open');
                        if (openIndex !== -1 && openIndex < words.length - 1) {
                            const domain = words.slice(openIndex + 1).join(''); // Combine all words after "open"

                            // Remove spaces to format the URL
                            const formattedDomain = domain.replace(/\s/g, '');

                            // Check if the formatted URL is valid
                            if (isValidDomain(formattedDomain)) {
                                // Open the valid domain in a new tab
                                window.open(`http://${formattedDomain}`, '_blank');
                            }
                        }
                    }

                    // Check if the recognized text contains "Set timer for"
                    if (/set timer for (\d+) minutes?/i.test(result)) {
                        const minutesMatch = result.match(/set timer for (\d+) minutes?/i);
                        if (minutesMatch) {
                            const minutes = parseInt(minutesMatch[1]);
                            setTimer(minutes);
                        }
                    }

                    // Check if the recognized text contains "directions to" or "where is"
                    if (/directions to (.+)/i.test(result) || /where is (.+)/i.test(result)) {
                        const locationMatch = result.match(/directions to (.+)/i) || result.match(/where is (.+)/i);
                        if (locationMatch) {
                            const location = locationMatch[1];
                            openGoogleMaps(location);
                        }
                    }
                } else {
                    // Check if the wake word "Carl" is detected
                    if (/carl/i.test(result)) {
                        output.textContent = 'Carl: Listening...';
                        listening = true;
                        recognition.start();
                    }
                }
            };

            recognition.onerror = (event) => {
                output.textContent = 'Error occurred. Please try again.';
                console.error(event.error);
            };

            // Start continuous recognition when the page loads
            window.addEventListener('load', () => {
                output.textContent = 'Waiting for wake word "Carl"...';
                listening = false;
                recognition.start();
            });
        } else {
            output.textContent = 'Speech recognition is not supported in this browser.';
        }

        // Function to check if a string is a valid domain
        function isValidDomain(domain) {
            const pattern = /^(www\.)?([a-zA-Z0-9-]+\.)+([a-zA-Z]{2,})+$/;
            return pattern.test(domain);
        }

        // Function to set a timer and play an alarm
        function setTimer(minutes) {
            clearTimeout(timerId);
            output.textContent = `Timer set for ${minutes} minutes.`;
            timerId = setTimeout(() => {
                output.textContent = 'Timer expired. Alarm!';
                playAlarm();
            }, minutes * 60000); // Convert minutes to milliseconds
        }

        // Function to play an alarm sound (you can replace this with your desired sound)
        function playAlarm() {
            // Add code here to play an alarm sound (e.g., using the Web Audio API or an audio element)
            // For example, you can use an HTML5 audio element like this:
            const audio = new Audio('path-to-your-alarm-sound.mp3');
            audio.play();
        }

        // Function to reset recognition and wait for the wake word
        function resetRecognition() {
            listening = false;
            output.textContent = 'Waiting for wake word "Carl"...';
        }

        // Function to open Google Maps with directions to a location
        function openGoogleMaps(location) {
            const googleMapsURL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
            window.open(googleMapsURL, '_blank');
        }