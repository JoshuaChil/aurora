from fastapi import FastAPI
from pydantic import BaseModel
from Aurora_BackEnd import find_quote_and_author
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace '*' with specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserFeelingRequest(BaseModel):
    input: str  # The field we expect from the request body


app.add_middleware(
    CORSMiddleware,
    allow_origins=[""],  # You can also specify specific domains here
    allow_credentials=True,
    allow_methods=[""],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Quote API"}

@app.post("/")
async def process_post(request: UserFeelingRequest):
    # Now the feeling comes from the body as `request.input`
    print(request.input)
    user_feeling = request.input
    quote_author = find_quote_and_author(user_feeling)
    quote_author[1] =  "Unknown" if type(quote_author[1]) != str else quote_author[1]
    print(quote_author)
    return {"quote": quote_author[0], "author": quote_author[1]}
