# data-quality-dashboard

[![License: Apache v2.0](https://img.shields.io/badge/License-Apache%20v2.0-blue.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0)
[![Platform](https://img.shields.io/badge/platform-windows%20%7C%20macos-lightgrey)](https://shields.io/)
[![Python](https://img.shields.io/badge/Python-3.8%E2%80%933.12-green)](https://www.python.org/downloads/)
[![Node JS](https://img.shields.io/badge/NodeJS-v16+-red)](https://nodejs.org/en)
<img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" height="20">
<img src="https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="Docker" height="20">

> The **Data Quality Dashboard** VSCode extension simplifies quality checks for a security knowledge 
> graph developed by Software Competence Center Hagenberg GmbH in collaboration with Limes Security 
> GmbH. With a single command, the extension launches a Docker-based graph database, performs 
> quality evaluations (completeness, consistency, schema readability), and starts a Node.js server 
> to display results in an interactive React dashboard.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Running the Extension](#running-the-extension)
  - [Running in Development Mode](#running-in-development-mode)
  - [VSIX Installation](#vsix-installation)
- [Usage](#usage)
- [Additional Information](#additional-information)
- [License](#license)

## Prerequisites

- **VSCode**: [Download and install Visual Studio Code](https://code.visualstudio.com/) and open the 
project in it.
- **Python 3**: [Download and install Python 3](https://www.python.org/downloads/).
- **Node.js (v16 or higher)**: [Download and install Node.js](https://nodejs.org/en/) (version 16 or newer).
- **Docker**: [Download and install Docker](https://www.docker.com/get-started), then ensure Docker is 
running.
- **VSCode Python Extension**: [Install the Python extension for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-python.python).
- **Python Libraries**: Run `pip install -r requirements.txt` in the terminal to install necessary 
libraries.
- *Node.js Libraries*: Run `npm install` in the terminal to install all required Node.js
dependencies(this is only necessary if you want to run the extension in development mode).

## Running the Extension

### Running in Development Mode

To run the extension in development mode, use the pre-configured launch settings in the `.vscode/launch.json` file. 

1. Open the debug pane in VSCode.
2. Select **Server + Client** from the run/debug configuration dropdown.
3. Click the green play button to launch both the server and client concurrently.

This will start the necessary components of the extension, and a new VSCode window will open where you can utilize and test the extension in real-time.

### _VSIX Installation(Not Supported Yet)_
To install the extension via a VSIX file, follow these steps:

1. Open the Command Prompt (or terminal) in the directory of this extension project. 
2. Execute the following command:

   ```bash
   code --install-extension <path/to/vsix.file>
## Usage

To run the process, open the Command Palette in VSCode (press `Ctrl+Shift+P` or `Cmd+Shift+P` on macOS) and search for the command:

- **DQ Dashboard: Start**

## Additional Information

For detailed instructions on Docker image creation and how the export is performed, please refer to the [README.md](semanticLib/resources/kg/README.md) located in the `semanticLib/resources/kg/` directory.
   
## License

This project is licensed under the **Apache License 2.0**. You may not use this project except in compliance with the License. You can view the full text of the license at the following link:

[Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)


