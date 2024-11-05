import os
import platform

IS_WINDOWS = os.name == 'nt' or platform.system() == 'Windows'
IS_MACOS = platform.system() == "Darwin"