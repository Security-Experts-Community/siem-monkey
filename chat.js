const LLM_API_ENDPOINT = "http://localhost:3503/v1/chat/completions";

const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById("chat-widget");
const chatContainer = document.getElementById("chat-container");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSendButton = document.getElementById("chat-send");

chatWidget.classList.toggle('visible', true);

chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const userInput = chatInput.value.trim();
        if (userInput) {
            addChatMessage("You", userInput);
            sendChatMessage(userInput);
            chatInput.value = "";
        }
    }
});

chatSendButton.addEventListener("click", () => {
    const userInput = chatInput.value.trim();
    if (userInput) {
        addChatMessage("You", userInput);
        sendChatMessage(userInput);
        chatInput.value = "";
    }
});

function addChatMessage(sender, message) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("chat-message-container");
    const messageHeader = document.createElement("div");
    messageHeader.classList.add("chat-message-header");
    messageHeader.textContent = sender + ":";
    const messageBody = document.createElement("div");
    messageBody.classList.add("chat-message-body");
    messageBody.textContent = message;
    messageContainer.appendChild(messageHeader);
    messageContainer.appendChild(messageBody);
    chatMessages.appendChild(messageContainer);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeEmptyFields(obj) {
    Object.keys(obj).forEach(key => {
        if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            removeEmptyFields(obj[key]);
        }
    });
    return obj;
}

function sendChatMessage(message) {
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "block";

  let event_data = decodeURIComponent(atob($("#saved_event_data").text()));
  let cleaned_event = JSON.stringify(removeEmptyFields(JSON.parse(event_data)))

  fetch(LLM_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        messages: [ 
            { "role": "system", "content": "You are a highly skilled and experienced cybersecurity assistant. Your answers are very precise and well-researched." },
            { "role": "user", "content": `This is JSON with event log data:${cleaned_event}.\n${message}` }
        ],
      max_tokens: -1,
      temperature: 0.2,
      stop: "###"
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const chatbotResponse = data.choices[0].message.content.trim();
      addChatMessage("SEC AI Assistant", chatbotResponse);
      loadingElement.style.display = "none";
    })
    .catch((error) => {
      addChatMessage("[SYSTEM]", error);
      addChatMessage("SEC AI Assistant", "Sorry, I was unable to process your request.");
      loadingElement.style.display = "none";
    });
}