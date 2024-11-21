import ctypes
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import webbrowser
from SPARQLWrapper import JSON, SPARQLWrapper
import psutil
import pyperclip
import platform

from server.config import IS_WINDOWS


def is_connected(endpoint_url):
    sparql = SPARQLWrapper(endpoint_url)
    sparql.setQuery("ASK WHERE { ?s ?p ?o }")
    sparql.setReturnFormat(JSON)
    sparql.setTimeout(20)

    try:
        result = sparql.query().convert()
        if 'boolean' in result:
            return True
        else:
            return False
    except Exception:
        return False


def copy_directory(src_dir, dest_dir, hide_dest=True):
    if not os.path.exists(src_dir):
        raise FileNotFoundError(f"The source directory {src_dir} does not exist.")

    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        if hide_dest:
            hide_for_windows(dest_dir)

    for item in os.listdir(src_dir):
        src_item = os.path.join(src_dir, item)
        dest_item = os.path.join(dest_dir, item)

        if os.path.isdir(src_item):
            try:
                shutil.copytree(src_item, dest_item)
            except FileExistsError:
                continue
        else:
            shutil.copy2(src_item, dest_item)


def get_files_and_folders_excluding(directory, exclude):
    result = []
    directory_path = Path(directory)

    if not directory_path.exists():
        return result

    for item in directory_path.iterdir():
        if item.name == exclude:
            continue

        result.append(item)

    return result


def delete_path_if_exists(path):
    if os.path.exists(path):
        try:
            if os.path.isfile(path):
                os.remove(path)
            elif os.path.isdir(path):
                shutil.rmtree(path)
            return True
        except Exception as e:
            return False
    else:
        return True


def hide_for_windows(folder_path: str):
    if IS_WINDOWS:
        FILE_ATTRIBUTE_HIDDEN = 0x02
        ctypes.windll.kernel32.SetFileAttributesW(str(folder_path), FILE_ATTRIBUTE_HIDDEN)


def run_command_in_new_window_with_waiting_windows(command, process_name):
    command = f'title {process_name} && {command}'
    subprocess.run(f'start cmd.exe /k "{command}"', shell=True)

    while True:
        time.sleep(2)

        cmd_processes = [proc for proc in psutil.process_iter(['pid', 'name', 'cmdline']) if
                         'cmd.exe' in proc.info['name']]
        running_titles = [proc.info['cmdline'] for proc in cmd_processes if
                          process_name in ' '.join(proc.info['cmdline'])]

        if not running_titles:
            break


def run_command_in_new_window_with_waiting_macos(command):
    escaped_command = command.replace('"', '\\"')
    applescript = f'''
    tell application "Terminal"
        activate
        set newWindow to do script "{escaped_command}"
        repeat
            delay 1
            if not busy of newWindow then exit repeat
        end repeat
    end tell
    '''
    process = subprocess.Popen(["osascript", "-"], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    stdout, stderr = process.communicate(applescript.encode('utf-8'))
    process.wait()


def monitor_clipboard():
    pyperclip.copy('')
    previous_text = pyperclip.paste()

    while True:
        time.sleep(1)
        current_text = pyperclip.paste()

        if current_text != previous_text:
            previous_text = current_text
            match = re.search(r'http://localhost:\d+', current_text)
            if match:
                url = match.group(0)
                webbrowser.open(url)
                break


def is_node_js_valid():
    try:
        result = subprocess.run(['node', '-v'], capture_output=True, text=True, check=True)
        version_str = result.stdout.strip()

        if version_str.startswith('v'):
            version_str = version_str[1:]

        major_version = int(version_str.split('.')[0])

        if major_version >= 16:
            return True
        else:
            return False

    except subprocess.CalledProcessError as e:
        return False
    except FileNotFoundError:
        return False


def get_available_terminal():
    if platform.system() == "Darwin":
        for terminal in ["open -a Terminal", "open -a iTerm"]:
            if shutil.which("open"):
                return terminal
    else:
        for terminal in ["gnome-terminal", "xterm", "konsole", "xfce4-terminal"]:
            if shutil.which(terminal):
                return terminal
    raise EnvironmentError("No compatible terminal emulator found. Install gnome-terminal, "
                           "xterm, konsole, xfce4-terminal, or use macOS Terminal/iTerm.")
