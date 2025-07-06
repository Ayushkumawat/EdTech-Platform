import os
import fitz  # PyMuPDF
import requests
from PIL import Image
from google.oauth2.service_account import Credentials
import io
import asyncio
from appwrite_store import add_file, get_file_url

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

# Main execution
def main():
    print("=== NCERT PDF to image Converter ===\n")

    classno = input("Enter the class number: ")
    subject_name = input("Enter the subject name: ")
    subj_code = input("Enter the subject code: ")
    bookname = input("Enter the book name: ")

    while True:
        try:
            chapter = int(input("\nEnter the chapter number (or 0 to exit): "))

            if chapter == 0:
                print("Exiting...")
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
            print("\n\nProcess interrupted by user.")
            break
        except Exception as e:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()