# LocalCap Viewer (WORK IN PROGRESS)

LocalCap Viewer is a web application written in Vue 3, Node.js, and Vuetify. This application serves as the front-end interface for controlling and managing video recordings, as well as displaying processed sessions and trials. The web app communicates with a WebSocket server set up in the [opencap-core-local](https://github.com/AntonBrinkCodes/opencap-core-local) repository, enabling seamless integration with the LocalCap application.

## Features

- **Web-Based Control Interface:** Start, stop, and manage video recordings from your browser.
- **Real-Time Communication:** Uses WebSockets to communicate with the LocalCap app and the server running OpenCap locally.
- **Session and Trial Management:** View and manage processed sessions and trials (Work in Progress).

## Installation

To set up the LocalCap Viewer, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/AntonBrinkCodes/localcap-viewer.git
   cd localcap-viewer
   
2. **Configure Environment**
Set up your environment variables if needed. This may include configuring the WebSocket server URL and other settings.

Run the Application

```bash
Copy code
npm run serve
```
This will start the web application on http://localhost:8080 by default.

## Usage

### Connect with LocalCap

- Follow the instructions provided in the [opencap-core-local](https://github.com/AntonBrinkCodes/opencap-core-local) repository to set up and run the server locally on your Ubuntu or Windows machine.

- Change the BASEURL and port parameters in store to match where [opencap-core-local](https://github.com/AntonBrinkCodes/opencap-core-local) is hosted.

- Ensure your [LocalCap app](https://github.com/AntonBrinkCodes/LocalCap/tree/main) is running and your macOS device is on the same network as your server running the opencap-core-local.

### Start and Stop Recording

- Use the LocalCap Viewer to control video recordings through the web interface. The web-app is designed to look as similar to app.opencap.ai to be easy to use.

### View Sessions and Trials

- Access and manage processed sessions and trials directly within the application (Work in Progress).

## Development
If you want to contribute or modify the application, you can run the app in development mode with hot-reloading:

```bash
Copy code
npm run dev
```

## Contribution
Contributions are welcome! 

If you have suggestions, bug reports, or would like to add features, please open an issue or submit a pull request. Make sure your contributions adhere to the project's coding standards.

## Acknowledgements
Special thanks to the contributors and the OpenCap project for providing the essential framework and tools.

This project is a work in progress, and ongoing improvements are being made regularly.

## Contact
For any questions, issues, or support, please open an issue on GitHub.

