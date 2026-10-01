const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");


// Generate a temporary username
const username =
    "User-" + Math.random().toString(36).substring(2, 8);


// Connect to the WebSocket server
//const socket = new WebSocket("ws://localhost:8765");
const socket = new WebSocket("https://tchat-web.onrender.com/");


// --------------------
// Connection events
// --------------------

socket.addEventListener("open", function () {

    console.log("Connected to server.");

});


socket.addEventListener("close", function () {

    console.log("Disconnected from server.");

    addSystemMessage("Disconnected from server.");

});


socket.addEventListener("error", function (error) {

    console.error("WebSocket error:", error);

    addSystemMessage("Could not connect to server.");

});


// --------------------
// Receiving messages
// --------------------

socket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);

    if (data.type === "message") {
        addMessage(data.username, data.message);
    }

    if (data.type === "user_count") {
        updateUserCount(data.count);
    }
});

function updateUserCount(count) {
    const onlineCount = document.getElementById("onlineCount");

    onlineCount.textContent =
        "🟢 " + count + (count === 1 ? " online" : " online");
}



// --------------------
// Display a message
// --------------------

function addMessage(username, text) {

    const message = document.createElement("div");

    message.classList.add("message");

    message.textContent =
        username + ": " + text;

    messages.appendChild(message);

    // Scroll to newest message
    messages.scrollTop =
        messages.scrollHeight;
}


// --------------------
// System messages
// --------------------

function addSystemMessage(text) {

    const message = document.createElement("div");

    message.classList.add("system-message");

    message.textContent = text;

    messages.appendChild(message);

    messages.scrollTop =
        messages.scrollHeight;
}


// --------------------
// Sending messages
// --------------------

function sendMessage() {

    const text =
        messageInput.value.trim();

    // Don't send empty messages
    if (text === "") {
        return;
    }


    // Make sure we're actually connected
    if (socket.readyState !== WebSocket.OPEN) {

        addSystemMessage(
            "Not connected to server."
        );

        return;
    }


    // Send message to server
    socket.send(
        JSON.stringify({
            username: username,
            message: text
        })
    );


    // Clear input
    messageInput.value = "";

    messageInput.focus();
}


// --------------------
// Send button
// --------------------

sendButton.addEventListener(
    "click",
    sendMessage
);


// --------------------
// Enter key
// --------------------

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }

    }
);