import socket
import time
import docker
from docker.errors import DockerException, APIError

class DockerNotRunningError(Exception):
    def __init__(self, message="Docker App is not running or is unreachable."):
        self.message = message
        super().__init__(self.message)

class DockerImageNotLoadedError(Exception):
    def __init__(self, message="Docker image was neither loaded or found."):
        self.message = message
        super().__init__(self.message)

class DockerContainerNotRunningError(Exception):
    def __init__(self, message="Docker container is not running."):
        self.message = message
        super().__init__(self.message)

class UnavailablePortError(Exception):
    def __init__(self, message="Port 7200 is unavailable. Free this port to proceed."):
        self.message = message
        super().__init__(self.message)

class DockerGraphDB:
    CONTAINER_NAME = "skg_graphdb_container"
    IMAGE_NAME = "skg_graphdb:latest"
    PORT = 7200

    def __init__(self):
        try:
            self.client = docker.from_env(timeout=10)
        except DockerException:
            raise DockerNotRunningError()
        self.client.api.timeout = 60
        
    def run(self):
        container_prev_logs = ""
        container_exists, container_running = self.container_exists_and_running()
        if container_exists:
            container = self.client.containers.get(DockerGraphDB.CONTAINER_NAME)
            container_prev_logs = container.logs()

        if not (container_exists and container_running) and self.is_port_busy():
            raise UnavailablePortError()
        
        if (container_exists and not container_running):
            container = self.run_existing_container()
        elif (not container_exists):
            image = self.load_image_from_tar()
            if image is None:
                raise DockerImageNotLoadedError()
            container = self.run_new_container(image)
        
        if container is None:
            raise DockerContainerNotRunningError()
        
        if not (container_exists and container_running):
            self.wait_for_db_successful_start(container, container_prev_logs)

    def run_existing_container(self, container_name = CONTAINER_NAME):
        container = self.client.containers.get(container_name)
        try:
            container.start()  
        except APIError:
            return None
        return container
        
    def run_new_container(self, image, container_name = CONTAINER_NAME, host_port = PORT, container_port = PORT):   
        try:
            container = self.client.containers.create(
                            image,
                            name=container_name,
                            ports={host_port: container_port},  
                            detach=True  
            )

            container.start()
            return container
        except APIError:
            return None
        except Exception:
            return None

    def load_image_from_tar(self, tar_file_path = "semanticLib/resources/kg/skg_graphdb.tar", image_name = IMAGE_NAME):
        images = self.client.images.list()
        image_loaded = any(image.tags and image_name in image.tags for image in images)

        if image_loaded:
            return self.client.images.get(image_name)
        
        with open(tar_file_path, 'rb') as tar_file:
            loaded_images = self.client.images.load(tar_file.read())

        return loaded_images[0] if loaded_images else None
    
    def wait_for_db_successful_start(self, container, prev_logs):
        while True:
            logs = container.logs().decode('utf-8').replace(prev_logs if isinstance(prev_logs, str) else prev_logs.decode('utf-8'), "")
            if f'Started GraphDB in workbench mode at port {DockerGraphDB.PORT}' in logs:
                break
            time.sleep(1)

    def container_exists_and_running(self, container_name = CONTAINER_NAME):
        exists = False
        running = False
        existing_containers = self.client.containers.list(all=True)
    
        for container in existing_containers:
            if container.name == container_name:
                exists = True
                if container.status == 'running':
                    running = True
                return exists, running
        return exists, running

    def check_docker_status(self):
        try:
            self.client.ping()  
            return True
        except docker.errors.APIError:
            return False
        except Exception:
            return False
    
    @staticmethod
    def is_port_busy(host='127.0.0.1', port=PORT):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            result = s.connect_ex((host, port))
            return result == 0