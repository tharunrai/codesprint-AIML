"""File processing utilities, including PDF text extraction."""

import io
from pypdf import PdfReader


class FileProcessingError(ValueError):
    """Raised when file reading or text extraction fails."""

    pass


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract plain text from PDF file bytes using pypdf.

    Args:
        file_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        str: Extracted plain text content.

    Raises:
        FileProcessingError: If PDF cannot be read or contains no extractable text.
    """
    if not file_bytes:
        raise FileProcessingError("Uploaded PDF file is empty.")

    try:
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)

        text_pages = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_pages.append(page_text.strip())

        full_text = "\n".join(text_pages).strip()
        if not full_text:
            raise FileProcessingError(
                "No extractable text found in PDF (scanned or image-based PDFs are not supported)."
            )

        return full_text
    except Exception as exc:
        if isinstance(exc, FileProcessingError):
            raise
        raise FileProcessingError(f"Failed to parse PDF document: {exc}") from exc
