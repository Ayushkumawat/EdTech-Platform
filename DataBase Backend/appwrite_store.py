import asyncio
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.input_file import InputFile
from appwrite.id import ID
from appwrite.permission import Permission
from appwrite.role import Role
from typing import Union, Tuple, Any
from starlette.datastructures import UploadFile
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Appwrite Config
APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1'
APPWRITE_PROJECT = '685987e3000799209566'
APPWRITE_API_KEY = 'standard_a98dda6c383c181e4bdd61cb2711b2927002eee62c423361e09edecdb6682fbda333968dd13ae02b855c2ae12074fdcd78e3cb8e97412d24a044aa51aff4a43dbce93ff644790d81cf0cc9319643f760972fcea42c80d26ec9ecde302684c6d04a2366e0046b2fc647de93ac2b4ca43924d75261aae77cb86ce65d4600d6b2ed'
BUCKET_ID = '685a7bd100084facdc95'

def get_sync_client():
    client = Client()
    return client.set_endpoint(APPWRITE_ENDPOINT)\
                 .set_project(APPWRITE_PROJECT)\
                 .set_key(APPWRITE_API_KEY)

async def get_appwrite_client():
    return await asyncio.to_thread(get_sync_client)

async def add_file(file: Any) -> dict:
    """
    Uploads a file to Appwrite storage.

    Args:
        file: Either a Starlette UploadFile object or a tuple (bytes, filename)

    Returns:
        dict: Appwrite file upload response containing file metadata

    Raises:
        Exception: If file upload fails
    """
    try:
        def _upload_file(file_bytes: bytes, filename: str):
            client = get_sync_client()
            storage = Storage(client)

            # Create input file from bytes
            input_file = InputFile.from_bytes(file_bytes, filename=filename)

            # Upload file to Appwrite
            return storage.create_file(
                bucket_id=BUCKET_ID,
                file_id=ID.unique(),
                file=input_file,
                permissions=[Permission.read(Role.any())]
            )

        # Handle different input types
        if hasattr(file, 'file') and hasattr(file, 'filename'):
            logger.info(f"Processing UploadFile: {file.filename}")
            # Read file content synchronously since it's already a file object
            file_bytes = file.file.read()
            filename = file.filename
        elif isinstance(file, tuple) and len(file) == 2:
            logger.info("Processing tuple input")
            file_bytes, filename = file
            if not isinstance(file_bytes, bytes):
                raise ValueError("File content must be bytes")
        else:
            logger.error(f"Invalid file type: {type(file)}")
            raise ValueError(f"Invalid file input. Expected UploadFile or tuple(bytes, filename), got {type(file)}")

        if not file_bytes or not filename:
            raise ValueError("File content or filename is missing")

        # Upload file using thread pool
        result = await asyncio.to_thread(_upload_file, file_bytes, filename)
        logger.info(f"File uploaded successfully: {filename}")
        return result

    except Exception as e:
        logger.error(f"Failed to upload file: {str(e)}")
        raise Exception(f"File upload failed: {str(e)}")

async def get_file_url(file_id: str, mode: str = "view") -> str:
    """
    Generate a URL for accessing a file from Appwrite storage.

    Args:
        file_id: The ID of the file
        mode: Access mode ("view" or "download")

    Returns:
        str: URL for accessing the file

    Raises:
        ValueError: If mode is invalid
    """
    if mode not in ["view", "download"]:
        raise ValueError("Mode must be either 'view' or 'download'")

    return f"{APPWRITE_ENDPOINT.replace('/v1', '')}/v1/storage/buckets/{BUCKET_ID}/files/{file_id}/{mode}?project={APPWRITE_PROJECT}"