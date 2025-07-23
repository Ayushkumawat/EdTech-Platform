import asyncio
from appwrite.client import Client
from appwrite.services.storage import Storage
from appwrite.input_file import InputFile
from appwrite.id import ID
from appwrite.permission import Permission
from appwrite.role import Role
from appwrite.query import Query
from typing import Union, Tuple, Any, List
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

async def get_files_by_initials(initials: str, mode: str = "view") -> List[dict]:
    """
    Get file links by searching for files that start with the given initials.

    Args:
        initials: The starting characters of the filename to search for
        mode: Access mode ("view" or "download")

    Returns:
        List[dict]: List of dictionaries containing file info and URLs

    Raises:
        ValueError: If mode is invalid
        Exception: If file search fails
    """
    if mode not in ["view", "download"]:
        raise ValueError("Mode must be either 'view' or 'download'")

    try:
        def _list_files_with_query():
            client = get_sync_client()
            storage = Storage(client)
            # Use Query.starts_with to filter files on the server side
            return storage.list_files(
                bucket_id=BUCKET_ID,
                queries=[Query.starts_with("name", initials)]
            )

        # Get filtered files from the bucket using server-side filtering
        files_response = await asyncio.to_thread(_list_files_with_query)
        
        # Process the already filtered files
        matching_files = []
        for file_info in files_response['files']:
            filename = file_info['name']
            file_url = f"{APPWRITE_ENDPOINT.replace('/v1', '')}/v1/storage/buckets/{BUCKET_ID}/files/{file_info['$id']}/{mode}?project={APPWRITE_PROJECT}"
            matching_files.append({
                'file_id': file_info['$id'],
                'filename': filename,
                'url': file_url,
                'size': file_info['sizeOriginal'],
                'created_at': file_info['$createdAt'],
                'updated_at': file_info['$updatedAt']
            })

        logger.info(f"Found {len(matching_files)} files starting with '{initials}'")
        return matching_files

    except Exception as e:
        logger.error(f"Failed to search files by initials '{initials}': {str(e)}")
        raise Exception(f"File search failed: {str(e)}")

async def get_file_link_by_name_initials(initials: str, mode: str = "view") -> Union[str, None]:
    """
    Get the first file link that matches the given filename initials.

    Args:
        initials: The starting characters of the filename to search for
        mode: Access mode ("view" or "download")

    Returns:
        str: URL of the first matching file, or None if no match found

    Raises:
        ValueError: If mode is invalid
        Exception: If file search fails
    """
    try:
        matching_files = await get_files_by_initials(initials, mode)
        
        if matching_files:
            return matching_files[0]['url']
        else:
            logger.warning(f"No files found starting with '{initials}'")
            return None

    except Exception as e:
        logger.error(f"Failed to get file link by initials '{initials}': {str(e)}")
        raise Exception(f"File search failed: {str(e)}")

async def get_files_with_query(queries: List[str], mode: str = "view") -> List[dict]:
    """
    Get file links using custom Appwrite queries for advanced filtering.

    Args:
        queries: List of Query objects for filtering files
        mode: Access mode ("view" or "download")

    Returns:
        List[dict]: List of dictionaries containing file info and URLs

    Raises:
        ValueError: If mode is invalid
        Exception: If file search fails
    """
    if mode not in ["view", "download"]:
        raise ValueError("Mode must be either 'view' or 'download'")

    try:
        def _list_files_with_custom_query():
            client = get_sync_client()
            storage = Storage(client)
            return storage.list_files(
                bucket_id=BUCKET_ID,
                queries=queries
            )

        # Get filtered files from the bucket using custom queries
        files_response = await asyncio.to_thread(_list_files_with_custom_query)
        
        # Process the filtered files
        matching_files = []
        for file_info in files_response['files']:
            filename = file_info['name']
            file_url = f"{APPWRITE_ENDPOINT.replace('/v1', '')}/v1/storage/buckets/{BUCKET_ID}/files/{file_info['$id']}/{mode}?project={APPWRITE_PROJECT}"
            matching_files.append({
                'file_id': file_info['$id'],
                'filename': filename,
                'url': file_url,
                'size': file_info['sizeOriginal'],
                'created_at': file_info['$createdAt'],
                'updated_at': file_info['$updatedAt']
            })

        logger.info(f"Found {len(matching_files)} files using custom queries")
        return matching_files

    except Exception as e:
        logger.error(f"Failed to search files with custom queries: {str(e)}")
        raise Exception(f"File search failed: {str(e)}")

async def get_files_by_pattern(pattern: str, pattern_type: str = "startsWith", mode: str = "view") -> List[dict]:
    """
    Get file links using different pattern matching types.

    Args:
        pattern: The pattern to search for in filenames
        pattern_type: Type of pattern matching ("startsWith", "endsWith", "contains", "equal")
        mode: Access mode ("view" or "download")

    Returns:
        List[dict]: List of dictionaries containing file info and URLs

    Raises:
        ValueError: If mode or pattern_type is invalid
        Exception: If file search fails
    """
    if mode not in ["view", "download"]:
        raise ValueError("Mode must be either 'view' or 'download'")
    
    if pattern_type not in ["startsWith", "endsWith", "contains", "equal"]:
        raise ValueError("Pattern type must be 'startsWith', 'endsWith', 'contains', or 'equal'")

    try:
        def _list_files_with_pattern():
            client = get_sync_client()
            storage = Storage(client)
            
            # Build query based on pattern type
            if pattern_type == "startsWith":
                query = Query.starts_with("name", pattern)
            elif pattern_type == "endsWith":
                query = Query.ends_with("name", pattern)
            elif pattern_type == "contains":
                query = Query.contains("name", pattern)
            elif pattern_type == "equal":
                query = Query.equal("name", pattern)
            
            return storage.list_files(
                bucket_id=BUCKET_ID,
                queries=[query]
            )

        # Get filtered files from the bucket
        files_response = await asyncio.to_thread(_list_files_with_pattern)
        
        # Process the filtered files
        matching_files = []
        for file_info in files_response['files']:
            filename = file_info['name']
            file_url = f"{APPWRITE_ENDPOINT.replace('/v1', '')}/v1/storage/buckets/{BUCKET_ID}/files/{file_info['$id']}/{mode}?project={APPWRITE_PROJECT}"
            matching_files.append({
                'file_id': file_info['$id'],
                'filename': filename,
                'url': file_url,
                'size': file_info['sizeOriginal'],
                'created_at': file_info['$createdAt'],
                'updated_at': file_info['$updatedAt']
            })

        logger.info(f"Found {len(matching_files)} files using pattern '{pattern}' with type '{pattern_type}'")
        return matching_files

    except Exception as e:
        logger.error(f"Failed to search files with pattern '{pattern}': {str(e)}")
        raise Exception(f"File search failed: {str(e)}")

async def get_files_by_size_range(min_size: int = None, max_size: int = None, mode: str = "view") -> List[dict]:
    """
    Get file links by filtering files within a size range.

    Args:
        min_size: Minimum file size in bytes (optional)
        max_size: Maximum file size in bytes (optional)
        mode: Access mode ("view" or "download")

    Returns:
        List[dict]: List of dictionaries containing file info and URLs

    Raises:
        ValueError: If mode is invalid
        Exception: If file search fails
    """
    if mode not in ["view", "download"]:
        raise ValueError("Mode must be either 'view' or 'download'")

    try:
        def _list_files_by_size():
            client = get_sync_client()
            storage = Storage(client)
            
            queries = []
            if min_size is not None:
                queries.append(Query.greater_than_equal("sizeOriginal", min_size))
            if max_size is not None:
                queries.append(Query.less_than_equal("sizeOriginal", max_size))
            
            return storage.list_files(
                bucket_id=BUCKET_ID,
                queries=queries if queries else None
            )

        # Get filtered files from the bucket
        files_response = await asyncio.to_thread(_list_files_by_size)
        
        # Process the filtered files
        matching_files = []
        for file_info in files_response['files']:
            filename = file_info['name']
            file_url = f"{APPWRITE_ENDPOINT.replace('/v1', '')}/v1/storage/buckets/{BUCKET_ID}/files/{file_info['$id']}/{mode}?project={APPWRITE_PROJECT}"
            matching_files.append({
                'file_id': file_info['$id'],
                'filename': filename,
                'url': file_url,
                'size': file_info['sizeOriginal'],
                'created_at': file_info['$createdAt'],
                'updated_at': file_info['$updatedAt']
            })

        logger.info(f"Found {len(matching_files)} files in size range {min_size}-{max_size} bytes")
        return matching_files

    except Exception as e:
        logger.error(f"Failed to search files by size range: {str(e)}")
        raise Exception(f"File search failed: {str(e)}")