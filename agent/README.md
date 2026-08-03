# AI Agent Backend

This folder contains the AI Agent backend for the Placement Portal, built with Python and FastAPI. It integrates with Anthropic's SDK to handle resume parsing, company research, and interview prep.

## How to Run (For Team Members)

You don't need to manually configure Python virtual environments. Just follow these steps:

1. Open a terminal in this `agent` folder.
2. Double-click the `run.bat` file OR type `run.bat` in the terminal and press Enter.

The script will automatically:
- Create a virtual environment (`venv`)
- Install all necessary dependencies from `requirements.txt`
- Create an `.env` file from `.env.example`
- Start the FastAPI server on `http://127.0.0.1:8000`

### API Documentation
Once the server is running, you can view the interactive API documentation (Swagger UI) by visiting:
**[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

## Environment Variables

Make sure to add your actual Anthropic API key to the `.env` file once it is generated.

```env
ANTHROPIC_API_KEY=your_real_key_here
```

## Adding New Dependencies

If you write new code that requires a new python package, install it using `pip` and then update the `requirements.txt`:
```bash
venv\Scripts\activate
pip install <package-name>
pip freeze > requirements.txt
```
