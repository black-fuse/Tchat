import asyncio
import json
import websockets
import os


connected_clients = set()
port = int(os.environ.get("PORT", 8765))


async def broadcast(message):
    """Send a message to every currently connected client."""

    if not connected_clients:
        return

    await asyncio.gather(
        *[
            client.send(message)
            for client in connected_clients
        ],
        return_exceptions=True
    )


async def handle_client(websocket):
    connected_clients.add(websocket)
    print(f"Client connected. Total clients: {len(connected_clients)}")

    await broadcast_user_count()

    try:
        async for raw_message in websocket:
            try:
                data = json.loads(raw_message)

                username = data.get("username", "Unknown")
                message = data.get("message", "")

                if not message.strip():
                    continue

                message = message[:2000]

                response = json.dumps({
                    "type": "message",
                    "username": username,
                    "message": message
                })

                await broadcast(response)

            except json.JSONDecodeError:
                print("Received invalid JSON.")

    except websockets.exceptions.ConnectionClosed:
        pass

    finally:
        connected_clients.discard(websocket)

        print(
            f"Client disconnected. "
            f"Total clients: {len(connected_clients)}"
        )

        await broadcast_user_count()

async def broadcast_user_count():
    message = json.dumps({
        "type": "user_count",
        "count": len(connected_clients)
    })

    await broadcast(message)

async def main():
    print("Starting communication server...")

    async with websockets.serve(
        handle_client,
        "0.0.0.0",
        port
    ):
        print("WebSocket server running on ws://localhost:8765")

        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())