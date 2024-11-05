############################################################################
# Copyright(c) Open Law Library. All rights reserved.                      #
# See ThirdPartyNotices.txt in the project root for additional notices.    #
#                                                                          #
# Licensed under the Apache License, Version 2.0 (the "License")           #
# you may not use this file except in compliance with the License.         #
# You may obtain a copy of the License at                                  #
#                                                                          #
#     http: // www.apache.org/licenses/LICENSE-2.0                         #
#                                                                          #
# Unless required by applicable law or agreed to in writing, software      #
# distributed under the License is distributed on an "AS IS" BASIS,        #
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. #
# See the License for the specific language governing permissions and      #
# limitations under the License.                                           #
############################################################################
import asyncio
import os
import threading
from semanticLib.base.data_quality.DataQualityModule import DataQualityModule

from lsprotocol.types import MessageType
from pygls.server import LanguageServer
from pathlib import Path
from server.config import IS_WINDOWS, IS_MACOS
from server.docker import DockerContainerNotRunningError, DockerGraphDB, DockerImageNotLoadedError, \
    DockerNotRunningError, UnavailablePortError
from server.utils import copy_directory, delete_path_if_exists, get_files_and_folders_excluding, is_connected, \
    is_node_js_valid, monitor_clipboard, run_command_in_new_window_with_waiting_macos, \
    run_command_in_new_window_with_waiting_windows

endpoint_url = "http://localhost:7200/repositories/AKGraph_repo"
installation_dir = os.path.join(str(Path.home()), ".dq_dashboard")
static_data_dir = os.path.join(installation_dir, "src/static_data/data")
build_dir = os.path.join(installation_dir, "build")
dashboard_template_dir = "semanticLib/resources/dashboard_template"

# for running dashboard web app in NodeJS(Windows)
process_name = "dq_dashboard_web_app_running"
command_windows = f'cd "{installation_dir}" && npm install --prefix "{installation_dir}" && npm run build && serve -s build'


class DQDashboardLS(LanguageServer):
    CMD_DQ_DASHBOARD = 'dq_dashboard_server'
    CMD_STATUS_BAR_NOTIF_TO_CLIENT = 'status_bar_notification'

    def __init__(self, *args):
        super().__init__(*args)

    async def statusBarNotification(self, message: str, visibility: bool):
        params = {
            "message": message,
            "visibility": visibility
        }
        self.send_notification(DQDashboardLS.CMD_STATUS_BAR_NOTIF_TO_CLIENT, params)


dq_dashboard_server = DQDashboardLS('dq-dashboard-server', 'v0.1')


@dq_dashboard_server.command(DQDashboardLS.CMD_DQ_DASHBOARD)
async def start_dashboard(ls: DQDashboardLS, params):
    if not IS_WINDOWS and not IS_MACOS:
        ls.show_message(
            "This application currently supports only Windows and macOS. "
            "Support for other operating systems is planned for future releases. "
            "Thank you for your patience!",
            msg_type=MessageType.Warning
        )
        return

    if not is_node_js_valid():
        ls.show_message(
            "Node.js (version >= 16) is not installed or cannot be found. Please install it or ensure it is in your PATH.",
            msg_type=MessageType.Warning)
        return

    await ls.statusBarNotification('DQ Dashboard: Docker and GraphDB database setup...', True)
    try:
        graphDBInstance = DockerGraphDB()
        await asyncio.to_thread(graphDBInstance.run)
    except (
    DockerNotRunningError, DockerImageNotLoadedError, DockerContainerNotRunningError, UnavailablePortError) as e:
        ls.show_message(e.message, msg_type=MessageType.Warning)
        await ls.statusBarNotification('', False)
        return

    if not await asyncio.to_thread(is_connected, endpoint_url):
        ls.show_message("GraphDB connection is refused. Check if GraphDB is running.", msg_type=MessageType.Warning)
        return

    await ls.statusBarNotification('DQ Dashboard: Clearing up...', True)
    for item in get_files_and_folders_excluding(installation_dir, "node_modules"):
        await asyncio.to_thread(delete_path_if_exists, item)
    await asyncio.sleep(1)  # For visibility of this stage

    await ls.statusBarNotification('DQ Dashboard: Copying template files...', True)
    await asyncio.to_thread(copy_directory, dashboard_template_dir, installation_dir)
    await asyncio.sleep(1)  # For visibility of this stage

    dqm = DataQualityModule(endpoint_url, static_data_dir, ls)

    try:
        await dqm.generate_dashboard()
    except Exception as e:
        ls.show_message(f"Error generating dashboard: {str(e)}", msg_type=MessageType.Error)
        return

    await ls.statusBarNotification("DQ Dashboard: Running a dashboard web app...", True)
    clipboard_thread = threading.Thread(target=monitor_clipboard, daemon=True)
    clipboard_thread.start()
    if IS_WINDOWS:
        await asyncio.to_thread(run_command_in_new_window_with_waiting_windows, command_windows, process_name)
    else:
        install_command = (
            f'cd "{installation_dir}" && '
            f'npm install --prefix "{installation_dir}"'
        )
        await asyncio.to_thread(run_command_in_new_window_with_waiting_macos, install_command)

        build_command = f'cd "{installation_dir}" && npm run build'
        await asyncio.to_thread(run_command_in_new_window_with_waiting_macos, build_command)

        serve_command = f'cd "{installation_dir}" && serve -s build'
        await asyncio.to_thread(run_command_in_new_window_with_waiting_macos, serve_command)

    await ls.statusBarNotification("", False)
