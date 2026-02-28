Job Tracker — Backend
FastAPI backend for the Job Tracker application.

Project Structure
backend/
├── app/
│   ├── config.py        # Environment variables
│   ├── database.py      # SQLAlchemy engine + session
│   ├── models.py        # Database models
│   └── routers/
│       └── health.py    # Health check endpoint
├── main.py              # App entry point
├── requirements.txt     # Dependencies
├── .env                 # Your local env variables (not committed)
└── .env.example         # Template for .env

Setup
1. Create and activate virtual environment
bashcd backend
python -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
2. Install dependencies
bashpip install -r requirements.txt
3. Set up environment variables
bashcp .env.example .env
4. Run the server
bashuvicorn main:app --reload
Server runs at: http://localhost:8000

Endpoints
MethodRouteDescriptionGET/healthHealth check
Interactive API docs available at: http://localhost:8000/docs

Environment Variables
VariableDefaultDescriptionDATABASE_URLsqlite:///./app.dbSQLite database pathFRONTEND_ORIGINhttp://localhost:5173Allowed CORS origin
