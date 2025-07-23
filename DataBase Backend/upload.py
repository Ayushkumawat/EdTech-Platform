import os
import fitz  # PyMuPDF
import requests
from PIL import Image
from google.oauth2.service_account import Credentials
import io
import asyncio
from appwrite_store import (
    add_file, 
    get_file_url, 
    get_files_by_initials, 
    get_file_link_by_name_initials,
    get_files_by_pattern,
    get_files_by_size_range,
    get_files_with_query
)

def fetch_pdf(url):
    """
    Downloads the PDF from a given URL and loads it into PyMuPDF.
    :param url: URL of the PDF file
    :return: PyMuPDF Document
    """
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return fitz.open(stream=response.content, filetype="pdf")
        else:
            raise Exception(f"Failed to fetch PDF! Status code: {response.status_code}")
    except Exception as e:
        print(f"Error fetching PDF: {e}")
        return None

def pdf_to_images(pdf_url, chapter_no, subject_name, classno, bookname):
    """
    Converts all pages of a PDF (fetched from URL) to images and uploads them to Appwrite.

    :param pdf_url: URL of the PDF file
    :param chapter_no: Chapter number
    :param subject_name: Subject name
    :param classno: Class number
    :param bookname: Book name
    :return: List of file information for uploaded images
    """
    try:
        # Fetch the PDF
        doc = fetch_pdf(pdf_url)
        if not doc:
            return None
        uploaded_files = []
        print(f"\nProcessing PDF with {len(doc)} pages...")
        async def process_pages():
            for page_number in range(len(doc)):
                try:
                    page = doc[page_number]
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    temp_image_path = f"temp_page_{page_number + 1}.png"
                    img.save(temp_image_path, format="PNG", quality=95)
                    with open(temp_image_path, "rb") as f:
                        file_bytes = f.read()
                    filename = f"{bookname}_class{classno}_{subject_name}_ch{chapter_no}_page{page_number + 1}.png"
                    # Upload to Appwrite
                    upload_result = await add_file((file_bytes, filename))
                    file_id = upload_result['$id']
                    direct_link = await get_file_url(file_id, mode="view")
                    uploaded_files.append({
                        'file_id': file_id,
                        'filename': filename,
                        'direct_link': direct_link
                    })
                    if os.path.exists(temp_image_path):
                        os.remove(temp_image_path)
                except Exception as e:
                    print(f"Error processing page {page_number + 1}: {e}")
                    continue
        asyncio.run(process_pages())
        print(f"\nAll pages processed! {len(uploaded_files)} images uploaded successfully!")
        return uploaded_files
    except Exception as e:
        print(f"Error: {e}")
        return None

async def search_files_by_initials(initials, mode="view"):
    """
    Search for files by their filename initials and display their links.
    
    :param initials: The starting characters of the filename to search for
    :param mode: Access mode ("view" or "download")
    :return: List of matching files with their links
    """
    try:
        print(f"\nSearching for files starting with '{initials}'...")
        
        # Get all files matching the initials
        matching_files = await get_files_by_initials(initials, mode)
        
        if not matching_files:
            print(f"No files found starting with '{initials}'")
            return None
            
        print(f"\nFound {len(matching_files)} file(s) matching '{initials}':")
        print("-" * 80)
        
        for i, file_info in enumerate(matching_files, 1):
            print(f"{i}. Filename: {file_info['filename']}")
            print(f"   File ID: {file_info['file_id']}")
            print(f"   Size: {file_info['size']} bytes")
            print(f"   Created: {file_info['created_at']}")
            print(f"   URL: {file_info['url']}")
            print()
            
        return matching_files
        
    except Exception as e:
        print(f"Error searching files: {e}")
        return None

async def get_first_file_link_by_initials(initials, mode="view"):
    """
    Get the first file link that matches the given filename initials.
    
    :param initials: The starting characters of the filename to search for
    :param mode: Access mode ("view" or "download")
    :return: URL of the first matching file or None
    """
    try:
        print(f"\nSearching for first file starting with '{initials}'...")
        
        # Get the first file link matching the initials
        file_url = await get_file_link_by_name_initials(initials, mode)
        
        if file_url:
            print(f"✅ Found file: {file_url}")
            return file_url
        else:
            print(f"❌ No file found starting with '{initials}'")
            return None
            
    except Exception as e:
        print(f"Error getting file link: {e}")
        return None

async def search_files_by_pattern(pattern, pattern_type="startsWith", mode="view"):
    """
    Search for files using different pattern matching types.
    
    :param pattern: The pattern to search for in filenames
    :param pattern_type: Type of pattern matching ("startsWith", "endsWith", "contains", "equal")
    :param mode: Access mode ("view" or "download")
    :return: List of matching files with their links
    """
    try:
        print(f"\nSearching for files using pattern '{pattern}' with type '{pattern_type}'...")
        
        # Get all files matching the pattern
        matching_files = await get_files_by_pattern(pattern, pattern_type, mode)
        
        if not matching_files:
            print(f"No files found matching pattern '{pattern}' with type '{pattern_type}'")
            return None
            
        print(f"\nFound {len(matching_files)} file(s) matching pattern '{pattern}':")
        print("-" * 80)
        
        for i, file_info in enumerate(matching_files, 1):
            print(f"{i}. Filename: {file_info['filename']}")
            print(f"   File ID: {file_info['file_id']}")
            print(f"   Size: {file_info['size']} bytes")
            print(f"   Created: {file_info['created_at']}")
            print(f"   URL: {file_info['url']}")
            print()
            
        return matching_files
        
    except Exception as e:
        print(f"Error searching files by pattern: {e}")
        return None

async def search_files_by_size_range(min_size=None, max_size=None, mode="view"):
    """
    Search for files by size range.
    
    :param min_size: Minimum file size in bytes (optional)
    :param max_size: Maximum file size in bytes (optional)
    :param mode: Access mode ("view" or "download")
    :return: List of matching files with their links
    """
    try:
        size_desc = ""
        if min_size and max_size:
            size_desc = f"between {min_size} and {max_size} bytes"
        elif min_size:
            size_desc = f"larger than {min_size} bytes"
        elif max_size:
            size_desc = f"smaller than {max_size} bytes"
        else:
            size_desc = "with any size"
            
        print(f"\nSearching for files {size_desc}...")
        
        # Get all files matching the size range
        matching_files = await get_files_by_size_range(min_size, max_size, mode)
        
        if not matching_files:
            print(f"No files found {size_desc}")
            return None
            
        print(f"\nFound {len(matching_files)} file(s) {size_desc}:")
        print("-" * 80)
        
        for i, file_info in enumerate(matching_files, 1):
            print(f"{i}. Filename: {file_info['filename']}")
            print(f"   File ID: {file_info['file_id']}")
            print(f"   Size: {file_info['size']} bytes ({file_info['size'] / 1024:.1f} KB)")
            print(f"   Created: {file_info['created_at']}")
            print(f"   URL: {file_info['url']}")
            print()
            
        return matching_files
        
    except Exception as e:
        print(f"Error searching files by size: {e}")
        return None

def get_size_input(prompt):
    """
    Helper function to get size input from user with unit conversion.
    
    :param prompt: The prompt to display to the user
    :return: Size in bytes or None
    """
    try:
        size_input = input(prompt).strip()
        if not size_input:
            return None
            
        # Check for unit suffixes
        if size_input.lower().endswith('kb'):
            return int(float(size_input[:-2]) * 1024)
        elif size_input.lower().endswith('mb'):
            return int(float(size_input[:-2]) * 1024 * 1024)
        elif size_input.lower().endswith('gb'):
            return int(float(size_input[:-2]) * 1024 * 1024 * 1024)
        else:
            return int(size_input)
    except ValueError:
        print("Invalid size format. Please use numbers with optional units (KB, MB, GB)")
        return None

async def find_duplicate_files(mode="view"):
    """
    Find files with duplicate names in the storage.
    
    :param mode: Access mode ("view" or "download")
    :return: Dictionary containing duplicate files grouped by filename
    """
    try:
        print(f"\nSearching for duplicate files...")
        
        # Get all files from storage (we'll use a broad search)
        from appwrite_store import get_files_with_query
        
        # Get all files without any filters
        all_files = await get_files_with_query([], mode)
        
        if not all_files:
            print("No files found in storage")
            return None
        
        # Group files by filename
        filename_groups = {}
        for file_info in all_files:
            filename = file_info['filename']
            if filename not in filename_groups:
                filename_groups[filename] = []
            filename_groups[filename].append(file_info)
        
        # Find duplicates (files with same name but different IDs)
        duplicates = {filename: files for filename, files in filename_groups.items() if len(files) > 1}
        
        if not duplicates:
            print("✅ No duplicate files found")
            return None
        
        print(f"\n🔍 Found {len(duplicates)} filename(s) with duplicates:")
        print("=" * 80)
        
        total_duplicates = 0
        for filename, files in duplicates.items():
            total_duplicates += len(files)
            print(f"\n📁 Filename: {filename}")
            print(f"   Duplicates: {len(files)} files")
            print("   " + "-" * 70)
            
            for i, file_info in enumerate(files, 1):
                print(f"   {i}. File ID: {file_info['file_id']}")
                print(f"      Size: {file_info['size']} bytes ({file_info['size'] / 1024:.1f} KB)")
                print(f"      Created: {file_info['created_at']}")
                print(f"      URL: {file_info['url']}")
                print()
        
        print(f"📊 Summary: {total_duplicates} total files across {len(duplicates)} duplicate filename(s)")
        return duplicates
        
    except Exception as e:
        print(f"Error finding duplicate files: {e}")
        return None

async def search_files_with_duplicates_info(search_func, *args, **kwargs):
    """
    Wrapper function to add duplicate information to search results.
    
    :param search_func: The search function to wrap
    :param args: Arguments to pass to the search function
    :param kwargs: Keyword arguments to pass to the search function
    :return: Search results with duplicate information
    """
    try:
        # Get the search results
        results = await search_func(*args, **kwargs)
        
        if not results:
            return None
        
        # Get all files to check for duplicates
        from appwrite_store import get_files_with_query
        all_files = await get_files_with_query([], kwargs.get('mode', 'view'))
        
        if not all_files:
            return results
        
        # Create a mapping of filename to file count
        filename_counts = {}
        for file_info in all_files:
            filename = file_info['filename']
            filename_counts[filename] = filename_counts.get(filename, 0) + 1
        
        # Add duplicate information to results
        print(f"\n🔍 Duplicate Analysis:")
        print("-" * 40)
        
        duplicates_found = False
        for file_info in results:
            filename = file_info['filename']
            count = filename_counts.get(filename, 1)
            
            if count > 1:
                print(f"⚠️  '{filename}' has {count} duplicates")
                duplicates_found = True
        
        if not duplicates_found:
            print("✅ No duplicates found in search results")
        
        return results
        
    except Exception as e:
        print(f"Error checking for duplicates: {e}")
        return results

# Main execution
def main():
    print("=== NCERT PDF to Image Converter & Advanced File Search ===\n")
    
    while True:
        print("\nChoose an option:")
        print("1. Convert PDF to images and upload")
        print("2. Search files by filename initials")
        print("3. Get first file link by initials")
        print("4. Advanced pattern search")
        print("5. Search files by size range")
        print("6. Find duplicate files")
        print("7. Search with duplicate detection")
        print("8. Exit")
        
        try:
            choice = input("\nEnter your choice (1-8): ").strip()
            
            if choice == "1":
                # Original PDF conversion functionality
                convert_pdf_to_images()
            elif choice == "2":
                # Search files by initials
                initials = input("Enter filename initials to search for: ").strip()
                if initials:
                    mode = input("Enter access mode (view/download) [default: view]: ").strip().lower()
                    if mode not in ["view", "download"]:
                        mode = "view"
                    asyncio.run(search_files_by_initials(initials, mode))
                else:
                    print("Please enter valid initials!")
            elif choice == "3":
                # Get first file link by initials
                initials = input("Enter filename initials to get first file link: ").strip()
                if initials:
                    mode = input("Enter access mode (view/download) [default: view]: ").strip().lower()
                    if mode not in ["view", "download"]:
                        mode = "view"
                    asyncio.run(get_first_file_link_by_initials(initials, mode))
                else:
                    print("Please enter valid initials!")
            elif choice == "4":
                # Advanced pattern search
                pattern = input("Enter pattern to search for: ").strip()
                if pattern:
                    print("\nPattern types:")
                    print("1. startsWith - Files starting with pattern")
                    print("2. endsWith - Files ending with pattern")
                    print("3. contains - Files containing pattern")
                    print("4. equal - Files with exact name match")
                    
                    pattern_choice = input("Choose pattern type (1-4) [default: 1]: ").strip()
                    pattern_types = {
                        "1": "startsWith",
                        "2": "endsWith", 
                        "3": "contains",
                        "4": "equal"
                    }
                    pattern_type = pattern_types.get(pattern_choice, "startsWith")
                    
                    mode = input("Enter access mode (view/download) [default: view]: ").strip().lower()
                    if mode not in ["view", "download"]:
                        mode = "view"
                    
                    asyncio.run(search_files_by_pattern(pattern, pattern_type, mode))
                else:
                    print("Please enter a valid pattern!")
            elif choice == "5":
                # Search files by size range
                print("\nEnter size range (you can use KB, MB, GB units):")
                print("Examples: 1024, 5KB, 2.5MB, 1GB")
                
                min_size = get_size_input("Enter minimum size (press Enter to skip): ")
                max_size = get_size_input("Enter maximum size (press Enter to skip): ")
                
                if min_size is None and max_size is None:
                    print("At least one size limit must be specified!")
                    continue
                
                mode = input("Enter access mode (view/download) [default: view]: ").strip().lower()
                if mode not in ["view", "download"]:
                    mode = "view"
                
                asyncio.run(search_files_by_size_range(min_size, max_size, mode))
            elif choice == "6":
                # Find duplicate files
                mode = input("Enter access mode (view/download) [default: view]: ").strip().lower()
                if mode not in ["view", "download"]:
                    mode = "view"
                asyncio.run(find_duplicate_files(mode))
            elif choice == "7":
                # Search with duplicate detection
                print("\nSearch with duplicate detection:")
                print("1. Search by initials with duplicate info")
                print("2. Pattern search with duplicate info")
                
                sub_choice = input("Choose search type (1-2): ").strip()
                
                if sub_choice == "1":
                    initials = input("Enter filename initials to search for: ").strip()
                    if initials:
                        mode = input("Enter access mode (view/download) [default: view]: ").strip().lower()
                        if mode not in ["view", "download"]:
                            mode = "view"
                        asyncio.run(search_files_with_duplicates_info(search_files_by_initials, initials, mode=mode))
                    else:
                        print("Please enter valid initials!")
                elif sub_choice == "2":
                    pattern = input("Enter pattern to search for: ").strip()
                    if pattern:
                        print("\nPattern types:")
                        print("1. startsWith - Files starting with pattern")
                        print("2. endsWith - Files ending with pattern")
                        print("3. contains - Files containing pattern")
                        print("4. equal - Files with exact name match")
                        
                        pattern_choice = input("Choose pattern type (1-4) [default: 1]: ").strip()
                        pattern_types = {
                            "1": "startsWith",
                            "2": "endsWith", 
                            "3": "contains",
                            "4": "equal"
                        }
                        pattern_type = pattern_types.get(pattern_choice, "startsWith")
                        
                        mode = input("Enter access mode (view/download) [default: view]: ").strip().lower()
                        if mode not in ["view", "download"]:
                            mode = "view"
                        
                        asyncio.run(search_files_with_duplicates_info(search_files_by_pattern, pattern, pattern_type, mode=mode))
                    else:
                        print("Please enter a valid pattern!")
                else:
                    print("Invalid choice!")
            elif choice == "8":
                print("Exiting...")
                break
            else:
                print("Invalid choice! Please enter 1-8.")
                
        except KeyboardInterrupt:
            print("\n\nProcess interrupted by user.")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")

def convert_pdf_to_images():
    """
    Original PDF conversion functionality separated into its own function.
    """
    print("\n=== PDF to Image Conversion ===\n")

    classno = input("Enter the class number: ")
    subject_name = input("Enter the subject name: ")
    subj_code = input("Enter the subject code: ")
    bookname = input("Enter the book name: ")

    while True:
        try:
            chapter = int(input("\nEnter the chapter number (or 0 to exit): "))

            if chapter == 0:
                print("Returning to main menu...")
                break

            # Construct PDF URL based on chapter number
            if len(str(chapter)) == 1:
                pdf_url = f"https://ncert.nic.in/textbook/pdf/{subj_code}10{chapter}.pdf"
            else:
                pdf_url = f"https://ncert.nic.in/textbook/pdf/{subj_code}1{chapter}.pdf"

            print(f"\nProcessing Chapter {chapter}...")
            print(f"PDF URL: {pdf_url}")

            # Process all pages in the PDF
            uploaded_files = pdf_to_images(pdf_url, chapter, subject_name, classno, bookname)

            if uploaded_files:
                print(f"\n✅ Chapter {chapter} processed successfully!")
                print(f"Total images uploaded: {len(uploaded_files)}")
                print("\nDirect download links:")
                for i, file_info in enumerate(uploaded_files, 1):
                    print(f"{file_info['direct_link']}")
            else:
                print(f"❌ Failed to process Chapter {chapter}")

        except ValueError:
            print("Please enter a valid chapter number!")
        except KeyboardInterrupt:
            print("\n\nReturning to main menu...")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()