
def load_sentences_from_csv(csv_path):
    df = pd.read_csv(csv_path)
    quotes =df['Quote'].tolist()
    authors = df['Author'].tolist()
    sentences = [quotes[x] + " -" + authors[x] for x in range(len(quotes))]
    return sentences

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import pandas as pd
def create_vector_store(sentences, embedding_function):
    return FAISS.from_texts(sentences, embedding_function)

csv_path = "MotivationalQuotes.csv"
sentences = load_sentences_from_csv(csv_path)


embedding_function = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

vector_store = create_vector_store(sentences, embedding_function)


def find_most_related_sentence(query, vector_store, top_k=1):
    docs = vector_store.similarity_search(query, k=top_k)
    return [doc.page_content for doc in docs] 

import requests
import json


api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
api_key = #insert Gemini API Key Here


def gemini_quote_retrieval(query, related_sentences):
 headers = {
     "Content-Type": "application/json"
 }
 payload = {
     "contents": [{
         "parts": [{"text": f"""Someone is going through a distressing/sad situation:{query}
 Only restate the best (avoid offending this person) out of the following quotes to uplift the person, in bold, with no explanation: {str(related_sentences)}
    Include the author with the quote in the same manner given, e.g quote - Author"""}]
     }]
 }


 response = requests.post(
     url=f"{api_url}?key={api_key}",
     headers=headers,
     data=json.dumps(payload)
 )


 if response.status_code == 200:
     return response.json()
 else:
     print(f"Request faileSd with status code {response.status_code}")
     print("Error:", response.text)


def find_quote_and_author(query):
  quote_author = []
  related_sentences = find_most_related_sentence(query, vector_store, top_k=20)
  quote = gemini_quote_retrieval(query,related_sentences)['candidates'][0]['content']['parts'][0]['text']
  quote = quote.replace("**","").strip()
  
  quote, author = quote.split(" -")
  quote = quote.replace('"','')
  author = author.replace('"','')

  quote_author.append(quote)
  quote_author.append(author)
  return quote_author

